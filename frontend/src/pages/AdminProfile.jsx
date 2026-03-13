import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { injectCustomFonts, FONT_DISPLAY, FONT_BODY } from "../utils/fonts";

import API from '../config/api';

injectCustomFonts();

const AdminProfile = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "", email: "", address: { street: "", city: "", state: "", pincode: "", country: "India" }
    });
    const [loading, setLoading] = useState(true);
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const fileInputRef = useRef(null);
    const token = localStorage.getItem("token");

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API}/users/user-profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                setFormData({
                    name: data.user.name,
                    email: data.user.email,
                    address: {
                        street: data.user.address?.street || "",
                        city: data.user.address?.city || "",
                        state: data.user.address?.state || "",
                        pincode: data.user.address?.pincode || "",
                        country: data.user.address?.country || "India"
                    }
                });
            } else toast.error(data.error);
        } catch (err) { toast.error("Failed to load profile"); }
        finally { setLoading(false); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/users/update-profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Profile updated successfully");
                setUser(data.user);
                setEditMode(false);
            } else toast.error(data.error);
        } catch (err) { toast.error("Update failed"); }
    };

    const handlePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2MB");

        setUploadingPicture(true);
        const form = new FormData();
        form.append("profilePicture", file);
        try {
            const res = await fetch(`${API}/users/upload-profile-picture`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Profile picture updated!");
                setUser(data.user);
            } else toast.error(data.error);
        } catch (err) { toast.error("Upload failed"); }
        finally { setUploadingPicture(false); }
    };

    const AvatarDisplay = ({ size = "large" }) => {
        const isLarge = size === "large";
        const dim = isLarge ? "w-24 h-24" : "w-10 h-10";
        const textSize = isLarge ? "text-3xl" : "text-base";
        return user?.profilePicture
            ? <img src={user.profilePicture} alt="Profile" className={`${dim} rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-gray-800`} />
            : <div className={`${dim} rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center ${textSize} font-bold shadow-lg`}>
                {user?.name?.charAt(0).toUpperCase()}
            </div>;
    };

    if (loading) return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 dark:border-blue-500 border-t-transparent animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] py-8 sm:py-12 px-4 sm:px-6 bg-gray-50 dark:bg-[#121212]">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8 animate-in text-gray-900 dark:text-gray-100">
                    <h1 className="text-3xl font-bold tracking-tight">Personal Details</h1>
                    {!editMode && (
                        <button onClick={() => setEditMode(true)} className="px-6 py-2 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-[#252528] dark:hover:bg-[#303033] dark:text-gray-100 transition-all border border-gray-200 dark:border-white/10 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="card p-5 sm:p-8 animate-in bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm text-gray-900 dark:text-gray-100" style={{ animationDelay: '100ms' }}>
                    {/* Avatar Section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-10 pb-10 border-b border-gray-200 dark:border-white/10 text-center sm:text-left">
                        <div className="relative group">
                            <AvatarDisplay size="large" />
                            {/* Upload Overlay */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPicture}
                                className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Change profile picture"
                            >
                                {uploadingPicture ? (
                                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                        </svg>
                                        <span className="text-white text-xs font-semibold mt-1">Change</span>
                                    </>
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handlePictureChange}
                            />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                            <span className="badge inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mt-3">{user?.role}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Hover over the avatar to change your photo (max 2MB)</p>
                        </div>
                    </div>

                    {editMode ? (
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-medium mb-2">Full Name</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium mb-2">Email Address</label><input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                            </div>

                            <h3 className="text-lg font-semibold pt-4">Shipping Address</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-medium mb-2">Street Address</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" value={formData.address.street} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })} /></div>
                                <div><label className="block text-sm font-medium mb-2">City</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" value={formData.address.city} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} /></div>
                                <div><label className="block text-sm font-medium mb-2">State/Province</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" value={formData.address.state} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })} /></div>
                                <div><label className="block text-sm font-medium mb-2">Postal Code</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" value={formData.address.pincode} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })} /></div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md">Save Changes</button>
                                <button type="button" onClick={() => { setEditMode(false); fetchProfile(); }} className="px-6 py-2.5 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-[#252528] dark:hover:bg-[#303033] dark:text-gray-100 transition-all border border-gray-200 dark:border-white/10">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                                <div className="grid md:grid-cols-2 gap-y-4">
                                    <div><p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Full Name</p><p className="font-medium">{user?.name}</p></div>
                                    <div><p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Email Address</p><p className="font-medium">{user?.email}</p></div>
                                    <div><p className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Member Since</p><p className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</p></div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                                {user?.address?.street || user?.address?.city ? (
                                    <div className="bg-gray-50 dark:bg-[#252528] p-5 rounded-xl border border-gray-200 dark:border-white/10">
                                        <p className="font-medium">{user.address.street}</p>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">{user.address.city}, {user.address.state} {user.address.pincode}</p>
                                        <p className="text-gray-600 dark:text-gray-400">{user.address.country}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-400 italic">No default shipping address provided.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;