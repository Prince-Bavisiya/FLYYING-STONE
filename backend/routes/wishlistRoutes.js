const express = require("express");

const router = express.Router();

const {
    authMiddleware,
} = require("../middleware/authMiddleware");

const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist,
} = require("../controller/wishlistController");

// ===============================
// User Routes
// ===============================

// Get all wishlist items
router.get(
    "/",
    authMiddleware,
    getWishlist
);

// Add product to wishlist
router.post(
    "/",
    authMiddleware,
    addToWishlist
);

// Remove product from wishlist
router.delete(
    "/:productId",
    authMiddleware,
    removeFromWishlist
);

// Check if specific product is wishlisted
router.get(
    "/check/:productId",
    authMiddleware,
    checkWishlist
);

module.exports = router;