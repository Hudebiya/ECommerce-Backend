import express from "express";
import { addToCart, getCart } from "../controllers/cart.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import e from "express";

const router = express.Router()

router.post("/items",authenticateToken,addToCart)
router.get("/",authenticateToken,getCart)

export default router