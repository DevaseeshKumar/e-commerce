import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../config/api";

const UserViewProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addingToCart, setAddingToCart] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const token = localStorage.getItem("token");

  const categories = [
    "all",
    "electronics",
    "clothing",
    "accessories",
    "home",
    "sports",
    "books",
    "other",
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter]);

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams();

      if (searchQuery) queryParams.append("q", searchQuery);
      if (categoryFilter !== "all")
        queryParams.append("category", categoryFilter);

      const res = await fetch(
        `${API}/products/search?${queryParams.toString()}`
      );

      const data = await res.json();

      if (res.ok) setProducts(data);
      else toast.error(data.error);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, stock) => {
    if (!token) {
      toast.error("Please login to add items to your cart");
      return navigate("/login");
    }
    if (stock < 1) return toast.error("Product is out of stock");

    setAddingToCart({ ...addingToCart, [productId]: true });

    try {
      const res = await fetch(`${API}/users/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();

      if (res.ok) toast.success("Added to cart");
      else toast.error(data.error || "Failed to add to cart");
    } catch {
      toast.error("Network error");
    } finally {
      setAddingToCart({ ...addingToCart, [productId]: false });
    }
  };

  const addToWishlist = async (productId) => {
    if (!token) {
      toast.error("Please login to add items to your wishlist");
      return navigate("/login");
    }
    try {
      const res = await fetch(`${API}/users/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (res.ok) toast.success("Added to wishlist");
      else toast.error(data.error);
    } catch {
      toast.error("Failed to add to wishlist");
    }
  };

  if (loading && products.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );

  const openProductModal = async (product) => {
    setSelectedProduct(product);
    setLoadingDetails(true);
    try {
      const res = await fetch(`${API}/products/${product._id}`);
      const data = await res.json();
      if (res.ok) setSelectedProduct(data);
      else toast.error(data.error);
    } catch {
      toast.error("Failed to load product details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => setSelectedProduct(null);

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50 dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Discover Products
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Find the best items curated just for you
            </p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">

            <input
  type="text"
  placeholder="Search products..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="px-4 py-2 rounded-xl border shadow-sm focus:outline-none bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-white/20 focus:border-blue-500 transition-colors"
/>

            <select
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
  className="px-4 py-2 rounded-xl border shadow-sm capitalize bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-gray-100 border-gray-300 dark:border-white/20 focus:border-blue-500 transition-colors"
>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

          </div>

        </div>


        {/* Empty state */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No products found</p>

            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
              className="mt-4 text-sm underline text-gray-700 dark:text-gray-300"
            >
              Clear filters
            </button>
          </div>
        ) : (

          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">

            {products.map((p) => (
              <div
                key={p._id}
                className="group bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition hover:shadow-2xl"
              >

                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-neutral-800 cursor-pointer" onClick={() => openProductModal(p)}>

                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Wishlist */}
                  <button
                    onClick={(e) => { e.stopPropagation(); addToWishlist(p._id); }}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
                  >
                    ❤️
                  </button>

                </div>

                {/* Content */}
                <div className="p-6 flex flex-col h-full space-y-3">

                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 cursor-pointer hover:underline" onClick={() => openProductModal(p)}>
                    {p.name}
                  </h3>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {p.description}
                  </p>

                  <span className="text-xs text-gray-400 capitalize">
                    {p.category}
                  </span>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${p.price}
                    </span>

                    {Number(p.avgRating) > 0 && (
                      <span className="text-sm text-yellow-500">
                        ⭐ {p.avgRating}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => addToCart(p._id, p.stock)}
                    disabled={p.stock === 0 || addingToCart[p._id]}
                    className={`mt-auto w-full py-3 rounded-xl text-sm font-medium transition

                    ${
                      p.stock === 0
                        ? "bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    }`}
                  >

                    {addingToCart[p._id]
                      ? "Adding..."
                      : p.stock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}

                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-white dark:bg-neutral-900 overflow-hidden animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-8 text-gray-900 dark:text-gray-100">
          
          {/* Close Button Mobile */}
          <button 
            onClick={closeModal} 
            className="md:hidden absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center"
          >
            ✕
          </button>

          {/* Image Section */}
          <div className="w-full md:w-1/2 h-64 md:h-full bg-gray-100 dark:bg-black relative shrink-0">
            {selectedProduct.image ? (
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
            )}
            
            <button
              onClick={() => addToWishlist(selectedProduct._id)}
              className="hidden md:flex absolute top-6 right-6 w-12 h-12 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur items-center justify-center shadow hover:scale-110 transition text-xl"
            >
              ❤️
            </button>
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 h-full overflow-y-auto p-6 md:p-12 relative flex flex-col">
            
            {/* Close Button Desktop */}
            <button 
              onClick={closeModal} 
              className="hidden md:flex absolute top-6 right-6 w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              ✕
            </button>

            {loadingDetails ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{selectedProduct.category}</span>
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">{selectedProduct.name}</h2>
                  <div className="text-2xl font-semibold mb-6">${selectedProduct.price}</div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg mb-8">{selectedProduct.description}</p>
                  
                  {/* Seller Info */}
                  {selectedProduct.seller && (
                    <div className="flex items-center p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl mb-8 border border-gray-100 dark:border-neutral-700">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 shrink-0 bg-gray-200 dark:bg-gray-700">
                        {selectedProduct.seller.profilePicture ? (
                          <img src={selectedProduct.seller.profilePicture} alt="Seller" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                            {selectedProduct.seller.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Sold by</p>
                        <p className="font-bold text-lg">{selectedProduct.seller.name}</p>
                        {selectedProduct.seller.email && <p className="text-sm text-gray-500">{selectedProduct.seller.email}</p>}
                      </div>
                    </div>
                  )}

                  {/* Add to Cart Actions */}
                  <div className="flex items-center gap-4 py-6 border-t border-b border-gray-200 dark:border-gray-800">
                    <div className="flex-1">
                      {selectedProduct.stock > 0 ? (
                        <p className="text-green-600 dark:text-green-400 font-medium tracking-wide">In Stock ({selectedProduct.stock} available)</p>
                      ) : (
                        <p className="text-red-500 font-medium tracking-wide">Out of Stock</p>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(selectedProduct._id, selectedProduct.stock)}
                      disabled={selectedProduct.stock === 0 || addingToCart[selectedProduct._id]}
                      className={`px-8 py-4 rounded-xl font-bold tracking-wide transition transform active:scale-95
                        ${selectedProduct.stock === 0
                          ? "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                          : "bg-black text-white hover:bg-gray-900 shadow-xl shadow-black/20 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:shadow-white/10"
                        }`}
                    >
                      {addingToCart[selectedProduct._id] ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold">Reviews</h3>
                    {Number(selectedProduct.avgRating) > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500 text-2xl">⭐</span>
                        <span className="font-bold text-xl">{selectedProduct.avgRating}</span>
                        <span className="text-gray-500">({selectedProduct.reviews?.length || 0})</span>
                      </div>
                    )}
                  </div>

                  {(!selectedProduct.reviews || selectedProduct.reviews.length === 0) ? (
                    <div className="text-center py-10 bg-gray-50 dark:bg-neutral-800 rounded-2xl">
                      <p className="text-gray-500">No reviews yet.</p>
                      <p className="text-sm text-gray-400 mt-2">Buy this product to leave the first review!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedProduct.reviews.map((r, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-neutral-800 p-6 rounded-2xl border border-gray-100 dark:border-neutral-700">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {r.user?.profilePicture ? (
                                  <img src={r.user.profilePicture} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold">
                                    {(r.user?.name || "U").charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold">{r.user?.name || "Unknown User"}</p>
                                <p className="text-xs text-gray-500">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex text-yellow-500">
                              {[...Array(5)].map((_, idx) => (
                                <span key={idx} className={idx < r.rating ? "opacity-100" : "opacity-30"}>⭐</span>
                              ))}
                            </div>
                          </div>
                          {r.comment && <p className="text-gray-700 dark:text-gray-300 italic">"{r.comment}"</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default UserViewProduct;
