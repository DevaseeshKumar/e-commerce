import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

import API from '../config/api';
const ViewUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });
    const [editModal, setEditModal] = useState({ isOpen: false, user: null });
    const [ordersModal, setOrdersModal] = useState({ isOpen: false, user: null });
    const token = localStorage.getItem("token");

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API}/users/admin/users-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setUsers(data.users);
            else toast.error(data.error);
        } catch (err) { toast.error("Failed to load users"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const deleteUser = async () => {
        try {
            const res = await fetch(`${API}/users/admin/delete-user/${deleteModal.userId}`, {
                method: "DELETE", headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("User deleted");
                setUsers(users.filter(u => u._id !== deleteModal.userId));
            } else toast.error(data.error);
        } catch (err) { toast.error("Delete failed"); }
        finally { setDeleteModal({ isOpen: false, userId: null }); }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        const { _id, name, email, role } = editModal.user;
        if (!name.trim() || !email.trim()) return toast.error("Name and email are required");
        try {
            const res = await fetch(`${API}/users/admin/update-user/${_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name, email, role })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("User updated");
                setUsers(users.map(u => u._id === _id ? data.user : u));
                setEditModal({ isOpen: false, user: null });
            } else toast.error(data.error);
        } catch (err) { toast.error("Update failed"); }
    };

    const filteredUsers = users.filter(u => {
        if (roleFilter !== "all" && u.role !== roleFilter) return false;
        if (search) {
            const query = search.toLowerCase();
            return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
        }
        return true;
    });

    const statusColors = {
        pending: { bg: '#fff7ed', color: '#c2410c' },
        confirmed: { bg: '#eff6ff', color: '#1d4ed8' },
        shipped: { bg: '#f0f9ff', color: '#0369a1' },
        out_for_delivery: { bg: '#faf5ff', color: '#7c3aed' },
        delivered: { bg: '#f0fdf4', color: '#15803d' },
        cancelled: { bg: '#fef2f2', color: '#b91c1c' },
    };
    const statusLabel = { pending: 'Pending', confirmed: 'Confirmed', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

    if (loading) return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 dark:border-blue-500 border-t-transparent animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] py-12 px-6 bg-gray-50 dark:bg-[#121212]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-in text-gray-900 dark:text-gray-100">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Users</h1>
                        <p className="text-gray-600 dark:text-gray-400">View and edit registered accounts.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input type="text" placeholder="Search users" className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <select className="w-full sm:w-40 px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors capitalize" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="all">All Roles</option>
                            <option value="user">Users</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                </div>

                <div className="card overflow-hidden animate-in bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm" style={{ animationDelay: '100ms' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-white/10 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                                    <th className="p-4 pl-6">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Joined</th>
                                    <th className="p-4">Orders</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#252528] transition-colors text-gray-900 dark:text-gray-100">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200 dark:ring-white/10">
                                                    {user.profilePicture
                                                        ? <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 flex items-center justify-center font-bold text-sm">{user.name.charAt(0).toUpperCase()}</div>
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{user.name}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                                                    {user.address && (user.address.street || user.address.city) && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] truncate" title={`${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.pincode}`}>
                                                            {user.address.street}, {user.address.city}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100/50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-white/10'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-sm font-medium">
                                            {user.orders?.filter(order => order.items.some(item => item.product)).length || 0} orders
                                        </td>
                                        <td className="p-4 pr-6 text-right space-x-1 whitespace-nowrap">
                                            <button
                                                onClick={() => setOrdersModal({ isOpen: true, user })}
                                                className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                                                style={{ background: '#f0f9ff', color: '#0369a1' }}
                                                title="View this user's orders"
                                            >
                                                Orders
                                            </button>
                                            <button
                                                onClick={() => setEditModal({ isOpen: true, user })}
                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 font-medium text-sm transition-colors p-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, userId: user._id })}
                                                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors p-2"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="p-10 text-center text-gray-600 dark:text-gray-400">No users found.</div>
                    )}
                </div>
            </div>

            {/* View Orders Modal */}
            {ordersModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOrdersModal({ isOpen: false, user: null })}>
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl text-gray-900 dark:text-gray-100" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200 dark:ring-white/10">
                                    {ordersModal.user?.profilePicture
                                        ? <img src={ordersModal.user.profilePicture} alt={ordersModal.user.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 flex items-center justify-center font-bold text-lg">{ordersModal.user?.name?.charAt(0).toUpperCase()}</div>
                                    }
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight">{ordersModal.user?.name}'s Orders</h2>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{ordersModal.user?.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setOrdersModal({ isOpen: false, user: null })} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#252528] transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto flex-1 p-6">
                            {!ordersModal.user?.orders?.filter(order => order.items.some(item => item.product)).length ? (
                                <div className="text-center py-12">
                                    <div className="w-14 h-14 bg-gray-50 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-7 h-7 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">No orders yet</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">This user hasn't placed any orders.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {ordersModal.user.orders.filter(order => order.items.some(item => item.product)).map((order) => (
                                        <div key={order._id} className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                                            {/* Order header */}
                                            <div className="bg-gray-50 dark:bg-[#252528] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Order # </span>
                                                        <span className="font-mono font-semibold">{order._id?.slice(-8).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Date </span>
                                                        <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Total </span>
                                                        <span className="font-semibold text-blue-600 dark:text-blue-500">${order.totalPrice?.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Payment method badge */}
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        fontSize: '11px', fontWeight: '600', borderRadius: '999px',
                                                        padding: '2px 8px',
                                                        background: order.paymentMethod === 'online' ? '#dbeafe' : '#f3f4f6',
                                                        color: order.paymentMethod === 'online' ? '#1d4ed8' : '#4b5563',
                                                    }}>
                                                        {order.paymentMethod === 'online' ? '💳' : '💵'}
                                                        {order.paymentMethod === 'online' ? 'Stripe' : 'COD'}
                                                    </span>
                                                    {/* Payment status badge */}
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        fontSize: '11px', fontWeight: '600', borderRadius: '999px',
                                                        padding: '2px 8px',
                                                        background: order.paymentStatus === 'paid' ? '#dcfce7' : '#fef9c3',
                                                        color: order.paymentStatus === 'paid' ? '#15803d' : '#a16207',
                                                    }}>
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: order.paymentStatus === 'paid' ? '#22c55e' : '#eab308' }} />
                                                        {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                                    </span>
                                                    {/* Order status badge */}
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        fontSize: '11px', fontWeight: '600', borderRadius: '999px',
                                                        padding: '2px 8px',
                                                        background: statusColors[order.status]?.bg || '#f3f4f6',
                                                        color: statusColors[order.status]?.color || '#374151',
                                                    }}>
                                                        {statusLabel[order.status] || order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Order items */}
                                            <div className="p-4 space-y-2">
                                                {order.items?.filter(item => item.product).map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 overflow-hidden shrink-0">
                                                            {item.product?.image
                                                                ? <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                                                                : <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 dark:from-black dark:to-white/10" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{item.product?.name || 'Product Unavailable'}</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                                                        </div>
                                                        <p className="text-sm font-semibold shrink-0">${(item.price * item.quantity)?.toFixed(2)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in">
                    <div className="card w-full max-w-md p-6 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 animate-scale">
                        <h2 className="text-xl font-bold mb-6 tracking-tight">Edit User</h2>
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" value={editModal.user.name} onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, name: e.target.value } })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email Address</label>
                                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" value={editModal.user.email} onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, email: e.target.value } })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Role</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" value={editModal.user.role} onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, role: e.target.value } })}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-gray-200 dark:border-white/10">
                                <button type="button" onClick={() => setEditModal({ isOpen: false, user: null })} className="px-6 py-2.5 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-[#252528] dark:hover:bg-[#303033] dark:text-gray-100 transition-all border border-gray-200 dark:border-white/10">Cancel</button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete User"
                message="Are you sure you want to permanently delete this user? This cannot be undone."
                confirmText="Delete"
                danger={true}
                onConfirm={deleteUser}
                onCancel={() => setDeleteModal({ isOpen: false, userId: null })}
            />
        </div>
    );
};

export default ViewUsers;