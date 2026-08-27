const connection = require("../config/db");

// ===============================
// Get User Wishlist
// ===============================

const getWishlist = (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT
            w.id AS wishlist_id,
            w.product_id,
            p.name,
            p.price,
            p.image,
            p.category
        FROM wishlist w
        INNER JOIN products p
            ON w.product_id = p.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    `;

    connection.query(sql, [userId], (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        return res.status(200).json({
            success: true,
            wishlist: results
        });

    });

};

// ===============================
// Add to Wishlist
// ===============================

const addToWishlist = (req, res) => {

    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
        return res.status(400).json({
            success: false,
            message: "product_id is required"
        });
    }

    // Check if already in wishlist
    const checkSql = `
        SELECT id FROM wishlist
        WHERE user_id = ? AND product_id = ?
    `;

    connection.query(checkSql, [userId, product_id], (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Already in wishlist"
            });
        }

        const insertSql = `
            INSERT INTO wishlist (user_id, product_id)
            VALUES (?, ?)
        `;

        connection.query(insertSql, [userId, product_id], (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            return res.status(201).json({
                success: true,
                message: "Added to wishlist"
            });

        });

    });

};

// ===============================
// Remove from Wishlist
// ===============================

const removeFromWishlist = (req, res) => {

    const userId = req.user.id;
    const productId = req.params.productId;

    const sql = `
        DELETE FROM wishlist
        WHERE user_id = ? AND product_id = ?
    `;

    connection.query(sql, [userId, productId], (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Item not found in wishlist"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Removed from wishlist"
        });

    });

};

// ===============================
// Check if product is wishlisted
// ===============================

const checkWishlist = (req, res) => {

    const userId = req.user.id;
    const productId = req.params.productId;

    const sql = `
        SELECT id FROM wishlist
        WHERE user_id = ? AND product_id = ?
    `;

    connection.query(sql, [userId, productId], (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        return res.status(200).json({
            success: true,
            isWishlisted: results.length > 0
        });

    });

};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist
};