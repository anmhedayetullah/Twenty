const express = require("express");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { category, gender, search } = req.query;
        const filter = { inStock: true };
        if (category) filter.category = category;
        if (gender) filter.gender = gender;
        if (search) filter.name = { $regex: search, $options: "i" };
        let products = await Product.find(filter).sort({ createdAt: -1 });
        if (products.length === 0 && !category && !gender && !search) {
            products = await Product.insertMany([
                { name: "Classic Oversized T-Shirt", price: 850, category: "T-Shirts", gender: "Men", sizes: ["S", "M", "L", "XL"], colors: ["Black", "White", "Beige"], image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600", badge: "NEW" },
                { name: "Premium Cotton Shirt", price: 1250, category: "Shirts", gender: "Men", sizes: ["M", "L", "XL", "XXL"], colors: ["White", "Blue"], image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600", badge: "POPULAR" },
                { name: "Essential Casual Hoodie", price: 1650, category: "Hoodies", gender: "Unisex", sizes: ["S", "M", "L", "XL"], colors: ["Black", "Beige"], image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600", badge: "NEW" },
                { name: "Classic Denim Jacket", price: 2200, category: "Jackets", gender: "Men", sizes: ["M", "L", "XL"], colors: ["Blue", "Black"], image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600", badge: "TRENDING" },
                { name: "Women's Casual Top", price: 950, category: "T-Shirts", gender: "Women", sizes: ["S", "M", "L"], colors: ["White", "Beige"], image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600", badge: "NEW" },
                { name: "Everyday Denim Jeans", price: 1850, category: "Pants", gender: "Unisex", sizes: ["S", "M", "L", "XL"], colors: ["Blue", "Black"], image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600", badge: "POPULAR" }
            ]);
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Failed to load products." });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found." });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: "Invalid product ID." });
    }
});

function requireAdmin(req, res, next) {
    try {
        const authorization = req.headers.authorization || "";
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
        if (!token) return res.status(401).json({ message: "Admin authentication required." });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") return res.status(403).json({ message: "Admin access required." });
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired admin session." });
    }
}

router.post("/", requireAdmin, async (req, res) => {
    try {
        res.status(201).json(await Product.create(req.body));
    } catch (error) {
        res.status(400).json({ message: "Invalid product data.", error: error.message });
    }
});

router.patch("/:id", requireAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ message: "Product not found." });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: "Could not update product." });
    }
});

router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found." });
        res.json({ message: "Product deleted successfully." });
    } catch (error) {
        res.status(400).json({ message: "Could not delete product." });
    }
});

module.exports = router;
