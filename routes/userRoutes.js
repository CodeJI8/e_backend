import { Router } from "express";
import {
  getProfile,
  editProfile,
  deleteprofile,
} from "../controllers/usersController.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.patch("/profile", authMiddleware, editProfile);
router.delete("/profile", authMiddleware, deleteprofile);

export default router;