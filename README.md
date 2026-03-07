# 🛒 E-Commerce Platform

A full-stack e-commerce web application built with a **Node.js/Express** backend and a **React + Vite** frontend, featuring product management, cart & wishlist, Stripe payments, order tracking, and admin controls.

---

## 🚀 Tech Stack

### Frontend
| Package | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router DOM | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Framer Motion + GSAP | Animations |
| Recharts | Admin analytics charts |
| Axios | HTTP client |
| Stripe.js | Payment UI integration |
| React Hot Toast | Notifications |
| tsParticles | Particle background effects |

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Stripe | Payment processing |
| Nodemailer | Transactional emails |
| Multer | File/image uploads |
| crypto | Secure token generation |

---

## ✨ Features

### 🔐 Authentication & User Management
- **Register** — Create an account with name, email, and password (min 6 characters). Sends a welcome email on success.
- **Login** — JWT-based login with a 7-day token. Auto-migrates legacy plaintext passwords to bcrypt on first login.
- **Forgot Password** — Generates a secure reset token (valid 1 hour) and emails a reset link.
- **Reset Password** — Validates the token and updates the password securely.
- **View Profile** — Returns the authenticated user's profile (excludes sensitive fields).
- **Update Profile** — Update name, email, and delivery address.
- **Upload Profile Picture** — Upload a profile image via Multer.
- **Logout** — Stateless logout confirmation.

---

### 🛍️ Cart
- **Add to Cart** — Adds a product with quantity validation against live stock levels. Increments quantity if already in cart.
- **View Cart** — Returns populated cart items and the user's saved address.
- **Remove from Cart** — Removes a specific item by product ID.
- **Update Cart Quantity** — Updates the quantity of an existing cart item with stock validation.

---

### ❤️ Wishlist
- **Add to Wishlist** — Saves a product to the user's wishlist (no duplicates).
- **Remove from Wishlist** — Removes a product from the wishlist.
- **View Wishlist** — Returns all wishlisted products, fully populated.

---

### 📦 Orders
- **Place Order (COD / Online)** — Creates an order from the current cart, decrements stock, clears the cart, and sends an order confirmation email.
- **View My Orders** — Returns all orders for the authenticated user, with product and seller details, sorted newest first.
- **Cancel Order** — Cancels a pending or confirmed order and restores product stock.
- **Stripe Checkout** — Creates a Stripe Checkout session with line items from the cart.
- **Verify Stripe Payment** — Verifies a completed Stripe session and fulfills the order (idempotent — prevents duplicate fulfillment on page refresh).

---

### 🛠️ Admin Panel
- **View All Orders** — Lists every order across all users with full product and user details.
- **Update Order Status** — Moves an order through the lifecycle: `pending → confirmed → shipped → out_for_delivery → delivered → cancelled`. Sends a delivery confirmation email when marked as delivered.
- **View All Users** — Lists all users (excluding the requesting admin) with their order history.
- **Update User** — Modify another user's name, email, or role (cannot self-edit).
- **Delete User** — Permanently deletes a user account (cannot self-delete).

---

### 📧 Email Notifications
Transactional emails are sent automatically for:
| Event | Recipient |
|---|---|
| New user registration | New user (welcome email) |
| Forgot password | User (reset link) |
| Order placed | Customer (order confirmation) |
| Order delivered | Customer (delivery confirmation) |
| Support message submitted | Admin inbox |

---

### 💬 Help & Support
- **Submit Help Message** — Accepts a name, email, and message from any visitor and forwards it to the admin's configured email address.

---

## 🔑 Environment Variables

Create a `.env` file in the backend root:

```env
# Server
PORT=5000
SESSION_SECRET=your_jwt_secret

# Database
MONGO_URI=mongodb://localhost:27017/ecommerce

# Client
CLIENT_URL=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_EMAIL=you@example.com
SMTP_PASSWORD=your_email_password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
```

---

## 🏃 Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173` and the backend on `http://localhost:5000` by default.

---

## 📁 Project Structure

```
/
├── backend/
│   ├── controllers/
│   │   └── userController.js   # All API logic
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── config/
│   │   └── email.js            # Email templates & sender
│   ├── middleware/
│   └── routes/
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── main.jsx
    ├── index.html
    └── vite.config.js
```

---

## 📋 API Reference Summary

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/register` | Register new user | ❌ |
| POST | `/api/login` | Login | ❌ |
| POST | `/api/forgot-password` | Request password reset | ❌ |
| POST | `/api/reset-password/:token` | Reset password | ❌ |
| GET | `/api/profile` | Get profile | ✅ |
| PUT | `/api/profile` | Update profile | ✅ |
| POST | `/api/profile/picture` | Upload profile picture | ✅ |
| POST | `/api/logout` | Logout | ✅ |
| GET | `/api/cart` | Get cart | ✅ |
| POST | `/api/cart` | Add to cart | ✅ |
| DELETE | `/api/cart` | Remove from cart | ✅ |
| PUT | `/api/cart` | Update cart quantity | ✅ |
| POST | `/api/orders` | Place order | ✅ |
| GET | `/api/orders` | View my orders | ✅ |
| PUT | `/api/orders/:id/cancel` | Cancel order | ✅ |
| POST | `/api/stripe/checkout` | Create Stripe session | ✅ |
| POST | `/api/stripe/verify` | Verify Stripe payment | ✅ |
| GET | `/api/wishlist` | Get wishlist | ✅ |
| POST | `/api/wishlist` | Add to wishlist | ✅ |
| DELETE | `/api/wishlist` | Remove from wishlist | ✅ |
| POST | `/api/help` | Submit support message | ❌ |
| GET | `/api/admin/orders` | All orders | 👑 Admin |
| PUT | `/api/admin/orders/:id` | Update order status | 👑 Admin |
| GET | `/api/admin/users` | All users with orders | 👑 Admin |
| PUT | `/api/admin/users/:id` | Update user | 👑 Admin |
| DELETE | `/api/admin/users/:id` | Delete user | 👑 Admin |

---

## 📜 License

MIT
