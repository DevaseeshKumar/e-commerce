import { Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from './layout/MainLayout';
import UserLayout from './layout/UserLayout';
import AdminLayout from './layout/AdminLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import AddProduct from './pages/AddProduct';
import ViewProduct from './pages/ViewProduct';
import UserViewProduct from './pages/UserViewProduct';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import ViewUsers from './pages/ViewUsers';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProfile from './pages/AdminProfile';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const App = () => {
  return (
    <Routes>
      {/* ── Public Routes (MainLayout: Navbar + Footer) ── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/products" element={<UserViewProduct />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Route>

      {/* ── User Routes (UserLayout: UserNavbar + Footer) ── */}
      <Route element={<ProtectedRoute allowedRoles={['user']}><UserLayout /></ProtectedRoute>}>
        <Route path="/user/dashboard" element={<UserViewProduct />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* ── Shared User+Admin Routes (UserLayout) ── */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'admin']}><UserLayout /></ProtectedRoute>}>
        <Route path="/orders" element={<Orders />} />
      </Route>

      {/* ── Admin Routes (AdminLayout: AdminNavbar + Footer) ── */}
      <Route element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/view-products" element={<ViewProduct />} />
        <Route path="/admin/users" element={<ViewUsers />} />
        <Route path="/admin/view-orders" element={<AdminOrders />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );
};

export default App;