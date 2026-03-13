import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 },
    price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['paid', 'unpaid', 'refunded'], default: 'unpaid' },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    stripeChargeId: { type: String, default: null },
    refundId: { type: String, default: null }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;