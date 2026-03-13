import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import { injectCustomFonts, FONT_DISPLAY, FONT_BODY } from "../utils/fonts";
import { loadStripe } from "@stripe/stripe-js";

injectCustomFonts();

import API from '../config/api';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx");

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [removeModal, setRemoveModal] = useState({ isOpen: false, productId: null });
    const [paymentMethod, setPaymentMethod] = useState("online");
    const [placingOrder, setPlacingOrder] = useState(false);
    const token = localStorage.getItem("token");

    const fetchCart = async () => {
        try {
            const res = await fetch(`${API}/users/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCart(data.cart);
                setAddress(data.address);
            } else toast.error(data.error);
        } catch (err) { toast.error("Failed to load cart"); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!token) {
            toast.error("Please login to view your cart");
            navigate("/login");
            return;
        }
        
        const loadCart = async () => {
            await fetchCart();
            
            const urlParams = new URLSearchParams(globalThis.location.search);
            if (urlParams.get("payment") === "cancelled") {
                toast.error("Payment was cancelled");
                globalThis.history.replaceState({}, '', '/cart');
            }
        };
        
        loadCart();
    }, []);

    const updateQuantity = async (productId, newQuantity, maxStock) => {
        if (newQuantity < 1) return setRemoveModal({ isOpen: true, productId });
        if (newQuantity > maxStock) return toast.error(`Only ${maxStock} items in stock`);

        try {
            const res = await fetch(`${API}/users/update-cart-quantity`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId, quantity: newQuantity })
            });
            const data = await res.json();
            if (res.ok) setCart(data.cart);
            else toast.error(data.error);
        } catch (err) { toast.error("Network error"); }
    };

    const removeFromCart = async () => {
        try {
            const res = await fetch(`${API}/users/remove-from-cart`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId: removeModal.productId })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Removed from cart");
                setCart(data.cart);
            } else toast.error(data.error);
        } catch (err) { toast.error("Network error"); }
        finally { setRemoveModal({ isOpen: false, productId: null }); }
    };

    const handleCheckout = async () => {
        if (!address || !address.street || !address.city || !address.state || !address.pincode) {
            toast.error("Please add your shipping address in your profile before placing an order", { duration: 4000 });
            return;
        }

        setPlacingOrder(true);
        try {
            if (paymentMethod === "online") {
                const res = await fetch(`${API}/users/create-stripe-order`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    window.location.href = data.url;
                } else toast.error(data.error);
            } else {
                const res = await fetch(`${API}/users/place-order`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ paymentMethod: "cod" })
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success("Order placed successfully!");
                    setCart([]);
                    navigate("/orders");
                } else toast.error(data.error);
            }
        } catch (err) { toast.error("Checkout failed"); }
        finally { setPlacingOrder(false); }
    };

    const subtotal = cart.filter(item => item.product).reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = subtotal === 0 ? 0 : subtotal > 500 ? 0 : 25;
    const total = subtotal + shipping;

    if (loading) return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 dark:border-blue-500 border-t-transparent animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] py-8 sm:py-12 px-4 sm:px-6 bg-gray-50 dark:bg-[#121212]">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 animate-in">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Your Cart</h1>
                    <p className="text-gray-600 dark:text-gray-400">{cart.filter(item => item.product).length} {cart.filter(item => item.product).length === 1 ? 'item' : 'items'} in your cart</p>
                </div>

                {cart.filter(item => item.product).length === 0 ? (
                    <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm p-8 sm:p-16 text-center animate-in" style={{ animationDelay: '100ms' }}>
                        <div className="w-16 h-16 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">Your cart is empty</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md inline-flex">Continue Shopping</Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4 animate-in" style={{ animationDelay: '100ms' }}>
                            {cart.filter(item => item.product).map((item) => (
                                <div key={item.product._id} className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row gap-6 hover:shadow-lg transition-all text-gray-900 dark:text-white">
                                    <div className="w-full sm:w-32 h-32 bg-gray-50 dark:bg-black rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10 shrink-0">
                                        {item.product.images?.[0] ? (
                                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-100 dark:from-[#252528] to-gray-200 dark:to-gray-800"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">{item.product.name}</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm capitalize">{item.product.category}</p>
                                            </div>
                                            <div className="font-bold text-lg whitespace-nowrap text-blue-600 dark:text-blue-500">${(item.product.price * item.quantity).toFixed(2)}</div>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between pt-4">
                                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-black p-1 rounded-lg border border-gray-200 dark:border-white/10">
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.product.stock)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-500 border border-gray-200 dark:border-white/10 shadow-sm disabled:opacity-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                                                </button>
                                                <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.product.stock)}
                                                    disabled={item.quantity >= item.product.stock}
                                                    className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-500 border border-gray-200 dark:border-white/10 shadow-sm disabled:opacity-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => setRemoveModal({ isOpen: true, productId: item.product._id })}
                                                className="text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1 lg:sticky lg:top-24">
                            <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm p-6 sm:p-8 animate-in text-gray-900 dark:text-white" style={{ animationDelay: '200ms' }}>
                                <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                                <div className="space-y-4 mb-6 text-sm">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="text-gray-900 dark:text-white font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Estimated Shipping</span>
                                        <span className="text-gray-900 dark:text-white font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                                    </div>
                                    <div className="h-px w-full bg-gray-200 dark:bg-white/10 my-4"></div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <label htmlFor="payment-method" className="block text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Payment Method</label>
                                    <div id="payment-method" className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setPaymentMethod("online")}
                                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === "online" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white"}`}
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                                            <span className="text-sm font-semibold">Card (Stripe)</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod("cod")}
                                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === "cod" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white"}`}
                                        >
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                                            <span className="text-sm font-semibold">Cash</span>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={placingOrder}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl w-full py-4 text-base flex justify-center items-center gap-2 shadow-lg transition-all disabled:opacity-50"
                                >
                                    {placingOrder ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                    ) : (
                                        <>
                                            {paymentMethod === "online" ? "Proceed to Payment" : "Place Order"}
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
                                    Secure checkout powered by Stripe. Your data is strictly protected.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={removeModal.isOpen}
                title="Remove Item"
                message="Are you sure you want to remove this item from your cart?"
                confirmText="Remove"
                danger={true}
                onConfirm={removeFromCart}
                onCancel={() => setRemoveModal({ isOpen: false, productId: null })}
            />
        </div>
    );
};

export default Cart;