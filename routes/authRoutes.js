const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout
} = require("../controller/authController");

const {
    authMiddleware
} = require("../middleware/authMiddleware");

const jwt = require("jsonwebtoken");

// Public Routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected Route (returns success: false instead of 401 if unauthenticated)
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
        res.json({
            success: true,
            user: decoded
        });
    } catch (error) {
        res.json({
            success: false,
            message: "Session expired or invalid"
        });
    }
});

router.get("/welcome", authMiddleware, (req, res) => {

    res.json({
        success: true,
        message: `Welcome ${req.user.email}`
    });

});

module.exports = router;