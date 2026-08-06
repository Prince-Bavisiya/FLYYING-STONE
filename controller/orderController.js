const connection = require("../config/db");

// ===============================
// Get Logged-in User Orders
// ===============================

// ===============================
// Get Last Used Address
// ===============================

const getLastAddress = (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT
            shipping_name,
            shipping_phone,
            shipping_address,
            shipping_city,
            shipping_pincode
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    `;

    connection.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: err.message
                });

            }

            if (results.length === 0) {

                return res.status(200).json({
                    success: true,
                    address: null
                });

            }

            return res.status(200).json({
                success: true,
                address: results[0]
            });

        }
    );

};

const getUserOrders = (req, res) => {


const userId = req.user.id;

const sql = `
    SELECT *
        FROM orders
    WHERE user_id = ?
        ORDER BY created_at DESC
            `;

connection.query(
    sql,
    [userId],
    (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });

        }

        return res.status(200).json({
            success: true,
            orders: results
        });

    }
);


};

// ===============================
// Get Single Order Details
// ===============================

const getOrderDetails = (req, res) => {

    
const userId = req.user.id;
const orderId = req.params.id;

const sql = `
    SELECT
    o.*,
        oi.product_id,
        oi.quantity,
        oi.price,
        oi.size,
        p.name,
        p.image
    FROM orders o
    INNER JOIN order_items oi
        ON o.id = oi.order_id
    INNER JOIN products p
        ON oi.product_id = p.id
    WHERE o.id = ?
        AND o.user_id = ?
            `;

connection.query(
    sql,
    [orderId, userId],
    (err, results) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }

        if (results.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Order Not Found"
            });

        }

        return res.status(200).json({
            success: true,
            order: results
        });

    }
);


};

// ===============================
// Admin - Get All Orders
// ===============================

const getAllOrders = (req, res) => {

    
const sql = `
    SELECT *
        FROM orders
    ORDER BY created_at DESC
        `;

connection.query(sql, (err, results) => {

    if (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

    return res.status(200).json({
        success: true,
        orders: results
    });

});


};

// ===============================
// Admin - Update Order Status
// ===============================

const updateOrderStatus = (req, res) => {

    
const orderId = req.params.id;
const { order_status } = req.body;

const sql = `
    UPDATE orders
    SET order_status = ?
        WHERE id = ?
            `;

connection.query(
    sql,
    [order_status, orderId],
    (err) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: err.message
            });

        }

        return res.status(200).json({
            success: true,
            message: "Order Status Updated"
        });

    }
);


};

module.exports = {
    getLastAddress,
    getUserOrders,
    getOrderDetails,
    getAllOrders,
    updateOrderStatus
};