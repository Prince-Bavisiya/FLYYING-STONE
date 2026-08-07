require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");


const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const bagRoutes = require("./routes/bagRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const AddressRoutes = require("./routes/AddressRoutes")
const wishlistRoutes = require("./routes/wishlistRoutes");
const couponRoutes = require("./routes/couponRoutes");
const customerRoutes = require("./routes/customerRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

// Stripe Webhook (IMPORTANT: Must be before express.json())

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow local development origins dynamically
            if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) || /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(cookieParser());

// Normal JSON Routes
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/bag", bagRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/addresses", require("./routes/AddressRoutes"));
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (req, res) => {
    const db = require("./config/db");
    db.query("SELECT 1", (err, results) => {
        if (err) {
            return res.status(500).json({
                status: "error",
                message: "Database connection failed",
                error: err.message,
                dbHost: process.env.DB_HOST ? `${process.env.DB_HOST.slice(0, 10)}...` : "not set (falls back to localhost)"
            });
        }
        res.json({
            status: "ok",
            message: "Database connection healthy",
            dbHost: process.env.DB_HOST ? `${process.env.DB_HOST.slice(0, 10)}...` : "not set"
        });
    });
});

app.get("/", (req, res) => {
    res.send("E-commerce API Running");
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

module.exports = app;