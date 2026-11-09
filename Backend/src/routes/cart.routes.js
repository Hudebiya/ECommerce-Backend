import express from "express";
import { addToCart, getCart, updateCartItem, removeFromCart } from "../controllers/cart.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import e from "express";

const router = express.Router()

router.post("/items",authenticateToken,addToCart)
router.patch("/items/:productId",authenticateToken,updateCartItem)
router.delete("/items/:productId",authenticateToken,removeFromCart)
router.get("/",authenticateToken,getCart)

export default router