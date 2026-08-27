const express = require("express");

const router = express.Router();

const {
    authMiddleware,
} = require("../middleware/authMiddleware");

const {
    createCheckoutSession,
    verifyPayment,
} = require("../controller/paymentController");

// Create Stripe Checkout Session
router.post(
    "/create-checkout-session",
    authMiddleware,
    createCheckoutSession
);

// Verify Payment After Success
router.get(
    "/verify/:sessionId",
    verifyPayment
);

module.exports = router;