import Product from '../models/Product.js';

const allProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('seller', 'name profilePicture').sort({ createdAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('seller', 'name email profilePicture')
            .populate('reviews.user', 'name profilePicture');
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const addProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: "Product name is required" });
        if (price === undefined || Number(price) <= 0) return res.status(400).json({ error: "Price must be greater than 0" });
        if (!description || !description.trim()) return res.status(400).json({ error: "Description is required" });

        const newProduct = new Product({
            name: name.trim(),
            price: Number(price),
            description: description.trim(),
            image: req.file ? req.file.path : '',
            category: category || 'other',
            stock: Number(stock) || 0,
            seller: req.userId
        });
        const saved = await newProduct.save();
        res.status(201).json(saved);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: "Product name is required" });
        if (price === undefined || Number(price) <= 0) return res.status(400).json({ error: "Price must be greater than 0" });
        if (!description || !description.trim()) return res.status(400).json({ error: "Description is required" });

        const updateData = {
            name: name.trim(), price: Number(price), description: description.trim(),
            category: category || 'other', stock: Number(stock) || 0
        };
        if (req.file) updateData.image = req.file.path;

        const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
        if (!updated) return res.status(404).json({ error: "Product not found" });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const searchProducts = async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice } = req.query;
        const filter = {};
        if (q) filter.name = { $regex: q, $options: 'i' };
        if (category && category !== 'all') filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        const products = await Product.find(filter).populate('seller', 'name profilePicture').sort({ createdAt: -1 });
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be 1-5" });

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        const existing = product.reviews.find(r => r.user.toString() === req.userId.toString());
        if (existing) {
            existing.rating = rating;
            existing.comment = comment || '';
        } else {
            product.reviews.push({ user: req.userId, rating, comment: comment || '' });
        }
        await product.save();
        const populated = await Product.findById(product._id).populate('reviews.user', 'name profilePicture');
        res.json(populated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export { addProduct, allProducts, getProductById, updateProduct, deleteProduct, searchProducts, addReview };