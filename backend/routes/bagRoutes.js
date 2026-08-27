const express = require("express");

const router = express.Router();

const {
    addToBag,
    getBag,
    increaseQuantity,
    decreaseQuantity
} = require("../controller/bagController");

const {
    authMiddleware
} = require("../middleware/authMiddleware");

router.post(
    "/add",
    authMiddleware,
    addToBag
);

router.get(
    "/",
    authMiddleware,
    getBag
);

router.put(
    "/increase/:id",
    authMiddleware,
    increaseQuantity
);

router.put(
    "/decrease/:id",
    authMiddleware,
    decreaseQuantity
);
module.exports = router;