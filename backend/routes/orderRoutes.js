const express = require("express");

const router = express.Router();

const {
    authMiddleware,
} = require("../middleware/authMiddleware");

const {
    getLastAddress,
    getUserOrders,
    getOrderDetails,
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

module.exports = router;
