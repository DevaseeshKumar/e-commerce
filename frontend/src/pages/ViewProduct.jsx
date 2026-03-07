import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import { Link } from "react-router-dom";

import API from '../config/api';
const ViewProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
  const [editModal, setEditModal] = useState({ isOpen: false, product: null });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, product: null, loading: false });

  // For edit form
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [savingDetails, setSavingDetails] = useState(false);

  const categories = ['all', 'electronics', 'clothing', 'accessories', 'home', 'sports', 'books', 'other'];
  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      if (res.ok) setProducts(data);
      else toast.error(data.error);
    } catch (err) { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/products/delete-product/${deleteModal.productId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Product deleted successfully");
        setProducts(products.filter(p => p._id !== deleteModal.productId));
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (err) { toast.error("Delete failed"); }
    finally { setDeleteModal({ isOpen: false, productId: null }); }
  };

  const handleViewClick = async (productId) => {
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

  const handleEditClick = (p) => {
    setEditModal({ isOpen: true, product: { ...p } });
    setImagePreview(p.image);
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    const formData = new FormData();
    formData.append("name", editModal.product.name);
    formData.append("price", editModal.product.price);
    formData.append("description", editModal.product.description);
    formData.append("category", editModal.product.category);
    formData.append("stock", editModal.product.stock);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(`${API}/products/update-product/${editModal.product._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Product updated");
        setProducts(products.map(p => p._id === data._id ? data : p));
        setEditModal({ isOpen: false, product: null });
      } else toast.error(data.error);
    } catch (err) { toast.error("Update failed"); }
    finally { setSavingDetails(false); }
  };

  const filteredProducts = products.filter(p => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
            <h1 className="text-3xl font-bold tracking-tight mb-2">Inventory Management</h1>
            <p className="text-gray-600 dark:text-gray-400">View, edit, and manage your products.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link to="/admin/add-product" className="btn-primary whitespace-nowrap hidden md:flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add Product
            </Link>
            <div className="relative w-full sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="w-full sm:w-40 px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors capitalize"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="card overflow-hidden animate-in bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm" style={{ animationDelay: '100ms' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-white/10 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                  <th className="p-4 pl-6">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, i) => (
                  <tr key={p._id} className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#252528] transition-colors text-gray-900 dark:text-gray-100">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white dark:bg-black overflow-hidden border border-gray-200 dark:border-white/10 shrink-0">
                          {p.image ? (
                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 dark:from-[#252528] dark:to-white/10"></div>
                          )}
                        </div>
                        <div className="max-w-[250px]">
                          <p className="font-semibold truncate" title={p.name}>{p.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{p._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-gray-50 dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 capitalize text-gray-600 dark:text-gray-400">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-blue-600 dark:text-blue-500 whitespace-nowrap">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="p-4">
                      {p.stock === 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Out of Stock</span>
                      ) : p.stock <= 5 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">{p.stock} Low</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{p.stock} In Stock</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {Number(p.avgRating) > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold">{p.avgRating}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({p.reviews?.length || 0})</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">No reviews</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleViewClick(p._id)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium text-sm transition-colors p-2"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditClick(p)}
                        className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium text-sm transition-colors p-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, productId: p._id })}
                        className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium text-sm transition-colors p-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="p-10 text-center text-gray-600 dark:text-gray-400">No products found.</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 md:p-8 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 animate-scale my-8 relative shadow-2xl rounded-2xl">
            <button onClick={() => setEditModal({ isOpen: false, product: null })} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 className="text-2xl font-bold mb-6 tracking-tight">Edit Product</h2>
            <form onSubmit={handleEditSave} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 shrink-0">
                  <label className="block text-sm font-medium mb-2">Image</label>
                  <div className="relative aspect-square w-full rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black flex flex-col items-center justify-center overflow-hidden hover:border-blue-600 transition-colors group cursor-pointer">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-medium text-sm">Change</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name</label>
                    <input
                      type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" required
                      value={editModal.product.name}
                      onChange={(e) => setEditModal({ ...editModal, product: { ...editModal.product, name: e.target.value } })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price ($)</label>
                      <input
                        type="number" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" min="0" step="0.01" required
                        value={editModal.product.price}
                        onChange={(e) => setEditModal({ ...editModal, product: { ...editModal.product, price: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Stock</label>
                      <input
                        type="number" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors" min="0" required
                        value={editModal.product.stock}
                        onChange={(e) => setEditModal({ ...editModal, product: { ...editModal.product, stock: e.target.value } })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors capitalize"
                      value={editModal.product.category}
                      onChange={(e) => setEditModal({ ...editModal, product: { ...editModal.product, category: e.target.value } })}
                    >
                      {categories.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors min-h-[100px]" required
                  value={editModal.product.description}
                  onChange={(e) => setEditModal({ ...editModal, product: { ...editModal.product, description: e.target.value } })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-gray-200 dark:border-white/10">
                <button type="button" onClick={() => setEditModal({ isOpen: false, product: null })} className="px-6 py-2.5 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-[#252528] dark:hover:bg-[#303033] dark:text-gray-100 transition-all border border-gray-200 dark:border-white/10">Cancel</button>
                <button type="submit" disabled={savingDetails} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center min-w-[120px] disabled:opacity-50">
                  {savingDetails ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="card w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 animate-scale relative overflow-hidden">
            <button 
              onClick={() => setDetailsModal({ isOpen: false, product: null, loading: false })}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-black text-gray-500 hover:text-gray-900 dark:text-gray-400 border border-gray-300 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/10 dark:hover:text-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            {detailsModal.loading ? (
              <div className="p-16 flex justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-600 dark:border-blue-500 border-t-transparent animate-spin"></div>
              </div>
            ) : detailsModal.product ? (
              <div className="overflow-y-auto w-full p-6 md:p-8 custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/2 shrink-0">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#252528] border border-gray-200 dark:border-white/10 relative">
                      {detailsModal.product.image ? (
                        <img src={detailsModal.product.image} alt={detailsModal.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 dark:from-[#252528] dark:to-white/10 flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col text-left">
                    <div className="mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-gray-50 dark:bg-[#252528] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 capitalize mb-3 inline-block">
                        {detailsModal.product.category || 'Uncategorized'}
                      </span>
                      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                        {detailsModal.product.name}
                      </h2>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">${detailsModal.product.price?.toFixed(2)}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${detailsModal.product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
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
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#252528] border border-gray-200 dark:border-white/10">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-white/10 shrink-0">
                            {detailsModal.product.seller.profilePicture ? (
                              <img src={detailsModal.product.seller.profilePicture} alt="Seller" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-lg">
                                {detailsModal.product.seller.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{detailsModal.product.seller.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{detailsModal.product.seller.email}</p>
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
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-[#252528] border border-gray-200 dark:border-white/10">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold text-sm">{Number(detailsModal.product.avgRating) > 0 ? Number(detailsModal.product.avgRating).toFixed(1) : '0'}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">({detailsModal.product.reviews?.length || 0})</span>
                    </div>
                  </div>

                  {(!detailsModal.product.reviews || detailsModal.product.reviews.length === 0) ? (
                    <div className="p-8 text-center bg-gray-50 dark:bg-[#252528] rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400">
                      No reviews yet for this product.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {detailsModal.product.reviews.map((review, idx) => (
                        <div key={idx} className="p-5 rounded-xl bg-gray-50 dark:bg-[#252528] border border-gray-200 dark:border-white/10 flex gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-white dark:bg-black shrink-0">
                            {review.user?.profilePicture ? (
                              <img src={review.user.profilePicture} alt={review.user.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white dark:bg-white dark:text-black font-bold opacity-80">
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

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product? This action cannot be undone."
        confirmText="Delete"
        danger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, productId: null })}
      />
    </div>
  );
};

export default ViewProduct;