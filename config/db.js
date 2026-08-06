// config/db.js
const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "ecommerce",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("Database Pool Connected");

module.exports = pool;              // ✅ callback wale controllers ke liye
module.exports.promise = pool.promise(); // ✅ async/await wale controllers ke liye