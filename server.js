import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "the site online" }));
app.get("/login", (req, res) => res.json({ status: "this is for login" }));
app.get("/register", (req, res) => res.json({ status: "this is for register" }));

app.listen(process.env.PORT || 5000, () => console.log("Server running"));