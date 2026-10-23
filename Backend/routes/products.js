import express from "express";
import Product from "../models/Product.model.js";

const router = express.Router();

// GET /api/products  (saare products)
router.get("/", async (req, res) => {
  const products = await Product.find().sort({ id: 1 });
  res.json({ products });
});

// POST /api/products/import  
router.post("/import", async (req, res) => {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=100");
    const data = await response.json();

    await Product.deleteMany({});
    await Product.insertMany(data.products);

    res.json({ message: `${data.products.length} products imported` });
  } catch (err) {
    res.status(500).json({ message: "Import failed", error: err.message });
  }
});

// GET /api/products/category/:category
router.get("/category/:category", async (req, res) => {
  const products = await Product.find({ category: req.params.category });
  res.json({ products });
});

// GET /api/products/:id  (ek product)
router.get("/:id", async (req, res) => {
  const product = await Product.findOne({ id: Number(req.params.id) });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

export default router;