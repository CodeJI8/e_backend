import "dotenv/config";
import express from "express";
import { register, login } from "./controllers/authController.js";
import {  getMe } from "./controllers/usersController.js";
import authMiddleware from "./middleware/auth.middleware.js";


const app = express();
app.use(express.json());
app.use(authMiddleware);

// app.get("/", (req, res) => res.json({ status: "the site online" }));
app.post("/login", login);
app.post("/register",register);
app.get("/me", authMiddleware,  getMe);

app.listen(process.env.PORT || 5000, () => console.log("Server running"));