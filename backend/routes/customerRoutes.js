const express = require("express");

const router = express.Router();

const {
    authMiddleware,
    adminMiddleware
} = require("../middleware/authMiddleware");

const {
    getCustomers
} = require("../controller/customerController");

// ======================================
// Get All Customers
// ======================================

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getCustomers
);

module.exports = router;