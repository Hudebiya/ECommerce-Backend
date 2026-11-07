import express from "express";
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus } from "../controllers/order.controller.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticateToken, createOrder);
router.get("/my", authenticateToken, getMyOrders);
router.get("/", authenticateToken, requireAdmin, getAllOrders);
router.patch("/:id/status", authenticateToken, requireAdmin, updateOrderStatus);

export default router;
