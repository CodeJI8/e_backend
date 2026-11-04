import "dotenv/config";
import express from "express";

import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import passwordResetRoutes from "./routes/passwordResetRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";



const app = express();




app.use(
  "/payments/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.json({ status: "the site online" });
});



app.use("/payments", paymentRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", passwordResetRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);       //orders







app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});