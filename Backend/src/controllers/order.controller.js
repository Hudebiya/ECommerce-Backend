import mongoose from "mongoose";
import orderModel from "../models/Orders.model.js";
import productModel from "../models/Products.model.js";
import userModel from "../models/users.model.js";

function isValidShippingAddress(shippingAddress) {
    return ["name", "phone", "address", "city"].every(
        field => typeof shippingAddress?.[field] === "string" && shippingAddress[field].trim()
    )
}

async function createOrder(req, res) {
    try {
        const body = req.body ?? {};
        const user = await userModel.findById(req.user.id).select("cart");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!isValidShippingAddress(body.shippingAddress)) {
            return res.status(400).json({ message: "A valid shipping address is required" });
        }
        if (!user.cart.length) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const quantities = new Map();
        for (const cartItem of user.cart) {
            const productId = cartItem.product?.toString();
            if (!productId || !mongoose.Types.ObjectId.isValid(productId) ||
                !Number.isSafeInteger(cartItem.quantity) || cartItem.quantity < 1) {
                return res.status(400).json({ message: "Cart contains an invalid product or quantity" });
            }
            const quantity = (quantities.get(productId) || 0) + cartItem.quantity;
            if (!Number.isSafeInteger(quantity)) {
                return res.status(400).json({ message: "Cart contains an invalid product quantity" });
            }
            quantities.set(productId, quantity);
        }

        const products = await productModel.find({
            _id: { $in: [...quantities.keys()] }
        }).select("name price image stock").lean();
        const productsById = new Map(products.map(product => [product._id.toString(), product]));
        const items = [];
        for (const [productId, quantity] of quantities) {
            const product = productsById.get(productId);
            if (!product) {
                return res.status(404).json({ message: `Product ${productId} was not found` });
            }
            if (!Number.isSafeInteger(product.stock) || product.stock < quantity) {
                return res.status(409).json({ message: `Insufficient stock for ${product.name}` });
            }
            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.image
            });
        }

        const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
        const order = await orderModel.create({
            user: user._id,
            items,
            totalAmount,
            shippingAddress: Object.fromEntries(
                ["name", "phone", "address", "city"].map(field => [
                    field,
                    body.shippingAddress[field].trim()
                ])
            )
        });

        return res.status(201).json({ message: "Order created", order });
    } catch {
        console.error("Failed to create order");
        return res.status(500).json({ message: "Failed to create order" });
    }
}

async function getMyOrders(req, res) {
    try {
        const orders = await orderModel.find({ user: req.user.id }).sort({ createdAt: -1 });
        return res.status(200).json({ orders });
    } catch {
        console.error("Failed to fetch user orders");
        return res.status(500).json({ message: "Failed to fetch orders" });
    }
}

async function getAllOrders(_req, res) {
    try {
        const orders = await orderModel.find()
            .sort({ createdAt: -1 })
            .populate("user", "username email");
        return res.status(200).json({ orders });
    } catch {
        console.error("Failed to fetch all orders");
        return res.status(500).json({ message: "Failed to fetch orders" });
    }
}

async function restoreStock(decrementedItems) {
    const rollbackErrors = [];
    for (const item of decrementedItems) {
        try {
            const result = await productModel.updateOne(
                { _id: item.product },
                { $inc: { stock: item.quantity } }
            );
            if (result.matchedCount !== 1) {
                rollbackErrors.push(new Error(`Product ${item.product} no longer exists`));
            }
        } catch (error) {
            rollbackErrors.push(error);
        }
    }
    return rollbackErrors;
}

async function updateOrderStatus(req, res) {
    const { id } = req.params;
    const { status, declineReason } = req.body ?? {};
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Order Id" });
    }
    if (status !== "accepted" && status !== "declined") {
        return res.status(400).json({ message: "Status must be accepted or declined" });
    }
    if (declineReason !== undefined && typeof declineReason !== "string") {
        return res.status(400).json({ message: "Decline reason must be a string" });
    }

    const decrementedItems = [];
    try {
        const order = await orderModel.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "pending") {
            return res.status(409).json({ message: "Only pending orders can be updated" });
        }

        if (status === "declined") {
            const declinedOrder = await orderModel.findOneAndUpdate(
                { _id: id, status: "pending" },
                {
                    $set: { status, declineReason: declineReason?.trim() || undefined }
                },
                { new: true, runValidators: true }
            );
            if (!declinedOrder) {
                return res.status(409).json({ message: "Only pending orders can be updated" });
            }
            return res.status(200).json({ message: "Order declined", order: declinedOrder });
        }

        for (const item of order.items) {
            const product = await productModel.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
            if (!product) {
                const rollbackErrors = await restoreStock(decrementedItems);
                if (rollbackErrors.length) {
                    console.error("Failed to restore stock after order acceptance failed");
                    return res.status(500).json({ message: "Unable to restore inventory; contact support" });
                }
                return res.status(409).json({ message: `Insufficient stock for ${item.name}` });
            }
            decrementedItems.push({ product: item.product, quantity: item.quantity });
        }

        const acceptedOrder = await orderModel.findOneAndUpdate(
            { _id: id, status: "pending" },
            { $set: { status: "accepted" }, $unset: { declineReason: 1 } },
            { new: true, runValidators: true }
        );
        if (!acceptedOrder) {
            const rollbackErrors = await restoreStock(decrementedItems);
            if (rollbackErrors.length) {
                console.error("Failed to restore stock after order status changed");
                return res.status(500).json({ message: "Unable to restore inventory; contact support" });
            }
            return res.status(409).json({ message: "Only pending orders can be updated" });
        }

        return res.status(200).json({ message: "Order accepted", order: acceptedOrder });
    } catch (error) {
        if (decrementedItems.length) {
            const rollbackErrors = await restoreStock(decrementedItems);
            if (rollbackErrors.length) {
                console.error("Failed to restore stock after order acceptance error");
                return res.status(500).json({ message: "Unable to restore inventory; contact support" });
            }
        }
        console.error("Failed to update order status");
        return res.status(500).json({ message: "Failed to update order status" });
    }
}

export { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
