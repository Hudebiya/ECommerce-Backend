import "dotenv/config";
import mongoose from "mongoose";
import productModel from "./src/models/Products.model.js";

const args = process.argv.slice(2);
const confirm = args.length === 1 && args[0] === "--confirm";
const seedProductFilter = {
    $or: [
        { image: { $exists: false } },
        { image: null },
        { image: { $not: /ik\.imagekit\.io/ } },
    ],
};

if (args.length > 0 && !confirm) {
    console.error("Usage: node cleanupSeedProducts.js [--confirm]");
    process.exitCode = 1;
} else {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const totalCount = await productModel.countDocuments();
        const protectedCount = await productModel.countDocuments({
            image: /ik\.imagekit\.io/,
        });
        const seedProducts = await productModel
            .find(seedProductFilter)
            .sort({ _id: 1 })
            .select({ _id: 1 })
            .lean();
        const deleteIds = seedProducts.slice(27).map(({ _id }) => _id);

        console.log(`Total products: ${totalCount}`);
        console.log(`Protected ImageKit products: ${protectedCount}`);
        console.log(`Seed products: ${seedProducts.length}`);
        console.log(`Would delete: ${deleteIds.length}`);

        if (confirm) {
            if (deleteIds.length > 0) {
                const result = await productModel.deleteMany({
                    _id: { $in: deleteIds },
                    ...seedProductFilter,
                });
                console.log(`Deleted: ${result.deletedCount}`);
            }
            console.log(`New total products: ${await productModel.countDocuments()}`);
        }
    } catch (error) {
        console.error("Unable to clean up seed products:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}
