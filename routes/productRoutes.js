const express = require("express");

const router = express.Router();

const {
    addProduct,
    getProducts,
    searchProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct
} = require("../controller/productController");

const {
    authMiddleware,
    adminMiddleware
} = require("../middleware/authMiddleware");

router.post(
    "/add",
    authMiddleware,
    adminMiddleware,
    addProduct
);

router.get(
    "/",
    getProducts
);

router.get(
    "/search",
    searchProducts
);

router.get(
    "/:id",
    getSingleProduct
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateProduct
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteProduct
);

module.exports = router;