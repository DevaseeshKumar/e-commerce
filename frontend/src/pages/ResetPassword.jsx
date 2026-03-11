import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

import API from '../config/api';
const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirm) return toast.error("Please fill in all fields");
        if (password.length < 6) return toast.error("Password must be at least 6 characters");
        if (password !== confirm) return toast.error("Passwords do not match");

        setLoading(true);
        try {
            const res = await fetch(`${API}/users/reset-password/${token}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Password reset successfully. You can now login.");
                navigate("/login");
            } else {
                toast.error(data.error || "Failed to reset password. Link may be expired.");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-gray-50 dark:bg-[#121212]">
            <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-[20px] shadow-sm w-full max-w-md p-6 sm:p-10 animate-[fadeInScale_0.25s_ease-out_forwards] text-gray-900 dark:text-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Password</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Please set a strong password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[13px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.2)] dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)]"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.2)] dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)]"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white border-none rounded-xl px-6 py-3 font-semibold text-sm cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 w-full mt-4"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>

                    <p className="text-center text-sm mt-6">
                        <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                            Cancel
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
