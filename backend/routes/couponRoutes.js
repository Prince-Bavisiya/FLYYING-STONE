const express = require("express");
const router = express.Router();

const {
    createCoupon,
    getCoupons,
    updateCoupon,
    toggleCoupon,
    deleteCoupon,
    applyCoupon,
} = require("../controller/couponController");

const {
    authMiddleware,
    adminMiddleware,
} = require("../middleware/authMiddleware");

// ===============================
// User Route
// ===============================

// Apply Coupon
router.post(
    "/apply",
    authMiddleware,
    applyCoupon
);

// ===============================
// Admin Routes
// ===============================

// Get All Coupons
router.get(
    "/admin/coupons",
    authMiddleware,
    adminMiddleware,
    getCoupons
);

// Create Coupon
router.post(
    "/admin/coupons",
    authMiddleware,
    adminMiddleware,
    createCoupon
);

// Update Coupon
router.put(
    "/admin/coupons/:id",
    authMiddleware,
    adminMiddleware,
    updateCoupon
);

// Enable / Disable Coupon
router.put(
    "/admin/coupons/:id/toggle",
    authMiddleware,
    adminMiddleware,
    toggleCoupon
);

// Delete Coupon
router.delete(
    "/admin/coupons/:id",
    authMiddleware,
    adminMiddleware,
    deleteCoupon
);

module.exports = router;