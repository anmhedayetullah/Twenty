require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

async function seedAdmin() {
    await connectDB();

    const email = (process.env.ADMIN_EMAIL || "admin@twenty.com").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "twenty@2026";
    const existing = await User.findOne({ email });

    if (existing) {
        existing.role = "admin";
        existing.name = existing.name || "TWENTY Admin";
        existing.password = await bcrypt.hash(password, 10);
        await existing.save();
        console.log(`Admin account updated: ${email}`);
    } else {
        await User.create({
            name: "TWENTY Admin",
            email,
            password: await bcrypt.hash(password, 10),
            role: "admin"
        });
        console.log(`Admin account created: ${email}`);
    }

    process.exit(0);
}

seedAdmin().catch((error) => {
    console.error("Admin seed failed:", error.message);
    process.exit(1);
});
