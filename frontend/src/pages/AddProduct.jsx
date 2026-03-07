import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import API from "../config/api";

const AddProduct = () => {

  const navigate = useNavigate();

  const [loading,setLoading] = useState(false);
  const [imagePreview,setImagePreview] = useState(null);

  const [product,setProduct] = useState({
    name:"",
    price:"",
    description:"",
    category:"electronics",
    stock:""
  });

  const [imageFile,setImageFile] = useState(null);

  const categories = [
    "electronics",
    "clothing",
    "accessories",
    "home",
    "sports",
    "books",
    "other"
  ];

  const handleChange = (e)=>{
    setProduct({...product,[e.target.name]:e.target.value});
  };

  const handleImageChange = (e)=>{

    const file = e.target.files[0];

    if(file){

      if(file.size > 5*1024*1024){
        return toast.error("Image must be under 5MB");
      }

      setImageFile(file);

      const reader = new FileReader();

      reader.onloadend = ()=> setImagePreview(reader.result);

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async(e)=>{

    e.preventDefault();

    if(!product.name || !product.price || !product.description || !product.stock){
      return toast.error("Please fill all required fields");
    }

    setLoading(true);

    const token = localStorage.getItem("token");

    const formData = new FormData();

    Object.keys(product).forEach(key=>{
      formData.append(key,product[key]);
    });

    if(imageFile){
      formData.append("image",imageFile);
    }

    try{

      const res = await fetch(`${API}/products/add-product`,{
        method:"POST",
        headers:{Authorization:`Bearer ${token}`},
        body:formData
      });

      const data = await res.json();

      if(res.ok){
        toast.success("Product added successfully");
        navigate("/admin/view-products");
      }
      else{
        toast.error(data.error || "Failed to add product");
      }

    }
    catch{
      toast.error("Network error");
    }
    finally{
      setLoading(false);
    }
  };

  const inputCls =
  "w-full border border-gray-300 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 outline-none transition focus:border-blue-600 dark:focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]";

  const labelCls =
  "block text-[13px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5";

  const cardCls =
  "bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-[20px] shadow-sm";

  return (

  <div className="min-h-[calc(100vh-64px)] py-12 px-6 bg-gray-50 dark:bg-[#121212]">

  <div className="max-w-4xl mx-auto">

  {/* HEADER */}

  <div className="mb-10">

  <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
  Add New Product
  </h1>

  <p className="text-gray-600 dark:text-gray-400">
  Create a new product listing in your store catalog.
  </p>

  </div>

  <form
  onSubmit={handleSubmit}
  className="grid md:grid-cols-3 gap-8"
  >

  {/* LEFT SIDE */}

  <div className="md:col-span-2 space-y-6">

  <div className={`${cardCls} p-8`}>

  <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">
  General Information
  </h3>

  <div className="space-y-5">

  {/* PRODUCT NAME */}

  <div>
  <label className={labelCls}>Product Name</label>

  <input
  type="text"
  name="name"
  value={product.name}
  onChange={handleChange}
  className={inputCls}
  placeholder="Premium Wireless Headphones"
  required
  />
  </div>

  {/* CATEGORY PRICE STOCK */}

  <div className="grid grid-cols-3 gap-5">

  <div>
  <label className={labelCls}>Category</label>

  <select
  name="category"
  value={product.category}
  onChange={handleChange}
  className={inputCls}
  >
  {categories.map(cat=>(
  <option key={cat} value={cat}>{cat}</option>
  ))}
  </select>
  </div>

  <div>
  <label className={labelCls}>Price ($)</label>

  <input
  type="number"
  name="price"
  value={product.price}
  onChange={handleChange}
  className={inputCls}
  placeholder="0.00"
  min="0"
  step="0.01"
  required
  />
  </div>

  <div>
  <label className={labelCls}>Stock</label>

  <input
  type="number"
  name="stock"
  value={product.stock}
  onChange={handleChange}
  className={inputCls}
  placeholder="0"
  min="0"
  required
  />
  </div>

  </div>

  {/* DESCRIPTION */}

  <div>

  <label className={labelCls}>Description</label>

  <textarea
  name="description"
  value={product.description}
  onChange={handleChange}
  className={`${inputCls} min-h-[140px]`}
  placeholder="Describe product features..."
  required
  />

  </div>

  </div>

  </div>

  </div>

  {/* RIGHT SIDE */}

  <div className="space-y-6">

  {/* IMAGE */}

  <div className={`${cardCls} p-8`}>

  <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">
  Product Image
  </h3>

  <div className="relative aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black flex items-center justify-center overflow-hidden">

  {imagePreview ?(

  <img
  src={imagePreview}
  alt="preview"
  className="w-full h-full object-cover"
  />

  ):(
  <p className="text-sm text-gray-500 dark:text-gray-400">
  Upload Image
  </p>
  )}

  <input
  type="file"
  accept="image/*"
  onChange={handleImageChange}
  className="absolute inset-0 opacity-0 cursor-pointer"
  />

  </div>

  </div>

  {/* SUBMIT */}

  <div className={`${cardCls} p-8`}>

  <button
  type="submit"
  disabled={loading}
  className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
  >

  {loading ? "Saving..." : "Save Product"}

  </button>

  <p className="text-xs text-center mt-4 text-gray-500 dark:text-gray-400">
  Products will be immediately visible to users.
  </p>

  </div>

  </div>

  </form>

  </div>

  </div>

  );
};

export default AddProduct;