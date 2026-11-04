import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {

    AddCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.patch("/", authMiddleware, AddCart);

export default router;
