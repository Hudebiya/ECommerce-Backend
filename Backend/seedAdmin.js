import "dotenv/config";
import mongoose from "mongoose";
import userModel from "./src/models/users.model.js";
import bcrypt from "bcryptjs";

const [username, email, password, ...extraArgs] = process.argv.slice(2);

if (!username || !email || !password || extraArgs.length > 0) {
    console.error("Usage: node seedAdmin.js <username> <email> <password>");
    process.exitCode = 1;
} else {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            existingUser.role = "admin";
            await existingUser.save();
            console.log(`Promoted ${email} to admin.`);
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await userModel.create({
                username,
                email,
                password: hashedPassword,
                role: "admin",
            });
            console.log(`Created admin user ${email}.`);
        }
    } catch (error) {
        console.error("Unable to seed admin user:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}
