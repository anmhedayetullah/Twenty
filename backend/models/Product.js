const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["Men", "Women", "Unisex"], default: "Unisex" },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    image: { type: String, required: true },
    badge: { type: String, default: "" },
    description: { type: String, default: "" },
    inStock: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
