const express = require("express");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { category, gender, search } = req.query;
        const filter = {};
        if (req.query.inStock === "true") filter.inStock = true;
        if (category) filter.category = { $regex: new RegExp(`^${category}$`, "i") };
        if (gender) filter.gender = { $regex: new RegExp(`^${gender}$`, "i") };
        if (search) filter.name = { $regex: search, $options: "i" };

        const products = await Product.find(filter).sort({ createdAt: -1 });
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
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message || "Invalid product data." });
    }
});

router.patch("/:id", requireAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ message: "Product not found." });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message || "Could not update product." });
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