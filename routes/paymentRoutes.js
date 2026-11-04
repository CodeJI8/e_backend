
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { createCheckoutSession, webhookController } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/checkout/:orderId", authMiddleware, createCheckoutSession);
router.post("/webhook", webhookController);

export default router;
