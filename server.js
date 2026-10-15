import "dotenv/config";
import express from "express";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ status: "the site online" });
});

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", passwordResetRoutes);
app.use("/categories", categoryRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});