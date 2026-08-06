const express = require("express");

const router = express.Router();

const {
    authMiddleware,
    adminMiddleware,
} = require("../middleware/authMiddleware");

const {
    getAllOrders,
    getDashboardStats,
    updateOrderStatus,
    getOrderItems,

    getOrderChart,
    getRevenueChart,
    getCategoryChart,
    getTopProducts,

} = require("../controller/adminController");

// ======================================
// Admin - Dashboard Stats
// ======================================

router.get(
    "/stats",
    authMiddleware,
    adminMiddleware,
    getDashboardStats
);

// ======================================
// Admin - Get All Orders
// ======================================

router.get(
    "/orders",
    authMiddleware,
    adminMiddleware,
    getAllOrders
);

// ======================================
// Admin - Update Order Status
// ======================================

router.put(
    "/orders/:id/status",
    authMiddleware,
    adminMiddleware,
    updateOrderStatus
);

// ======================================
// Admin - Get Order Items
// ======================================

router.get(
    "/orders/:id/items",
    authMiddleware,
    adminMiddleware,
    getOrderItems
);

// ======================================
// Dashboard Charts
// ======================================

// Orders Chart
router.get(
    "/charts/orders",
    authMiddleware,
    adminMiddleware,
    getOrderChart
);

// Revenue Chart
router.get(
    "/charts/revenue",
    authMiddleware,
    adminMiddleware,
    getRevenueChart
);

// Category Chart
router.get(
    "/charts/categories",
    authMiddleware,
    adminMiddleware,
    getCategoryChart
);

// Top Products
router.get(
    "/charts/top-products",
    authMiddleware,
    adminMiddleware,
    getTopProducts
);

module.exports = router;