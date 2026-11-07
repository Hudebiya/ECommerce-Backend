import "dotenv/config";
import mongoose from "mongoose";

try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await mongoose.connection.collection("products").updateMany(
        { stock: { $exists: false } },
        { $set: { stock: 50 } }
    );
    console.log(result.modifiedCount);
} catch {
    console.error("Product stock migration failed.");
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
