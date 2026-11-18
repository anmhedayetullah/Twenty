const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        const cleanEmail = email.trim().toLowerCase();
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ message: "This email is already registered. Please sign in." });
        }

        const user = await User.create({
            name: name.trim(),
            email: cleanEmail,
            password: await bcrypt.hash(password, 10)
        });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({
            message: "Account created successfully!",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create account." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = (email || "").trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Signed in successfully!",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, region: user.region, district: user.district, address: user.address }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error during sign in." });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const cleanEmail = (email || "").trim().toLowerCase();
        if (!cleanEmail || !newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Email and a 6-character password are required." });
        }
        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(404).json({ message: "No account found with this email." });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: "Password updated successfully. You can now sign in." });
    } catch (err) {
        res.status(500).json({ message: "Failed to reset password." });
    }
});

router.get("/me", async (req, res) => {
    try {
        const authorization = req.headers.authorization || "";
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
        if (!token) return res.status(401).json({ message: "Authentication required." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired session." });
    }
});

router.patch("/profile", async (req, res) => {
    try {
        const authorization = req.headers.authorization || "";
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
        if (!token) return res.status(401).json({ message: "Authentication required." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const allowed = (({ name, phone, region, district, address }) => ({ name, phone, region, district, address }))(req.body);
        const user = await User.findByIdAndUpdate(decoded.id, allowed, { new: true, runValidators: true }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json(user);
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired session." });
    }
});

router.get("/admin/users", async (req, res) => {
    try {
        const authorization = req.headers.authorization || "";
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
        if (!token) return res.status(401).json({ message: "Admin authentication required." });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") return res.status(403).json({ message: "Admin access required." });
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired admin session." });
    }
});

router.patch("/admin/users/:id", async (req, res) => {
    try {
        const authorization = req.headers.authorization || "";
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
        if (!token) return res.status(401).json({ message: "Admin authentication required." });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") return res.status(403).json({ message: "Admin access required." });

        const allowed = (({ name, phone, region, district, address }) => ({ name, phone, region, district, address }))(req.body);
        const user = await User.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: "Could not update user." });
    }
});

router.delete("/admin/users/:id", async (req, res) => {
    try {
        const authorization = req.headers.authorization || "";
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
        if (!token) return res.status(401).json({ message: "Admin authentication required." });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") return res.status(403).json({ message: "Admin access required." });
        if (decoded.id === req.params.id) return res.status(400).json({ message: "You cannot delete the signed-in admin." });

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json({ message: "User deleted successfully." });
    } catch (error) {
        res.status(400).json({ message: "Could not delete user." });
    }
});

module.exports = router;
