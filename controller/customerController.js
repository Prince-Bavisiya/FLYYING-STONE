const connection = require("../config/db");

const getCustomers = (req, res) => {

    const sql = `
        SELECT
            u.id,
            u.name,
            u.email,

            (
                SELECT o2.shipping_phone 
                FROM orders o2 
                WHERE o2.user_id = u.id 
                AND o2.shipping_phone IS NOT NULL 
                ORDER BY o2.created_at DESC 
                LIMIT 1
            ) AS phone,

            u.status,
            u.created_at,

            COUNT(o.id) AS total_orders,

            COALESCE(SUM(
                CASE 
                    WHEN o.payment_status = 'paid' 
                    THEN o.total_amount 
                    ELSE 0 
                END
            ), 0) AS total_spend,

            MAX(o.created_at) AS last_order

        FROM users u

        LEFT JOIN orders o
            ON u.id = o.user_id

        WHERE u.role = 'user'

        GROUP BY
            u.id,
            u.name,
            u.email,
            u.status,
            u.created_at

        ORDER BY u.created_at DESC
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
            customers: results
        });

    });

};

module.exports = {
    getCustomers
};