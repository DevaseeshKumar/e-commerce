
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../config/api";
import { injectCustomFonts, FONT_DISPLAY, FONT_BODY } from "../utils/fonts";

injectCustomFonts();

const Signup = () => {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!credentials.name.trim() || !credentials.email.trim() || !credentials.password.trim()) {
      return toast.error("Please fill in all fields");
    }

    if (credentials.name.length < 2) {
      return toast.error("Name must be at least 2 characters");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      return toast.error("Please enter a valid email");
    }

    if (credentials.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created successfully");
        navigate("/login");
      } else {
        toast.error(data.error || "Registration failed");
      }

    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-10 bg-white dark:bg-[#1C1C1E]">
      <div className="w-full max-w-md rounded-2xl p-6 sm:p-10 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Create an account
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Join ShopEase today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600 dark:text-gray-400">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={credentials.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm bg-gray-100 dark:bg-black border-gray-300 dark:border-white/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600 dark:text-gray-400">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm bg-gray-100 dark:bg-black border-gray-300 dark:border-white/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600 dark:text-gray-400">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm bg-gray-100 dark:bg-black border-gray-300 dark:border-white/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-colors text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            >
              Sign in
            </Link>
          </p>

        </form>

      </div>
    </div>
  );
};

export default Signup;