import express from "express";
import { chatWithApi } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/chat", chatWithApi);

export default router;