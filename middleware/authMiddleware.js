const jwt = require("jsonwebtoken");

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
            message: "Invalid Token"
        });

    }

};

const adminMiddleware = (req, res, next) => {

    if (req.user.role !== "admin") {

        return res.status(403).json({
            success: false,
            message: "Admin Access Only"
        });

    }

    next();

};

module.exports = {
    authMiddleware,
    adminMiddleware
};