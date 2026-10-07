import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "Ecommerrce site online" }));

app.listen(process.env.PORT || 5000, () => console.log("Server running"));