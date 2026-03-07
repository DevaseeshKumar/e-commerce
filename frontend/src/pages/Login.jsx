
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../config/api";

const Login = () => {
  const [credentials, setCredentials] = useState({
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

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!credentials.email.trim() || !credentials.password.trim()) {
      return toast.error("Please fill in all fields");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      return toast.error("Please enter a valid email");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.user.token);
        localStorage.setItem("role", data.user.role);

        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);

        navigate(
          data.user.role === "admin"
            ? "/admin/dashboard"
            : "/user/dashboard"
        );
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-10 bg-white dark:bg-[#1C1C1E]">
      <div className="w-full max-w-md rounded-2xl p-10 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1C1E] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Sign in to ShopEase
          </h1>

          <p className="text-gray-600 dark:text-gray-400">
            Enter your credentials to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">

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
            <div className="flex justify-between mb-1">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm bg-gray-100 dark:bg-black border-gray-300 dark:border-white/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-colors text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Footer */}
          <p className="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;