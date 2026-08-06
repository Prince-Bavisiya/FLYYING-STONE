const connection = require("../config/db");

const addToBag = (req, res) => {

    const user_id = req.user.id;
    const { product_id } = req.body;

    const checkSql = `
        SELECT *
        FROM bag
        WHERE user_id = ?
        AND product_id = ?
    `;

    connection.query(
        checkSql,
        [user_id, product_id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (results.length > 0) {

                const updateSql = `
                    UPDATE bag
                    SET quantity = quantity + 1
                    WHERE user_id = ?
                    AND product_id = ?
                `;

                connection.query(
                    updateSql,
                    [user_id, product_id],
                    (err) => {

                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: err.message
                            });
                        }

                        return res.status(200).json({
                            success: true,
                            message: "Quantity Updated"
                        });

                    }
                );

            } else {

                const insertSql = `
                    INSERT INTO bag
                    (user_id, product_id, quantity)
                    VALUES (?, ?, 1)
                `;

                connection.query(
                    insertSql,
                    [user_id, product_id],
                    (err) => {

                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: err.message
                            });
                        }

                        return res.status(201).json({
                            success: true,
                            message: "Product Added To Bag"
                        });

                    }
                );

            }

        }
    );

};

const getBag = (req, res) => {

    const user_id = req.user.id;

    const sql = `
        SELECT
        bag.id,
        bag.quantity,
        products.id AS product_id,
        products.name,
        products.price,
        products.image,
        products.description
        FROM bag
        JOIN products
        ON bag.product_id = products.id
        WHERE bag.user_id = ?
    `;

    connection.query(
        sql,
        [user_id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                products: results
            });

        }
    );

};

const increaseQuantity = (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE bag
        SET quantity = quantity + 1
        WHERE id = ?
    `;

    connection.query(sql, [id], (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            message: "Quantity Increased"
        });

    });

};

const decreaseQuantity = (req, res) => {

    const { id } = req.params;

    const checkSql = `
        SELECT quantity
        FROM bag
        WHERE id = ?
    `;

    connection.query(
        checkSql,
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result[0].quantity <= 1) {

                connection.query(
                    "DELETE FROM bag WHERE id = ?",
                    [id],
                    (err) => {

                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: err.message
                            });
                        }

                        return res.json({
                            success: true,
                            message: "Product Removed"
                        });

                    }
                );

            } else {

                connection.query(
                    `
                    UPDATE bag
                    SET quantity = quantity - 1
                    WHERE id = ?
                    `,
                    [id],
                    (err) => {

                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: err.message
                            });
                        }

                        res.json({
                            success: true,
                            message: "Quantity Decreased"
                        });

                    }
                );

            }

        }
    );

};

module.exports = {
    addToBag,
    getBag,
    increaseQuantity,
    decreaseQuantity
};