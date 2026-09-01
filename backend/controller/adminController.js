const connection = require("../config/db");

// ======================================
// Admin - Get All Orders
// ======================================

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
                message: err.message,
            });

        }

        return res.status(200).json({
            success: true,
            orders: results,
        });

    });

};

const getDashboardStats = (req, res) => {

    console.log("STATS API HIT");

    const revenueSql = `
        SELECT SUM(total_amount) AS revenue
        FROM orders
        WHERE payment_status = 'paid'
    `;

    const ordersSql = `
        SELECT COUNT(*) AS totalOrders
        FROM orders
    `;

    const productsSql = `
        SELECT COUNT(*) AS totalProducts
        FROM products
    `;

    const customersSql = `
        SELECT COUNT(*) AS totalCustomers
        FROM users
        WHERE role = 'user'
    `;

    connection.query(revenueSql, (err, revenueResult) => {

        if (err) {
            console.log("Revenue Error =", err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }

        connection.query(ordersSql, (err, ordersResult) => {

            if (err) {
                console.log("Orders Error =", err);
                return res.status(500).json({
                    success: false,
                    message: err.message,
                });
            }

            connection.query(productsSql, (err, productsResult) => {

                if (err) {
                    console.log("Products Error =", err);
                    return res.status(500).json({
                        success: false,
                        message: err.message,
                    });
                }

                connection.query(customersSql, (err, customersResult) => {

                    if (err) {
                        console.log("Customers Error =", err);
                        return res.status(500).json({
                            success: false,
                            message: err.message,
                        });
                    }

                    return res.json({
                        success: true,
                        stats: {
                            revenue: revenueResult[0]?.revenue || 0,
                            totalOrders: ordersResult[0]?.totalOrders || 0,
                            totalProducts: productsResult[0]?.totalProducts || 0,
                            totalCustomers: customersResult[0]?.totalCustomers || 0,
                        },
                    });

                });

            });

        });

    });

};

const updateOrderStatus = (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    let paymentStatus = "pending";

    if (
        status === "processing" ||
        status === "shipped" ||
        status === "delivered"
    ) {
        paymentStatus = "paid";
    }

    if (status === "cancelled") {
        paymentStatus = "refunded";
    }

    const sql = `
        UPDATE orders
        SET
        order_status = ?,
        payment_status = ?
        WHERE id = ?
    `;

    connection.query(
        sql,
        [status, paymentStatus, id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message,
                });
            }

            return res.json({
                success: true,
                message: "Order status updated",
            });

        }
    );

};

// ======================================
// Dashboard - Orders Chart
// ======================================

const getOrderChart = (req, res) => {

    const sql = `
        SELECT
            DATE_FORMAT(created_at, '%Y-%m-%d') AS date,
            COUNT(*) AS orders
        FROM orders
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
        ORDER BY date ASC
    `;

    connection.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            chart: results
        });

    });

};

// ======================================
// Dashboard - Revenue Chart
// ======================================

const getRevenueChart = (req, res) => {

    const sql = `
        SELECT
            DATE_FORMAT(created_at, '%Y-%m-%d') AS date,
            SUM(total_amount) AS revenue
        FROM orders
        WHERE payment_status='paid'
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
        ORDER BY date ASC
    `;

    connection.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            chart: results
        });

    });

};

// ======================================
// Dashboard - Category Sales
// ======================================

const getCategoryChart = (req, res) => {

    const sql = `
        SELECT
            category,
            COUNT(*) AS total
        FROM products
        GROUP BY category
    `;

    connection.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            chart: results
        });

    });

};

// ======================================
// Dashboard - Top Products
// ======================================

const getTopProducts = (req, res) => {

    const sql = `
        SELECT
            p.id,
            p.name,
            p.image,
            SUM(oi.quantity) AS sold
        FROM order_items oi
        JOIN products p
        ON oi.product_id=p.id
        GROUP BY p.id, p.name, p.image
        ORDER BY sold DESC
        LIMIT 5
    `;

    connection.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            products: results
        });

    });

};

// ======================================
// Admin - Get Order Items
// ======================================

const getOrderItems = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            oi.quantity,
            oi.price,
            oi.size,
            p.id AS product_id,
            p.name,
            p.image,
            p.category
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    `;

    connection.query(sql, [id], (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }

        return res.status(200).json({
            success: true,
            items: results,
        });

    });

};

module.exports = {
    getAllOrders,
    getDashboardStats,
    updateOrderStatus,
    getOrderItems,

    getOrderChart,
    getRevenueChart,
    getCategoryChart,
    getTopProducts
};