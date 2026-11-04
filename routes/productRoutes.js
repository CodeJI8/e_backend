    import { Router } from "express";
    import upload from "../middleware/upload.js";
    import authMiddleware from "../middleware/auth.middleware.js";

    import {
        createProducts,
        getProductsById,
        getProducts,
        editProduct,
        deleteProducts
    } from "../controllers/productController.js";

    const router = Router();

    router.post("/", authMiddleware, upload.array("images", 5), createProducts);

    router.get("/", getProducts);
    router.get("/:id", getProductsById);

    router.patch("/:id", authMiddleware, upload.array("images", 5), editProduct);
    router.delete("/:id", authMiddleware, deleteProducts);

    export default router;