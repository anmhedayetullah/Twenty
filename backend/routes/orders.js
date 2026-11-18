const express = require("express");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();

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

router.post("/", async (req, res) => {
    try {
        const body = req.body;
        if (!body.customer?.fullName || !body.customer?.phone || !body.customer?.address || !body.items?.length) {
            return res.status(400).json({ message: "Complete customer and order information is required." });
        }

        const normalizedCustomer = {
            ...body.customer,
            email: (body.customer.email || "").trim().toLowerCase(),
            phone: (body.customer.phone || "").trim()
        };

        const subtotal = body.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
        const delivery = subtotal >= 3000 ? 0 : (body.customer.city === "outside" ? 130 : 80);
        const orderId = "TW-" + Math.floor(1000 + Math.random() * 9000);

        const order = await Order.create({
            ...body,
            customer: normalizedCustomer,
            orderId,
            subtotal,
            delivery,
            grandTotal: subtotal + delivery,
            payment: body.payment || { method: "Cash on Delivery", trxId: "" }
        });
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: "Could not place order.", error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const filter = {};
        if (req.query.email) {
            const cleanEmail = req.query.email.trim().toLowerCase();
            filter["customer.email"] = { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
        }
        if (req.query.status) filter.status = req.query.status;
        res.json(await Order.find(filter).sort({ createdAt: -1 }));
    } catch (error) {
        res.status(500).json({ message: "Failed to load orders." });
    }
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );
        if (!order) return res.status(404).json({ message: "Order not found." });
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: "Could not update order status." });
    }
});

router.patch("/:id", requireAdmin, async (req, res) => {
    try {
        const update = {};
        if (req.body.status) update.status = req.body.status;
        if (typeof req.body.adminNote === "string") update.adminNote = req.body.adminNote.trim();
        if (req.body.payment) update.payment = req.body.payment;
        const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!order) return res.status(404).json({ message: "Order not found." });
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: "Could not update order." });
    }
});

router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found." });
        res.json({ message: "Order deleted successfully." });
    } catch (error) {
        res.status(400).json({ message: "Could not delete order." });
    }
});

router.get("/admin/dashboard", requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        const [products, customers] = await Promise.all([
            Product.countDocuments(),
            User.countDocuments({ role: "customer" })
        ]);
        const paidStatuses = ["Confirmed", "Shipped", "Delivered"];
        const revenue = orders
            .filter(order => order.status !== "Cancelled")
            .reduce((sum, order) => sum + Number(order.grandTotal || 0), 0);
        const paidRevenue = orders
            .filter(order => paidStatuses.includes(order.status))
            .reduce((sum, order) => sum + Number(order.grandTotal || 0), 0);
        res.json({
            stats: {
                totalOrders: orders.length,
                revenue,
                paidRevenue,
                pendingOrders: orders.filter(order => order.status === "Pending").length,
                deliveredOrders: orders.filter(order => order.status === "Delivered").length,
                products,
                customers
            },
            orders
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to load dashboard." });
    }
});

router.get("/admin/payments", requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        const payments = orders.map(order => ({
            id: order._id,
            orderId: order.orderId,
            customer: order.customer,
            method: order.payment?.method || "Cash on Delivery",
            trxId: order.payment?.trxId || "",
            amount: order.grandTotal,
            status: order.status,
            createdAt: order.createdAt
        }));
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: "Failed to load payments." });
    }
});

module.exports = router;