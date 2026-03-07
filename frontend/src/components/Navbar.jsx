
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "About", path: "/about" }
  ];

  return (
    <nav className="sticky top-0 w-full z-50 backdrop-blur-lg bg-white/70 dark:bg-black/60 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white hover:opacity-80 transition"
          >
            ShopEasy
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-sm font-medium transition
                ${
                  location.pathname === item.path
                    ? "text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
              >
                {item.name}

                {location.pathname === item.path && (
                  <span className="absolute left-0 -bottom-2 h-[2px] w-full bg-black dark:bg-white rounded-full"></span>
                )}
              </Link>
            ))}

            

            {/* Auth Buttons */}
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
            >
              Login
            </Link>
<Link
              to="/signup"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
            >
              Signup
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-200"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-2 border-t border-gray-200 dark:border-gray-800">

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="block px-2 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                {item.name}
              </Link>
            ))}

            <Link
              to="/login"
              className="block px-2 py-2 text-gray-700 dark:text-gray-200"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="block px-2 py-2 bg-black text-white rounded-md dark:bg-white dark:text-black"
            >
              Sign up
            </Link>

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
