import mongoose from "mongoose";
import productModel from "../models/Products.model.js";
import userModel from "../models/users.model.js";

function calculateCartTotal(cart) {
    if (cart.some(item => !Number.isFinite(item.product?.price))) {
        return null
    }
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
}

async function addToCart(req, res) {
    try {
        const { productId } = req.body
        const quantity = req.body.quantity === undefined ? 1 : req.body.quantity

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" })
        }
        if (!Number.isSafeInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be a positive safe integer" })
        }
        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(400).json({ message: "Product not found" })

        }
        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const cartItem = user.cart.find(item => item.product.toString() === productId)
        if (cartItem) {
            if (!Number.isSafeInteger(cartItem.quantity + quantity)) {
                return res.status(400).json({ message: "Cart quantity exceeds the maximum safe integer" })
            }
            cartItem.quantity += quantity
        } else {
            user.cart.push({ product: productId, quantity })
        }
        await user.save()

        const updatedUser = await userModel.findById(user._id).select("cart").populate("cart.product", "name price image stock category brand")

        return res.status(200).json({ message: "Product Added to cart", cart: updatedUser.cart, totalPrice: calculateCartTotal(updatedUser.cart) })

    } catch (error) {
        return res.status(400).json({ message: "Failed to Add to cart", error: error.message })
    }
}

async function getCart(req, res) {
    const user = await userModel.findById(req.user.id).select("cart").populate("cart.product", "name price image stock category brand")
    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }
    return res.status(200).json({ cart: user.cart, totalPrice: calculateCartTotal(user.cart) })

}

async function updateCartItem(req, res) {
    try {
        const { productId } = req.params
        const quantity = req.body.quantity

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" })
        }
        if (!Number.isSafeInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be a positive safe integer" })
        }

        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const cartItem = user.cart.find(item => item.product.toString() === productId)
        if (!cartItem) {
            return res.status(404).json({ message: "Product not found in cart" })
        }

        cartItem.quantity = quantity
        await user.save()

        const updatedUser = await userModel.findById(user._id).select("cart").populate("cart.product", "name price image stock category brand")
        return res.status(200).json({ message: "Cart item quantity updated", cart: updatedUser.cart, totalPrice: calculateCartTotal(updatedUser.cart) })
    } catch (error) {
        return res.status(400).json({ message: "Failed to update cart", error: error.message })
    }
}

async function removeFromCart(req, res) {
    try {
        const { productId } = req.params
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" })
        }

        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        user.cart = user.cart.filter(item => item.product.toString() !== productId)
        await user.save()

        const updatedUser = await userModel.findById(user._id).select("cart").populate("cart.product", "name price image stock category brand")
        return res.status(200).json({ message: "Product removed from cart", cart: updatedUser.cart, totalPrice: calculateCartTotal(updatedUser.cart) })
    } catch (error) {
        return res.status(400).json({ message: "Failed to remove from cart", error: error.message })
    }
}

export { addToCart, getCart, updateCartItem, removeFromCart }