import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import "./models/User.js";
import "./models/Product.js";
import Product from "./routes/ProductRoutes.js";
import Users from "./routes/UserRoutes.js";
import cors from "cors";
import session from "express-session";
import { generalLimiter } from "./middleware/rateLimiter.js";

const app = express();

const PORT = process.env.PORT || 8000;
const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/crud-api";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

// Stripe Webhook MUST be raw body, so define it before express.json
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const Stripe = await import('stripe');
  const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).send('Webhook secret not configured');
      }
      event = JSON.parse(req.body); // Dev-only fallback
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const User = mongoose.model('User');
      const Product = mongoose.model('Product');
      const Order = mongoose.model('Order');

      // Retrieve user details stored in metadata during checkout
      if (session.metadata && session.metadata.userId) {
        const userId = session.metadata.userId;
        const user = await User.findById(userId).populate('cart.product');

        if (user && user.cart.length > 0) {
          const items = user.cart.map(cartItem => ({
            product: cartItem.product._id,
            quantity: cartItem.quantity,
            price: cartItem.product.price
          }));

          const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          const newOrder = new Order({
            user: userId, items, totalPrice,
            paymentMethod: "online",
            paymentStatus: "paid",
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
        }
      }
    } catch (error) {
      console.error("Error fulfilling order:", error);
    }
  }

  res.json({ received: true });
});

app.use(express.json({ limit: "10mb" }));
app.use(generalLimiter);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

app.use("/products", Product);
app.use("/users", Users);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
