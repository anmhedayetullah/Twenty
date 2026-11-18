const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customer: {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true },
        city: String,
        address: { type: String, required: true, trim: true },
        notes: { type: String, default: "" }
    },
    items: [{
        productId: String,
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: String,
        size: { type: String, default: "M" },
        color: { type: String, default: "Default" },
        quantity: { type: Number, required: true, min: 1 }
    }],
    subtotal: { type: Number, required: true },
    delivery: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    payment: {
        method: { type: String, default: "Cash on Delivery" },
        trxId: { type: String, default: "" }
    },
    adminNote: { type: String, default: "" },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
