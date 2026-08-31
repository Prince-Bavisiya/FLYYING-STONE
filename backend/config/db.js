// config/db.js
const mysql = require("mysql2");

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce",
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 1,
    maxIdle: 1,
    idleTimeout: 10000,
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

// Global Singleton Pool pattern for Node.js / Vercel Serverless runtimes
if (!global.__mysqlPool) {
    global.__mysqlPool = mysql.createPool(dbConfig);
    console.log(`[DB SINGLETON] Initialized shared MySQL pool (host: ${dbConfig.host}:${dbConfig.port}, limit: ${dbConfig.connectionLimit})`);
}

const pool = global.__mysqlPool;

module.exports = pool;              // ✅ callback wale controllers ke liye
module.exports.promise = pool.promise(); // ✅ async/await wale controllers ke liye