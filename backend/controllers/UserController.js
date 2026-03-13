import User from '../models/User.js';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import Stripe from 'stripe';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail, emailTemplates } from '../config/email.js';

const userRegistration = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
        if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ error: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role: "user" });
        const saved = await newUser.save();

        // Send welcome email (non-blocking)
        const template = emailTemplates.welcome(name);
        sendEmail(email, template.subject, template.html);

        res.status(201).json({ message: "Account created successfully", user: { name: saved.name, email: saved.email, role: saved.role } });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const isBcrypt = user.password.startsWith('$2');
        let isMatch = false;
        if (isBcrypt) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = password === user.password;
            if (isMatch) { user.password = await bcrypt.hash(password, 10); await user.save(); }
        }
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SESSION_SECRET, { expiresIn: '7d' });
        res.json({ message: "Login successful", user: { name: user.name, email: user.email, role: user.role, token } });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "No account found with that email" });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const template = emailTemplates.passwordReset(user.name, resetUrl);
        await sendEmail(email, template.subject, template.html);

        res.json({ message: "Password reset link sent to your email" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!password || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

        const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ error: "Invalid or expired reset token" });

        user.password = await bcrypt.hash(password, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({ message: "Password reset successful. You can now login." });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const userProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password -resetToken -resetTokenExpiry');
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ user });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const userUpdateProfile = async (req, res) => {
    try {
        const { name, email, address } = req.body;
        if (!name || !email) return res.status(400).json({ error: "Name and email are required" });
        const updatedUser = await User.findByIdAndUpdate(req.userId, { name, email, address }, { returnDocument: 'after' }).select('-password');
        if (!updatedUser) return res.status(404).json({ error: "User not found" });
        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image provided" });
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { profilePicture: req.file.path },
            { returnDocument: 'after' }
        ).select('-password');
        if (!updatedUser) return res.status(404).json({ error: "User not found" });
        res.json({ message: "Profile picture updated", user: updatedUser });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const userLogout = (req, res) => { res.json({ message: "Logout successful" }); };

const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId) return res.status(400).json({ error: "Product ID is required" });
        const qty = Number(quantity) || 1;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });
        if (product.stock < qty) return res.status(400).json({ error: `Only ${product.stock} items in stock` });

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const existingItem = user.cart.find(item => item.product.toString() === productId);
        if (existingItem) {
            const newQty = existingItem.quantity + qty;
            if (newQty > product.stock) return res.status(400).json({ error: `Only ${product.stock} items in stock` });
            existingItem.quantity = newQty;
        } else {
            user.cart.push({ product: productId, quantity: qty });
        }
        await user.save();
        const populated = await User.findById(req.userId).populate('cart.product');
        res.json({ message: "Product added to cart", cart: populated.cart });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('cart.product').select('cart address');
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ cart: user.cart, address: user.address });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ error: "Product ID is required" });
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        user.cart = user.cart.filter(item => item.product.toString() !== productId);
        await user.save();
        const populated = await User.findById(req.userId).populate('cart.product');
        res.json({ message: "Product removed from cart", cart: populated.cart });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateCartQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity || quantity < 1) return res.status(400).json({ error: "Valid product ID and quantity are required" });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });
        if (quantity > product.stock) return res.status(400).json({ error: `Only ${product.stock} items in stock` });

        const user = await User.findById(req.userId);
        const item = user.cart.find(i => i.product.toString() === productId);
        if (!item) return res.status(404).json({ error: "Product not in cart" });
        item.quantity = quantity;
        await user.save();
        const populated = await User.findById(req.userId).populate('cart.product');
        res.json({ message: "Cart updated", cart: populated.cart });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const placeOrder = async (req, res) => {
    try {
        const { paymentMethod } = req.body;
        const user = await User.findById(req.userId).populate('cart.product');
        if (!user) return res.status(404).json({ error: "User not found" });
        
        // Filter out items with null/deleted products
        const validCartItems = user.cart.filter(item => item.product);
        if (validCartItems.length === 0) return res.status(400).json({ error: "Cart is empty or contains invalid products" });

        // Check stock and build items
        const items = [];
        for (const cartItem of validCartItems) {
            const product = cartItem.product;
            if (!product) return res.status(404).json({ error: "Product not found" });
            if (product.stock < cartItem.quantity) return res.status(400).json({ error: `${product.name} only has ${product.stock} in stock` });
            items.push({ product: product._id, quantity: cartItem.quantity, price: product.price });
        }

        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = new Order({
            user: user._id, items, totalPrice,
            paymentMethod: paymentMethod || "cod",
            paymentStatus: paymentMethod === "online" ? "paid" : "unpaid",
            status: "pending"
        });
        await newOrder.save();

        // Decrement stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }

        user.orders.push(newOrder._id);
        user.cart = [];
        await user.save();

        // Send email (non-blocking)
        const template = emailTemplates.orderPlaced(user.name, newOrder._id.toString(), totalPrice);
        sendEmail(user.email, template.subject, template.html);

        res.json({ message: "Order placed successfully", order: newOrder });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const orders = async (req, res) => {
    try {
        const userOrders = await Order.find({ user: req.userId })
            .populate({
                path: 'items.product',
                populate: { path: 'seller', select: 'name profilePicture email' }
            })
            .sort({ createdAt: -1 });
        res.json({ orders: userOrders });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const adminViewOrders = async (req, res) => {
    try {
        const allOrders = await Order.find()
            .populate('user', '-password')
            .populate({
                path: 'items.product',
                populate: { path: 'seller', select: 'name profilePicture email' }
            })
            .sort({ createdAt: -1 });
        res.json({ orders: allOrders });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const viewAllUserswithOrders = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.userId } })
            .select('-password -resetToken -resetTokenExpiry')
            .populate({
                path: 'orders',
                populate: {
                    path: 'items.product'
                }
            });
        res.json({ users });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.userId.toString()) return res.status(403).json({ error: "You cannot delete your own account" });
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateUser = async (req, res) => {
    try {
        if (req.params.id === req.userId.toString()) return res.status(403).json({ error: "You cannot update your own role" });
        const { name, email, role } = req.body;
        if (!name || !email || !role) return res.status(400).json({ error: "Name, email and role are required" });
        const updated = await User.findByIdAndUpdate(req.params.id, { name, email, role }, { returnDocument: 'after' }).select('-password');
        if (!updated) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User updated successfully", user: updated });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"];
        if (!status || !validStatuses.includes(status)) return res.status(400).json({ error: "Valid status is required" });

        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' }).populate('user', 'name email');
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Send delivery email
        if (status === "delivered" && order.user?.email) {
            const template = emailTemplates.orderDelivered(order.user.name, order._id.toString());
            sendEmail(order.user.email, template.subject, template.html);
        }

        res.json({ message: "Order status updated", order });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        if (order.user.toString() !== req.userId.toString()) return res.status(403).json({ error: "Access denied" });
        if (!["pending", "confirmed"].includes(order.status)) return res.status(400).json({ error: "Order can only be cancelled when pending or confirmed" });

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }

        // Handle refund for online payments
        if (order.paymentMethod === "online" && order.paymentStatus === "paid" && order.stripeChargeId) {
            try {
                const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
                
                // Refund the payment using the payment intent
                const refund = await stripe.refunds.create({
                    payment_intent: order.stripeChargeId,
                });

                order.refundId = refund.id;
                order.paymentStatus = "refunded";
            } catch (stripeErr) {
                console.error("Stripe Refund Error:", stripeErr);
                return res.status(400).json({ error: "Failed to process refund. Please contact support." });
            }
        }

        order.status = "cancelled";
        await order.save();
        res.json({ message: "Order cancelled successfully and refund processed", order });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const createStripeOrder = async (req, res) => {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const user = await User.findById(req.userId).populate('cart.product');
        if (!user) return res.status(404).json({ error: "User not found" });
        
        // Filter out items with null/deleted products
        const validCartItems = user.cart.filter(item => item.product);
        if (validCartItems.length === 0) return res.status(400).json({ error: "Cart is empty or contains invalid products" });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: validCartItems.map(item => ({
                price_data: {
                    currency: "usd",
                    product_data: { name: item.product.name, description: item.product.description || "Product" },
                    unit_amount: Math.round(item.product.price * 100)
                },
                quantity: item.quantity
            })),
            mode: "payment",
            metadata: {
                userId: req.userId.toString()
            },
            success_url: `${process.env.CLIENT_URL}/orders?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cart?payment=cancelled`,
        });
        res.json({ url: session.url });
    } catch (err) {
        console.error("Stripe Checkout Error:", err);
        res.status(500).json({ error: err.message });
    }
};

const verifyStripePayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ error: "Session ID is required" });

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ error: "Payment not completed" });
        }

        const userId = session.metadata.userId;
        const user = await User.findById(userId).populate('cart.product');

        if (!user) return res.status(404).json({ error: "User not found" });

        // Filter out items with null/deleted products
        const validCartItems = user.cart.filter(item => item.product);
        if (validCartItems.length === 0) {
            return res.json({ message: "Order already processed or cart is empty" });
        }

        const items = [];
        for (const cartItem of validCartItems) {
            items.push({ product: cartItem.product._id, quantity: cartItem.quantity, price: cartItem.product.price });
        }

        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Get the charge ID from the session
        const chargeId = session.payment_intent;

        const newOrder = new Order({
            user: userId, items, totalPrice,
            paymentMethod: "online",
            paymentStatus: "paid",
            status: "pending",
            stripeChargeId: chargeId
        });
        await newOrder.save();

        // Decrement stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }

        user.orders.push(newOrder._id);
        user.cart = [];
        await user.save();

        // Send email (non-blocking)
        if (user.email) {
            const template = emailTemplates.orderPlaced(user.name, newOrder._id.toString(), totalPrice);
            sendEmail(user.email, template.subject, template.html);
        }

        res.json({ message: "Payment verified, order placed", order: newOrder });
    } catch (err) {
        console.error("Stripe Verification Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ error: "Product ID is required" });
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        const user = await User.findById(req.userId);
        if (user.wishlist.includes(productId)) return res.status(400).json({ error: "Already in wishlist" });
        user.wishlist.push(productId);
        await user.save();
        res.json({ message: "Added to wishlist" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ error: "Product ID is required" });
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();
        res.json({ message: "Removed from wishlist" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('wishlist');
        res.json({ wishlist: user.wishlist });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const submitHelpMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: "Name, email, and message are required" });
        }
        
        // Forward to the configured admin email (which is the SMTP email here)
        const adminEmail = process.env.SMTP_EMAIL;
        
        const template = emailTemplates.incomingSupportMessage(name, email, message);
        const success = await sendEmail(adminEmail, template.subject, template.html);
        
        if (success) {
            res.json({ message: "Message sent successfully" });
        } else {
            res.status(500).json({ error: "Failed to send the message. Please try again later." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export {
    userRegistration, userLogin, forgotPassword, resetPassword,
    userProfile, userLogout, userUpdateProfile, uploadProfilePicture,
    addToCart, getCart, removeFromCart, updateCartQuantity,
    placeOrder, orders, cancelOrder, createStripeOrder, verifyStripePayment,
    adminViewOrders, viewAllUserswithOrders, deleteUser, updateUser, updateOrderStatus,
    addToWishlist, removeFromWishlist, getWishlist, submitHelpMessage
};