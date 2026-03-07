import express from "express";
import {
    addToCart, adminViewOrders, cancelOrder, createStripeOrder,
    deleteUser, getCart, orders, placeOrder, removeFromCart, updateCartQuantity,
    updateOrderStatus, updateUser, userLogin, userLogout, userProfile,
    userRegistration, userUpdateProfile, viewAllUserswithOrders, verifyStripePayment,
    uploadProfilePicture, forgotPassword, resetPassword,
    addToWishlist, removeFromWishlist, getWishlist, submitHelpMessage
} from "../controllers/UserController.js";
import authMiddleware from "../middleware/auth.js";
import roleMiddleware from "../middleware/role.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { uploadAvatar } from "../config/cloudinary.js";

const router = express.Router();

// Auth
router.post("/register", authLimiter, userRegistration);
router.post("/login", authLimiter, userLogin);
router.post("/logout", authMiddleware, userLogout);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Profile
router.get("/user-profile", authMiddleware, userProfile);
router.put("/update-profile", authMiddleware, userUpdateProfile);
router.post("/upload-profile-picture", authMiddleware, uploadAvatar.single('profilePicture'), uploadProfilePicture);

// Help & Support
router.post("/help/send", submitHelpMessage);

// Cart
router.post("/add-to-cart", authMiddleware, addToCart);
router.get("/cart", authMiddleware, getCart);
router.delete("/remove-from-cart", authMiddleware, removeFromCart);
router.put("/update-cart-quantity", authMiddleware, updateCartQuantity);

// Orders
router.post("/place-order", authMiddleware, placeOrder);
router.get("/orders", authMiddleware, orders);
router.put("/cancel-order/:id", authMiddleware, cancelOrder);
router.post("/create-stripe-order", authMiddleware, createStripeOrder);
router.post("/verify-stripe-payment", authMiddleware, verifyStripePayment);

// Wishlist
router.post("/wishlist/add", authMiddleware, addToWishlist);
router.delete("/wishlist/remove", authMiddleware, removeFromWishlist);
router.get("/wishlist", authMiddleware, getWishlist);

// Admin
router.get("/admin/orders", authMiddleware, roleMiddleware(["admin"]), adminViewOrders);
router.get("/admin/users-orders", authMiddleware, roleMiddleware(["admin"]), viewAllUserswithOrders);
router.delete("/admin/delete-user/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);
router.put("/admin/update-user/:id", authMiddleware, roleMiddleware(["admin"]), updateUser);
router.put("/admin/update-order/:id", authMiddleware, roleMiddleware(["admin"]), updateOrderStatus);

export default router;