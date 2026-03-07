# ShopEasy - E-Commerce Platform

> A modern, fully-featured e-commerce platform with seamless shopping experience, secure payments, and powerful admin controls.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)

---

## Platform Highlights

<table>
<tr>
<td width="33%"><b>Lightning Fast</b><br/>React 19 + Vite for optimal performance</td>
<td width="33%"><b>Secure</b><br/>JWT authentication & bcrypt encryption</td>
<td width="33%"><b>Payment Ready</b><br/>Stripe integration for online payments</td>
</tr>
<tr>
<td><b>Modern UI</b><br/>Tailwind CSS + Dark Mode Support</td>
<td><b>Fully Responsive</b><br/>Works seamlessly on all devices</td>
<td><b>Powerful Admin</b><br/>Complete dashboard & user management</td>
</tr>
</table>

---

## Tech Stack

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
| crypto | Secure token generation |

---

## Core Features

### Authentication & User Management
- **Secure Registration** — Create accounts with validation, email confirmation, and welcome emails
- **Smart Login** — JWT-based authentication with automatic plaintext password migration
- **Password Recovery** — Secure reset tokens (1 hour validity) sent via email
- **Profile Management** — Update profile information and manage user profiles
- **Session Management** — Safe logout with token invalidation

### Shopping Experience
- **Product Browsing** — Explore products with filtering, sorting, and search functionality
- **Smart Cart** — Real-time stock validation, quantity management, and cart persistence
- **Wishlist** — Save favorite products for later purchase
- **Order Management** — Track orders, view order history, and cancel pending orders

### Payment Processing
- **Multiple Payment Methods** — Support for Cash on Delivery (COD) and Stripe online payments
- **Secure Checkout** — Integrated Stripe payment gateway with PCI compliance
- **Order Confirmation** — Automatic order confirmation emails with tracking details
- **Payment Verification** — Idempotent verification to prevent duplicate charges

### Admin Dashboard
- **Order Management** — View, filter, and update order status through the workflow
- **User Management** — Monitor users, roles, and their order history with CRUD operations
- **Analytics** — Dashboard with charts and metrics (powered by Recharts)
- **Delivery Tracking** — Automated delivery confirmation emails for customers
- **Product Management** — Add, edit, and manage products

### Communication
- **Automated Emails** — Transactional emails for registration, password reset, orders, and delivery
- **Help Support** — Customer support contact form with admin email forwarding
- **Real-time Notifications** — Toast notifications for user actions and feedback

---

## � Prerequisites

Before getting started, ensure you have installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation)
- **Git** for version control

---

## Quick Start Guide

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/DevaseeshKumar/e-commerce.git
cd e-commerce
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file with required variables (see Environment Variables section)
# Add your MongoDB URI, Stripe keys, email credentials, etc.

npm run dev    # Start backend on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

npm run dev    # Start frontend on http://localhost:5173
```

### 4. Open & Explore
- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:5000/api](http://localhost:5000/api)

---

## Environment Variables

### Backend Configuration
Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
SESSION_SECRET=your_super_secret_jwt_key_here

# Database
MONGO_URI=mongodb://localhost:27017/ecommerce

# Client
CLIENT_URL=http://localhost:5173

# Email (SMTP) - For transactional emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Stripe - For payment processing
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
```

---

## Project Structure

