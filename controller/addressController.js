const connection = require("../config/db");

// ===============================
// Get All Addresses for Logged-in User
// ===============================

const getAddresses = (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT *
        FROM addresses
        WHERE user_id = ?
        ORDER BY is_primary DESC, created_at DESC
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

            return res.status(200).json({
                success: true,
                addresses: results
            });

        }
    );

};

// ===============================
// Get Primary Address (used by Checkout)
// ===============================

const getPrimaryAddress = (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT *
        FROM addresses
        WHERE user_id = ?
            AND is_primary = 1
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

// ===============================
// Add New Address
// ===============================

const addAddress = (req, res) => {

    const userId = req.user.id;
    const { fullName, phone, address, city, pincode, isPrimary } = req.body;

    if (!fullName || !phone || !address || !city || !pincode) {

        return res.status(400).json({
            success: false,
            message: "Please fill all address details."
        });

    }

    // Check if this is the user's first address — if so, force it to be primary
    const countSql = `
        SELECT COUNT(*) AS total
        FROM addresses
        WHERE user_id = ?
    `;

    connection.query(
        countSql,
        [userId],
        (countErr, countResults) => {

            if (countErr) {

                return res.status(500).json({
                    success: false,
                    message: countErr.message
                });

            }

            const isFirstAddress = countResults[0].total === 0;
            const shouldBePrimary = isFirstAddress || !!isPrimary;

            const insertNewAddress = () => {

                const insertSql = `
                    INSERT INTO addresses
                        (user_id, full_name, phone, address, city, pincode, is_primary)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                connection.query(
                    insertSql,
                    [userId, fullName, phone, address, city, pincode, shouldBePrimary ? 1 : 0],
                    (insertErr, insertResult) => {

                        if (insertErr) {

                            return res.status(500).json({
                                success: false,
                                message: insertErr.message
                            });

                        }

                        return res.status(201).json({
                            success: true,
                            message: "Address added successfully",
                            addressId: insertResult.insertId
                        });

                    }
                );

            };

            // If this new address should be primary, unset any existing primary first
            if (shouldBePrimary) {

                const unsetSql = `
                    UPDATE addresses
                    SET is_primary = 0
                    WHERE user_id = ?
                `;

                connection.query(
                    unsetSql,
                    [userId],
                    (unsetErr) => {

                        if (unsetErr) {

                            return res.status(500).json({
                                success: false,
                                message: unsetErr.message
                            });

                        }

                        insertNewAddress();

                    }
                );

            } else {

                insertNewAddress();

            }

        }
    );

};

// ===============================
// Update Existing Address
// ===============================

const updateAddress = (req, res) => {

    const userId = req.user.id;
    const addressId = req.params.id;
    const { fullName, phone, address, city, pincode } = req.body;

    if (!fullName || !phone || !address || !city || !pincode) {

        return res.status(400).json({
            success: false,
            message: "Please fill all address details."
        });

    }

    const sql = `
        UPDATE addresses
        SET full_name = ?, phone = ?, address = ?, city = ?, pincode = ?
        WHERE id = ?
            AND user_id = ?
    `;

    connection.query(
        sql,
        [fullName, phone, address, city, pincode, addressId, userId],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: err.message
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Address not found"
                });

            }

            return res.status(200).json({
                success: true,
                message: "Address updated successfully"
            });

        }
    );

};

// ===============================
// Set Address as Primary
// ===============================

const setPrimaryAddress = (req, res) => {

    const userId = req.user.id;
    const addressId = req.params.id;

    // Step 1: unset all addresses for this user
    const unsetSql = `
        UPDATE addresses
        SET is_primary = 0
        WHERE user_id = ?
    `;

    connection.query(
        unsetSql,
        [userId],
        (unsetErr) => {

            if (unsetErr) {

                return res.status(500).json({
                    success: false,
                    message: unsetErr.message
                });

            }

            // Step 2: set the chosen one as primary
            const setSql = `
                UPDATE addresses
                SET is_primary = 1
                WHERE id = ?
                    AND user_id = ?
            `;

            connection.query(
                setSql,
                [addressId, userId],
                (setErr, result) => {

                    if (setErr) {

                        return res.status(500).json({
                            success: false,
                            message: setErr.message
                        });

                    }

                    if (result.affectedRows === 0) {

                        return res.status(404).json({
                            success: false,
                            message: "Address not found"
                        });

                    }

                    return res.status(200).json({
                        success: true,
                        message: "Primary address updated"
                    });

                }
            );

        }
    );

};

// ===============================
// Delete Address
// ===============================

const deleteAddress = (req, res) => {

    const userId = req.user.id;
    const addressId = req.params.id;

    // First check if the address being deleted is the primary one
    const checkSql = `
        SELECT is_primary
        FROM addresses
        WHERE id = ?
            AND user_id = ?
    `;

    connection.query(
        checkSql,
        [addressId, userId],
        (checkErr, checkResults) => {

            if (checkErr) {

                return res.status(500).json({
                    success: false,
                    message: checkErr.message
                });

            }

            if (checkResults.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Address not found"
                });

            }

            const wasPrimary = checkResults[0].is_primary === 1;

            const deleteSql = `
                DELETE FROM addresses
                WHERE id = ?
                    AND user_id = ?
            `;

            connection.query(
                deleteSql,
                [addressId, userId],
                (deleteErr) => {

                    if (deleteErr) {

                        return res.status(500).json({
                            success: false,
                            message: deleteErr.message
                        });

                    }

                    // If the deleted address was primary, promote the most recent remaining one
                    if (wasPrimary) {

                        const promoteSql = `
                            UPDATE addresses
                            SET is_primary = 1
                            WHERE user_id = ?
                            ORDER BY created_at DESC
                            LIMIT 1
                        `;

                        connection.query(
                            promoteSql,
                            [userId],
                            () => {

                                // Even if there's nothing left to promote, deletion itself succeeded
                                return res.status(200).json({
                                    success: true,
                                    message: "Address deleted successfully"
                                });

                            }
                        );

                    } else {

                        return res.status(200).json({
                            success: true,
                            message: "Address deleted successfully"
                        });

                    }

                }
            );

        }
    );

};

module.exports = {
    getAddresses,
    getPrimaryAddress,
    addAddress,
    updateAddress,
    setPrimaryAddress,
    deleteAddress
};