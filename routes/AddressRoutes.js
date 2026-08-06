const express = require("express");

const router = express.Router();

const {
    authMiddleware,
} = require("../middleware/authMiddleware");

const {
    getAddresses,
    getPrimaryAddress,
    addAddress,
    updateAddress,
    setPrimaryAddress,
    deleteAddress,
} = require("../controller/addressController");

// ===============================
// User Routes
// ===============================

router.get(
    "/primary",
    authMiddleware,
    getPrimaryAddress
);

router.get(
    "/",
    authMiddleware,
    getAddresses
);

router.post(
    "/",
    authMiddleware,
    addAddress
);

router.put(
    "/:id",
    authMiddleware,
    updateAddress
);

router.put(
    "/:id/set-primary",
    authMiddleware,
    setPrimaryAddress
);

router.delete(
    "/:id",
    authMiddleware,
    deleteAddress
);

module.exports = router;