```
/
├── backend/
│   ├── controllers/
│   │   ├── UserController.js     # User authentication & profile logic
│   │   └── ProductController.js  # Product management logic
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Product.js            # Product schema
│   │   └── Order.js              # Order schema
│   ├── config/
│   │   └── email.js              # Email templates & SMTP config
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication middleware
│   │   ├── rateLimiter.js        # Rate limiting middleware
│   │   └── role.js               # Role-based access control
│   ├── routes/
│   │   ├── UserRoutes.js         # User API routes
│   │   └── ProductRoutes.js      # Product API routes
│   ├── server.js                 # Express app entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx & Signup.jsx
    │   │   ├── ViewProduct.jsx & UserViewProduct.jsx
    │   │   ├── Cart.jsx & Wishlist.jsx
    │   │   ├── Orders.jsx
    │   │   ├── AdminDashboard.jsx, AdminOrders.jsx, AdminProfile.jsx, ViewUsers.jsx
    │   │   ├── Profile.jsx & Dashboard.jsx
    │   │   ├── ForgotPassword.jsx & ResetPassword.jsx
    │   │   ├── Help.jsx & About.jsx
    │   │   └── AddProduct.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx, AdminNavbar.jsx, UserNavbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── ConfirmModal.jsx
    │   │   └── FloatingHelp.jsx
    │   ├── layout/
    │   │   ├── MainLayout.jsx
    │   │   ├── UserLayout.jsx
    │   │   └── AdminLayout.jsx
    │   ├── context/
    │   │   └── ThemeContext.jsx
    │   ├── config/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## API Reference

### Authentication Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/register` | Create new user account | Not Required |
| POST | `/api/login` | Authenticate user | Not Required |
| POST | `/api/forgot-password` | Request password reset link | Not Required |
| POST | `/api/reset-password/:token` | Reset password with token | Not Required |
| POST | `/api/logout` | Logout user | Required |

### User Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/profile` | Get authenticated user profile | Required |
| PUT | `/api/profile` | Update profile information | Required |
| POST | `/api/profile/picture` | Upload profile picture | Required |

### Cart Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart` | Retrieve user's cart | Required |
| POST | `/api/cart` | Add product to cart | Required |
| DELETE | `/api/cart` | Remove item from cart | Required |
| PUT | `/api/cart` | Update cart item quantity | Required |

### Order Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create new order | Required |
| GET | `/api/orders` | Get user's orders | Required |
| PUT | `/api/orders/:id/cancel` | Cancel pending order | Required |
| POST | `/api/stripe/checkout` | Create Stripe checkout session | Required |
| POST | `/api/stripe/verify` | Verify Stripe payment | Required |

### Wishlist Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/wishlist` | Get user's wishlist | Required |
| POST | `/api/wishlist` | Add product to wishlist | Required |
| DELETE | `/api/wishlist` | Remove from wishlist | Required |

### Support Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/help` | Submit support message | Not Required |

### Admin Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/orders` | View all orders | Admin Required |
| PUT | `/api/admin/orders/:id` | Update order status | Admin Required |
| GET | `/api/admin/users` | View all users | Admin Required |
| PUT | `/api/admin/users/:id` | Update user information | Admin Required |
| DELETE | `/api/admin/users/:id` | Delete user account | Admin Required |

---

---

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## Troubleshooting

### Common Issues

**Port already in use?**
```bash
# Change the PORT in .env file or kill the process using the port
# On Windows: netstat -ano | findstr :5000
# On Mac/Linux: lsof -i :5000
```

**MongoDB connection failed?**
- Verify MongoDB is running locally

**Stripe/Email not working?**
- Double-check your API keys in `.env`
- Verify SMTP credentials for email service

---

## Support & Contact

- **Email**: support@shopeasy.com
- **Issues**: [GitHub Issues](https://github.com/DevaseeshKumar/e-commerce/issues)
- **Discussions**: [GitHub Discussions](https://github.com/DevaseeshKumar/e-commerce/discussions)
- **Documentation**: See [/docs](/docs) folder

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Authors & Contributors

- **Devaseesh** - *Initial Development* - [GitHub](https://github.com/devaseesh)
- See [CONTRIBUTORS.md](CONTRIBUTORS.md) for more information

---

## Acknowledgments

- [React](https://react.dev/) - UI Library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Stripe](https://stripe.com/) - Payment Processing
- [MongoDB](https://www.mongodb.com/) - Database
- [Express.js](https://expressjs.com/) - Backend Framework

---

<div align="center">

**Made with care for seamless shopping experiences**

If you find this project helpful, please consider giving it a star!

</div>
