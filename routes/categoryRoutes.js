import { Router } from "express";
import {
  createCategory,
  editCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/", authMiddleware,  upload.single("image"),  createCategory);
router.patch("/:id", authMiddleware, editCategory);
router.delete("/:id", authMiddleware, deleteCategory);

export default router;