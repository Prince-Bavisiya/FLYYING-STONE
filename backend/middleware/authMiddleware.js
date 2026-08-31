const jwt = require("jsonwebtoken");
const connection = require("../config/db");

const authMiddleware = (req, res, next) => {

    let token = req.cookies ? req.cookies.token : null;

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader !== "null" && authHeader !== "undefined" && authHeader !== "") {
            // Bearer token extract karo
            token = authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : authHeader;
        }
    }

    if (!token) {
        console.log("Blocking unauthorized request to:", req.originalUrl);
        return res.status(401).json({
            success: false,
            message: "No Token Provided"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        console.log("Blocking invalid/expired token request to:", req.originalUrl);
        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });

    }

};

const adminMiddleware = (req, res, next) => {

    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const sql = "SELECT id, role, status FROM users WHERE id = ?";
    connection.query(sql, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0 || results[0].role !== "admin" || results[0].status === "blocked") {
            return res.status(403).json({
                success: false,
                message: "Admin Access Only"
            });
        }

        req.user.role = results[0].role;
        next();
    });

};

module.exports = {
    authMiddleware,
    adminMiddleware
};