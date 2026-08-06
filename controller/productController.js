const connection = require("../config/db");

// ADD PRODUCT
const addProduct = (req, res) => {

    const {
        name,
        description,
        price,
        image,
        category,
        stock
    } = req.body;

    const sql = `
    INSERT INTO products
(name, description, price, image, category, stock)
VALUES (?, ?, ?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [
            name,
            description,
            price,
            image,
            category,
            stock
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Product Added Successfully"
            });

        }
    );
};

// GET ALL PRODUCTS
const getProducts = (req, res) => {

    const sql = "SELECT * FROM products";

    connection.query(sql, (err, results) => {

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

    });

};

// UPDATE PRODUCT
const updateProduct = (req, res) => {

    const { id } = req.params;

    const {
        name,
        description,
        price,
        image,
        category,
        stock
    } = req.body;

    const sql = `
        UPDATE products
        SET
        name = ?,
        description = ?,
        price = ?,
        image = ?,
        category = ?,
        stock=?
        WHERE id = ?
    `;

    connection.query(
        sql,
        [
            name,
            description,
            price,
            image,
            category,
            stock,
            id
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Product Updated Successfully"
            });

        }
    );

};

// DELETE PRODUCT
const deleteProduct = (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM products
        WHERE id = ?
    `;

    connection.query(
        sql,
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Product Deleted Successfully"
            });

        }
    );

};

// SEARCH PRODUCTS

const searchProducts = (req, res) => {

    const { q } = req.query;

    const sql = `
        SELECT *
        FROM products
        WHERE
        name LIKE ?
        OR category LIKE ?
        OR description LIKE ?
        LIMIT 10
    `;

    const searchValue = `%${q}%`;

    connection.query(
        sql,
        [
            searchValue,
            searchValue,
            searchValue
        ],
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: err.message
                });

            }

            res.status(200).json(results);

        }
    );

};

// GET SINGLE PRODUCT

const getSingleProduct = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT *
        FROM products
        WHERE id = ?
    `;

    connection.query(
        sql,
        [id],
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
                    message: "Product Not Found"
                });

            }

            res.status(200).json({
                success: true,
                product: results[0]
            });

        }
    );

};

module.exports = {
    addProduct,
    getProducts,
    searchProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct
};