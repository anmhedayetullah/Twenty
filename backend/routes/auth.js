const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/send-register-otp", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, Gmail, and password are required." });
        }

        const cleanEmail = email.trim().toLowerCase();
        let user = await User.findOne({ email: cleanEmail });

        if (user && user.isVerified) {
            return res.status(400).json({ message: "This Gmail is already registered. Please sign in." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        if (user) {
            user.name = name.trim();
            user.password = hashedPassword;
            user.otpCode = otp;
            user.otpExpires = otpExpires;
            await user.save();
        } else {
            user = await User.create({
                name: name.trim(),
                email: cleanEmail,
                password: hashedPassword,
                isVerified: false,
                otpCode: otp,
                otpExpires
            });
        }

        await transporter.sendMail({
            from: `"TWENTY Fashion" <${process.env.EMAIL_USER}>`,
            to: cleanEmail,
            subject: "TWENTY Account Verification Code",
            html: `
                <div style="font-family:sans-serif;padding:24px;border:1px solid #eee;max-width:480px;">
                    <h2 style="margin:0 0 8px;">twenty<span style="color:#D85A30;">.</span></h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Your account verification code is:</p>
                    <div style="font-size:28px;font-weight:700;letter-spacing:6px;color:#D85A30;padding:12px 0;">
                        ${otp}
                    </div>
                    <p style="font-size:12px;color:#666;">This code will expire in 5 minutes.</p>
                </div>
            `
        });

        res.json({ message: "Verification code sent to your Gmail!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to send verification email. Check EMAIL_USER and EMAIL_PASS in .env." });
    }
});

router.post("/verify-register", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const cleanEmail = (email || "").trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(404).json({ message: "Account request not found." });
        }

        if (user.otpCode !== String(otp).trim() || new Date() > user.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP code." });
        }

        user.isVerified = true;
        user.otpCode = "";
        user.otpExpires = null;
        await user.save();

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Account verified and created successfully!",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error during verification." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = (email || "").trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail, isVerified: true });
        if (!user) {
            return res.status(400).json({ message: "Invalid Gmail or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Gmail or password." });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Signed in successfully!",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error during sign in." });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const cleanEmail = (req.body.email || "").trim().toLowerCase();
        const user = await User.findOne({ email: cleanEmail, isVerified: true });

        if (!user) {
            return res.status(404).json({ message: "No verified account found with this Gmail." });
        }

        const otp = generateOTP();
        user.otpCode = otp;
        user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        await transporter.sendMail({
            from: `"TWENTY Fashion" <${process.env.EMAIL_USER}>`,
            to: cleanEmail,
            subject: "TWENTY Password Reset Code",
            html: `
                <div style="font-family:sans-serif;padding:24px;border:1px solid #eee;max-width:480px;">
                    <h2 style="margin:0 0 8px;">twenty<span style="color:#D85A30;">.</span></h2>
                    <p>Hello <strong>${user.name}</strong>,</p>
                    <p>Use this code to reset your TWENTY password:</p>
                    <div style="font-size:28px;font-weight:700;letter-spacing:6px;color:#D85A30;padding:12px 0;">
                        ${otp}
                    </div>
                    <p style="font-size:12px;color:#666;">This code expires in 5 minutes.</p>
                </div>
            `
        });

        res.json({ message: "Password reset code sent to your Gmail!" });
    } catch (err) {
        res.status(500).json({ message: "Failed to send reset email." });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const cleanEmail = (email || "").trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail, isVerified: true });
        if (!user || user.otpCode !== String(otp).trim() || new Date() > user.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired reset code." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.otpCode = "";
        user.otpExpires = null;
        await user.save();

        res.json({ message: "Password updated successfully! You can now sign in." });
    } catch (err) {
        res.status(500).json({ message: "Failed to reset password." });
    }
});

module.exports = router;
