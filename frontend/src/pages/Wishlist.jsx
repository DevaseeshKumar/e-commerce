import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import API from '../config/api';
const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    const fetchWishlist = async () => {
        try {
            const res = await fetch(`${API}/users/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setWishlist(data.wishlist);
            else toast.error(data.error);
        } catch (err) { toast.error("Failed to load wishlist"); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (productId) => {
        try {
            const res = await fetch(`${API}/users/wishlist/remove`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId })
            });
            if (res.ok) {
                toast.success("Removed from wishlist");
                setWishlist(wishlist.filter(p => p._id !== productId));
            }
        } catch (err) { toast.error("Network error"); }
    };

    const addToCart = async (productId, currentStock) => {
        if (currentStock < 1) return toast.error("Product is out of stock");

        try {
            const res = await fetch(`${API}/users/add-to-cart`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId, quantity: 1 })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Added to cart");
                removeFromWishlist(productId); // auto remove from wishlist when added to cart
            }
            else toast.error(data.error);
        } catch (err) { toast.error("Network error"); }
    };

    if (loading) return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 dark:border-blue-500 border-t-transparent animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] py-12 px-6 bg-gray-50 dark:bg-[#121212]">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 animate-in">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-gray-100">Your Wishlist</h1>
                    <p className="text-gray-600 dark:text-gray-400">Save items you love and buy them when you're ready.</p>
                </div>

                {wishlist.length === 0 ? (
                    <div className="card p-16 text-center animate-in bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm" style={{ animationDelay: '100ms' }}>
                        <div className="w-16 h-16 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-600">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight mb-2 text-gray-900 dark:text-gray-100">Your wishlist is empty</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Looking for inspiration? Browse our collection.</p>
                        <Link to="/user/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md inline-flex">Explore Products</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((p, i) => (
                            <div key={p._id} className="card group overflow-hidden flex flex-col animate-in bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-gray-900 dark:text-gray-100" style={{ animationDelay: `${(i % 10) * 50}ms` }}>
                                <div className="relative h-64 bg-gray-50 dark:bg-black flex items-center justify-center overflow-hidden border-b border-gray-200 dark:border-white/10">
                                    {p.image ? (
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                            <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                                            <span>No Image</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeFromWishlist(p._id)}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md flex items-center justify-center text-red-500 hover:scale-110 transition-transform hover:bg-red-500 hover:text-white"
                                        title="Remove from wishlist"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-2 gap-4">
                                        <h3 className="font-bold text-lg leading-tight line-clamp-1">{p.name}</h3>
                                        <span className="font-bold text-lg text-blue-600 dark:text-blue-500 whitespace-nowrap">${p.price.toFixed(2)}</span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2">{p.description}</p>

                                    <button
                                        onClick={() => addToCart(p._id, p.stock)}
                                        disabled={p.stock === 0}
                                        className={`w-full mt-auto px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${p.stock === 0 ? 'bg-gray-100 dark:bg-[#252528] text-gray-400 dark:text-gray-600' : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg active:scale-[0.98]'}`}
                                    >
                                        {p.stock === 0 ? "Out of Stock" : "Move to Cart"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
