import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/products.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// downloaded product images serve karne ke liye
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected:", mongoose.connection.host, "/", mongoose.connection.name);
    app.listen(PORT, () =>
      console.log(`Server is connected: http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(err));