import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import API from '../config/api';
const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const token = localStorage.getItem("token");

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API}/users/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setOrders(data.orders);
            else toast.error(data.error);
        } catch (err) { toast.error("Failed to load orders"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, []);

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`${API}/users/admin/update-order/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Status updated to ${status}`);
                setOrders(orders.map(o => o._id === id ? data.order : o));
            } else toast.error(data.error);
        } catch (err) { toast.error("Update failed"); }
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

    const filteredOrders = orders.filter(o => {
        if (filter !== "all" && o.status !== filter) return false;
        if (search) {
            const query = search.toLowerCase();
            return o._id.toLowerCase().includes(query) || o.user?.name.toLowerCase().includes(query);
        }
        return true;
    });

    if (loading) return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 dark:border-blue-500 border-t-transparent animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] py-8 sm:py-12 px-4 sm:px-6 bg-gray-50 dark:bg-[#121212]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-in text-gray-900 dark:text-gray-100">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Orders</h1>
                        <p className="text-gray-600 dark:text-gray-400">View and update customer order status.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search order ID or name"
                                className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="w-full sm:w-48 capitalize px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-6">
                    {filteredOrders.filter(order => order.items.some(item => item.product)).length === 0 ? (
                        <div className="card p-16 text-center animate-in bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
                            <p className="text-gray-600 dark:text-gray-400">No orders found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredOrders.filter(order => order.items.some(item => item.product)).map((order, i) => (
                            <div key={order._id} className="card overflow-hidden animate-in bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm text-gray-900 dark:text-gray-100" style={{ animationDelay: `${(i % 10) * 50}ms` }}>
                                <div className="bg-gray-50 dark:bg-black p-5 border-b border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Customer</p>
                                            <p className="font-medium text-sm truncate pr-2">{order.user?.name || "Deleted User"} ({order.user?.email || "N/A"})</p>
                                            {order.user?.address && (order.user.address.street || order.user.address.city) && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pr-2 line-clamp-2">
                                                    {order.user.address.street}, {order.user.address.city}, {order.user.address.state} {order.user.address.pincode}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Total</p>
                                            <p className="font-medium text-sm text-blue-600 dark:text-blue-500">${order.totalPrice.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Order #</p>
                                            <p className="font-medium text-sm font-mono truncate">{order._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Payment</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Current Status</p>
                                            <StatusBadge status={order.status} />
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-3">
                                        <select
                                            className="w-full sm:w-40 py-2 px-3 text-sm rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
                                            value={order.status}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            disabled={order.status === "cancelled"}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="out_for_delivery">Out for Delivery</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex flex-wrap gap-4">
                                        {order.items.filter(item => item.product).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 bg-gray-50 dark:bg-[#252528] p-3 rounded-lg border border-gray-200 dark:border-white/10 w-full sm:w-72">
                                                <div className="w-12 h-12 bg-white dark:bg-black rounded-md overflow-hidden border border-gray-200 dark:border-white/10 shrink-0">
                                                    {item.product?.image ? (
                                                        <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 dark:from-[#252528] dark:to-white/10"></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm truncate">{item.product?.name || "Product Unavailable"}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;