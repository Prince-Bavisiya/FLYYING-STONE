const express = require("express");
const router = express.Router();
const connection = require("../config/db");

const {
    register,
    login,
    logout
} = require("../controller/authController");

const {
    authMiddleware,
    adminMiddleware
} = require("../middleware/authMiddleware");

const jwt = require("jsonwebtoken");

// Public Routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected Session Route (Queries MySQL for fresh role & status)
router.get("/me", (req, res) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    let token = req.cookies ? req.cookies.token : null;

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader !== "null" && authHeader !== "undefined" && authHeader !== "") {
            token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        }
    }

    if (!token) {
        return res.json({
            success: false,
            message: "Not logged in"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch real-time user record from MySQL
        const sql = "SELECT id, name, email, role, status FROM users WHERE id = ?";
        connection.query(sql, [decoded.id], (err, results) => {
            if (err || results.length === 0 || results[0].status === "blocked") {
                return res.json({
                    success: false,
                    message: "User not found or blocked"
                });
            }

            const dbUser = results[0];
            res.json({
                success: true,
                user: {
                    id: dbUser.id,
                    name: dbUser.name,
                    email: dbUser.email,
                    role: dbUser.role,
                    status: dbUser.status
                }
            });
        });
    } catch (error) {
        res.json({
            success: false,
            message: "Session expired or invalid"
        });
    }
});

// Admin Verification Endpoint for Frontend Route Guard
router.get("/verify-admin", authMiddleware, adminMiddleware, (req, res) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.json({
        success: true,
        isAdmin: true,
        user: req.user
    });
});

router.get("/welcome", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: `Welcome ${req.user.email}`
    });
});

module.exports = router;