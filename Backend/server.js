import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import productRoutes from "./routes/products.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected:", mongoose.connection.host, "/", mongoose.connection.name);
    app.listen(PORT, () =>
      console.log(`Server chal raha hai: http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.log(err));