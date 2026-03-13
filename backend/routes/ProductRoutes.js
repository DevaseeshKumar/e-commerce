import express from "express";
import { addProduct, allProducts, getProductById, updateProduct, deleteProduct, searchProducts, addReview } from "../controllers/ProductController.js";
import authMiddleware from "../middleware/auth.js";
import roleMiddleware from "../middleware/role.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.get("/", allProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.post("/add-product", authMiddleware, roleMiddleware(["admin"]), upload.array('images', 10), addProduct);
router.put("/update-product/:id", authMiddleware, roleMiddleware(["admin"]), upload.array('images', 10), updateProduct);
router.delete("/delete-product/:id", authMiddleware, roleMiddleware(["admin"]), deleteProduct);
router.post("/:id/review", authMiddleware, addReview);

export default router;
