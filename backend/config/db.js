// config/db.js
const mysql = require("mysql2");

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce",
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 2,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Check if Aiven MySQL or custom SSL mode is requested
if (process.env.DB_SSL === "true" || (dbConfig.host && dbConfig.host.includes("aivencloud.com"))) {
    dbConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = mysql.createPool(dbConfig);

console.log(`Database Pool Connected to ${dbConfig.host}:${dbConfig.port}`);

module.exports = pool;              // ✅ callback wale controllers ke liye
module.exports.promise = pool.promise(); // ✅ async/await wale controllers ke liye