import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  category: { type: String, enum: ['electronics', 'clothing', 'accessories', 'home', 'sports', 'books', 'other'], default: 'other' },
  stock: { type: Number, default: 0, min: 0 },
  reviews: [reviewSchema],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

productSchema.virtual('avgRating').get(function () {
  if (this.reviews.length === 0) return 0;
  return (this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length).toFixed(1);
});

productSchema.virtual('reviewCount').get(function () {
  return this.reviews.length;
});

productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model("Product", productSchema);
export default Product;