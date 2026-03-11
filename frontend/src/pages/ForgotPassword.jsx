import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import API from '../config/api';
const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) return toast.error("Please enter your email");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Please enter a valid email");

        setLoading(true);
        try {
            const res = await fetch(`${API}/users/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                setSent(true);
                toast.success("Reset link sent!");
            } else {
                toast.error(data.error || "Failed to send reset link");
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
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Reset Password</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {sent ? "Check your email for the reset link." : "Enter your email address to receive a password reset link."}
                    </p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[13px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none transition-[border-color,box-shadow] duration-200 focus:border-blue-600 dark:focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.2)] dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)]"
                                placeholder="name@example.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white border-none rounded-xl px-6 py-3 font-semibold text-sm cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 w-full"
                        >
                            {loading ? "Sending link..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => { setSent(false); setEmail(""); }}
                        className="bg-transparent text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-white/20 rounded-xl px-6 py-3 font-semibold text-sm cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-[#252528] w-full"
                    >
                        Try another email
                    </button>
                )}

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6 border-t border-gray-300 dark:border-white/20 pt-6">
                    <Link to="/login" className="flex items-center justify-center gap-1 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
