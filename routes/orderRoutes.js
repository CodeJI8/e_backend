import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { Addorder, getOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", authMiddleware, Addorder);
router.get("/", authMiddleware, getOrders);

export default router;