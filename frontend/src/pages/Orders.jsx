import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

import API from '../config/api';
const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
    const [reviewModal, setReviewModal] = useState({ isOpen: false, product: null, rating: 5, comment: '', isSubmitting: false });
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, product: null, loading: false });
    const [currentUser, setCurrentUser] = useState(null);
    const token = localStorage.getItem("token");

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API}/users/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setOrders(data.orders);
            else toast.error(data.error);

            // Fetch current user to determine if they've reviewed items
            const userRes = await fetch(`${API}/users/user-profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userData = await userRes.json();
            if (userRes.ok) setCurrentUser(userData.user);

        } catch (err) { toast.error("Failed to load orders"); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchOrders();

        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");
        if (sessionId) {
            setLoading(true);
            fetch(`${API}/users/verify-stripe-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ sessionId })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.error) toast.error(data.error);
                    else {
                        toast.success("Payment successful! Order placed and email sent.");
                        fetchOrders(); // refresh the list to show the new online order
                    }
                })
                .catch(() => toast.error("Verification failed"))
                .finally(() => {
                    window.history.replaceState({}, '', '/orders');
                    setLoading(false);
                });
        }
    }, []);

    const handleCancel = async () => {
        try {
            const res = await fetch(`${API}/users/cancel-order/${cancelModal.orderId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Order cancelled. Stock has been restored.");
                setOrders(orders.map(o => o._id === cancelModal.orderId ? data.order : o));
            } else toast.error(data.error);
        } catch (err) { toast.error("Failed to cancel order"); }
        finally { setCancelModal({ isOpen: false, orderId: null }); }
    };

    const handleViewClick = async (productId) => {
        if(!productId) return;
        setDetailsModal({ isOpen: true, product: null, loading: true });
        try {
            const res = await fetch(`${API}/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setDetailsModal({ isOpen: true, product: data, loading: false });
            } else {
                toast.error(data.error);
                setDetailsModal({ isOpen: false, product: null, loading: false });
            }
        } catch (err) {
            toast.error("Failed to fetch product details");
            setDetailsModal({ isOpen: false, product: null, loading: false });
        }
    };

    const openReviewModal = (product) => {
        // Check if user already reviewed
        const existingReview = product.reviews?.find(r => 
            (r.user?._id || r.user) === currentUser?._id
        );
        
        setReviewModal({
            isOpen: true,
            product,
            rating: existingReview ? existingReview.rating : 5,
            comment: existingReview ? existingReview.comment : '',
            isSubmitting: false
        });
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setReviewModal(prev => ({ ...prev, isSubmitting: true }));
        try {
            const res = await fetch(`${API}/products/${reviewModal.product._id}/review`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ rating: reviewModal.rating, comment: reviewModal.comment })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Review submitted!");
                fetchOrders(); // Refresh to get updated product review data
                setReviewModal({ isOpen: false, product: null, rating: 5, comment: '', isSubmitting: false });
            } else {
                toast.error(data.error);
                setReviewModal(prev => ({ ...prev, isSubmitting: false }));
            }
        } catch (err) { 
            toast.error("Failed to submit review"); 
            setReviewModal(prev => ({ ...prev, isSubmitting: false }));
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: "bg-yellow-100/50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
            confirmed: "bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            shipped: "bg-blue-600 text-white dark:bg-blue-500 dark:text-white",
            out_for_delivery: "bg-purple-100/50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            delivered: "bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            cancelled: "bg-red-100/50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        };
        const labels = {
            pending: "Pending",
            confirmed: "Confirmed",
            shipped: "Shipped",
            out_for_delivery: "Out for Delivery",
            delivered: "Delivered",
            cancelled: "Cancelled"
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${styles[status]}`}>{labels[status]}</span>;
    };

    const StatusTimeline = ({ currentStatus }) => {
        const stages = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
        if (currentStatus === 'cancelled') return null;

        const currentIndex = stages.indexOf(currentStatus);

        return (
            <div className="relative pt-6 pb-2 px-4 hidden sm:block">
                <div className="absolute top-8 left-[10%] right-[10%] h-1bg-border-strong rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${(currentIndex / 4) * 100}%` }}></div>
                </div>

                <div className="relative flex justify-between">
                    {stages.map((stage, idx) => {
                        const isCompleted = idx <= currentIndex;
                        const isCurrent = idx === currentIndex;
                        return (
                            <div key={stage} className="flex flex-col items-center">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center z-10 transition-colors duration-500 mb-2 ${isCompleted ? 'bg-blue-600 dark:bg-blue-500 border-4 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-[#1C1C1E] border-2 border-gray-300 dark:border-gray-700'}`}>
                                    {isCompleted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                                </div>
                                <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${isCurrent ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {stage.replace(/_/g, ' ')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 dark:border-blue-500 border-t-transparent animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] py-8 sm:py-12 px-4 sm:px-6 bg-gray-50 dark:bg-[#121212]">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 animate-in">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-900 dark:text-gray-100">Order History</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track the status of your recent purchases.</p>
                </div>

                {orders.length === 0 ? (
                    <div className="card p-8 sm:p-16 text-center animate-in bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm" style={{ animationDelay: '100ms' }}>
                        <div className="w-16 h-16 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-600">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight mb-2 text-gray-900 dark:text-gray-100">No orders yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">When you buy anything, your orders will show up here.</p>
                        <Link to="/user/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md inline-flex">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.filter(order => order.items.some(item => item.product)).map((order, i) => (
                            <div key={order._id} className="card overflow-hidden animate-in bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-shadow" style={{ animationDelay: `${(i % 10) * 50}ms` }}>
                                <div className="bg-gray-50 dark:bg-black p-5 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-gray-900 dark:text-gray-100">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 flex-1">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Order Placed</p>
                                            <p className="font-medium text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Total</p>
                                            <p className="font-medium text-sm">${order.totalPrice.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Payment</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {/* Payment Method */}
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    fontSize: '11px', fontWeight: '600', borderRadius: '999px',
                                                    padding: '2px 8px', width: 'fit-content',
                                                    background: order.paymentMethod === 'online' ? '#dbeafe' : '#f3f4f6',
                                                    color: order.paymentMethod === 'online' ? '#1d4ed8' : '#4b5563',
                                                }}>
                                                    {order.paymentMethod === 'online' ? '💳' : '💵'}
                                                    {order.paymentMethod === 'online' ? 'Card / Stripe' : 'Cash on Delivery'}
                                                </span>
                                                {/* Payment Status */}
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    fontSize: '11px', fontWeight: '600', borderRadius: '999px',
                                                    padding: '2px 8px', width: 'fit-content',
                                                    background: order.paymentStatus === 'paid' ? '#dcfce7' : order.paymentStatus === 'refunded' ? '#f3e8ff' : '#fef9c3',
                                                    color: order.paymentStatus === 'paid' ? '#15803d' : order.paymentStatus === 'refunded' ? '#7e22ce' : '#a16207',
                                                }}>
                                                    <span style={{
                                                        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                                                        background: order.paymentStatus === 'paid' ? '#22c55e' : order.paymentStatus === 'refunded' ? '#a855f7' : '#eab308',
                                                    }} />
                                                    {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'refunded' ? 'Refunded' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Order #</p>
                                            <p className="font-medium text-sm font-mono truncate">{order._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={order.status} />
                                    </div>
                                </div>

                                <StatusTimeline currentStatus={order.status} />

                                <div className="p-6">
                                    <div className="space-y-4">
                                            {order.items.filter(item => item.product).map((item, idx) => {
                                            const hasReviewed = item.product?.reviews?.some(r => (r.user?._id || r.user) === currentUser?._id);
                                            return (
                                                <div key={idx} className="flex flex-wrap gap-3 p-3 sm:p-4 rounded-xl border border-transparent hover:bg-gray-50 dark:hover:bg-[#252528] hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-black rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 flex items-center justify-center cursor-pointer" onClick={() => handleViewClick(item.product?._id)}>
                                                        {item.product?.image ? (
                                                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <svg className="w-8 h-8 text-gray-400 dark:text-gray-600 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <h4 
                                                            className={`font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-1 ${item.product ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-500 transition-colors' : ''}`}
                                                            onClick={() => handleViewClick(item.product?._id)}
                                                        >
                                                            {item.product?.name || "Product Unavailable"}
                                                        </h4>
                                                        {item.product?.seller?.name && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sold By: <span className="font-medium text-gray-700 dark:text-gray-300">{item.product.seller.name}</span></p>
                                                        )}
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                                    </div>
                                                    <div className="font-bold my-auto text-gray-900 dark:text-gray-100 shrink-0">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </div>
                                                    {order.status === 'delivered' && item.product && (
                                                        <div className="my-auto">
                                                            <button 
                                                                onClick={() => openReviewModal(item.product)}
                                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${hasReviewed ? 'bg-bg-secondary text-text-secondary border-border hover:bg-bg' : 'bg-black text-white border-black hover:bg-gray-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200'}`}
                                                            >
                                                                {hasReviewed ? 'Edit Review' : 'Write Review'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {['pending', 'confirmed'].includes(order.status) && (
                                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 flex justify-end">
                                            <button
                                                onClick={() => setCancelModal({ isOpen: true, orderId: order._id })}
                                                className="px-6 py-2.5 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-[#252528] dark:hover:bg-[#303033] dark:text-gray-100 transition-all border border-gray-200 dark:border-white/10"
                                            >
                                                Cancel Order
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={cancelModal.isOpen}
                title="Cancel Order"
                message="Are you sure you want to cancel this order? This action cannot be undone."
                confirmText="Cancel Order"
                danger={true}
                onConfirm={handleCancel}
                onCancel={() => setCancelModal({ isOpen: false, orderId: null })}
            />

            {/* Review Modal */}
            {reviewModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md p-6 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl animate-scale relative text-gray-900 dark:text-gray-100">
                        <button 
                            onClick={() => setReviewModal({ isOpen: false, product: null, rating: 5, comment: '', isSubmitting: false })} 
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        
                        <h2 className="text-xl font-bold mb-1">Review Product</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-1">{reviewModal.product?.name}</p>
                        
                        <form onSubmit={submitReview} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-center">Rating</label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewModal(p => ({ ...p, rating: star }))}
                                            onMouseEnter={(e) => {
                                                const buttons = e.currentTarget.parentNode.children;
                                                for(let i=0; i<5; i++) {
                                                    buttons[i].style.opacity = i < star ? '1' : '0.3';
                                                    buttons[i].style.transform = i < star ? 'scale(1.1)' : 'scale(1)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                const buttons = e.currentTarget.parentNode.children;
                                                for(let i=0; i<5; i++) {
                                                    buttons[i].style.opacity = i < reviewModal.rating ? '1' : '0.3';
                                                    buttons[i].style.transform = 'scale(1)';
                                                }
                                            }}
                                            className="text-4xl transition-all duration-200"
                                            style={{ opacity: star <= reviewModal.rating ? 1 : 0.3 }}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors min-h-[100px] resize-none"
                                    placeholder="What did you like or dislike?"
                                    value={reviewModal.comment}
                                    onChange={(e) => setReviewModal(p => ({ ...p, comment: e.target.value }))}
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">{reviewModal.comment.length}/500</p>
                            </div>

                            <button 
                                type="submit" 
                                disabled={reviewModal.isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl w-full flex justify-center py-3 transition-all shadow-md disabled:opacity-50"
                            >
                                {reviewModal.isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    "Submit Review"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {detailsModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl animate-scale relative overflow-hidden text-gray-900 dark:text-gray-100">
                        <button 
                            onClick={() => setDetailsModal({ isOpen: false, product: null, loading: false })}
                            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-black text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        
                        {detailsModal.loading ? (
                            <div className="p-16 flex justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
                            </div>
                        ) : detailsModal.product ? (
                            <div className="overflow-y-auto w-full p-6 md:p-8 custom-scrollbar">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="w-full md:w-1/2 shrink-0">
                                        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 relative">
                                            {detailsModal.product.image ? (
                                                <img src={detailsModal.product.image} alt={detailsModal.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                                    <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                                                    <span>No Image</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col text-left">
                                        <div className="mb-4">
                                            <span className="badge inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 mb-3">
                                                {detailsModal.product.category || 'Uncategorized'}
                                            </span>
                                            <h2 className="text-3xl font-bold tracking-tight mb-2 leading-tight">
                                                {detailsModal.product.name}
                                            </h2>
                                            <div className="flex items-center gap-4">
                                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">${detailsModal.product.price?.toFixed(2)}</p>
                                                <span className={`badge px-2 py-1 rounded text-sm font-semibold ${detailsModal.product.stock > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                    {detailsModal.product.stock > 0 ? `${detailsModal.product.stock} in stock` : 'Out of stock'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Description</h3>
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                                {detailsModal.product.description}
                                            </p>
                                        </div>

                                        {/* Seller Info */}
                                        {detailsModal.product.seller && (
                                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Sold By</h3>
                                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 shrink-0">
                                                        {detailsModal.product.seller.profilePicture ? (
                                                            <img src={detailsModal.product.seller.profilePicture} alt="Seller" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-blue-600 dark:bg-blue-500 text-white font-bold text-lg">
                                                                {detailsModal.product.seller.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{detailsModal.product.seller.name}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{detailsModal.product.seller.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Reviews Section */}
                                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <h3 className="text-xl font-bold tracking-tight">Customer Reviews</h3>
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10">
                                            <span className="text-yellow-500">⭐</span>
                                            <span className="font-semibold text-sm">{Number(detailsModal.product.avgRating) > 0 ? Number(detailsModal.product.avgRating).toFixed(1) : '0'}</span>
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">({detailsModal.product.reviews?.length || 0})</span>
                                        </div>
                                    </div>

                                    {(!detailsModal.product.reviews || detailsModal.product.reviews.length === 0) ? (
                                        <div className="p-8 text-center bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400">
                                            No reviews yet for this product.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {detailsModal.product.reviews.map((review, idx) => (
                                                <div key={idx} className="p-5 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 flex gap-4">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-white dark:bg-[#1C1C1E]">
                                                        {review.user?.profilePicture ? (
                                                            <img src={review.user.profilePicture} alt={review.user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold opacity-80">
                                                                {(review.user?.name || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div>
                                                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{review.user?.name || "Unknown User"}</p>
                                                                <div className="flex gap-0.5 text-xs text-yellow-500 mt-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <span key={i} className={i < review.rating ? "opacity-100" : "opacity-30"}>⭐</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {new Date(review.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {review.comment && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{review.comment}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;