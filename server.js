import "dotenv/config";
import express from "express";
import { register, login } from "./controllers/authController.js";


const app = express();
app.use(express.json());

// app.get("/", (req, res) => res.json({ status: "the site online" }));
app.post("/login", login);
app.post("/register",register);


app.listen(process.env.PORT || 5000, () => console.log("Server running"));