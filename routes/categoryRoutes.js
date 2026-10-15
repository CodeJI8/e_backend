import { Router } from "express";
import {
  createCategory,
  editCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createCategory);
router.patch("/:id", authMiddleware, editCategory);
router.delete("/:id", authMiddleware, deleteCategory);

export default router;