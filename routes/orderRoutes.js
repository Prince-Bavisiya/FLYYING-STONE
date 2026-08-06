const express = require("express");

const router = express.Router();

const {
    authMiddleware,
    adminMiddleware,
} = require("../middleware/authMiddleware");

const {
    getLastAddress,
    getUserOrders,
    getOrderDetails,
    getAllOrders,
    updateOrderStatus,
} = require("../controller/orderController");   

// ===============================
// User Routes
// ===============================

router.get(
    "/last-address",
    authMiddleware,
    getLastAddress
);

router.get(
    "/",
    authMiddleware,
    getUserOrders
);

router.get(
    "/:id",
    authMiddleware,
    getOrderDetails
);

// ===============================
// Admin Routes
// ===============================

router.get(
    "/admin/all",
    authMiddleware,
    adminMiddleware,
    getAllOrders
);

router.put(
    "/admin/status/:id",
    authMiddleware,
    adminMiddleware,
    updateOrderStatus
);

module.exports = router;
