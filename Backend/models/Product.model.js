import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    title: String,
    description: String,
    category: String,
    price: Number,
    discountPercentage: Number,
    rating: Number,
    stock: Number,
    brand: String,
    thumbnail: String,
    images: [String],
    shippingInformation: String,
    warrantyInformation: String,
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);