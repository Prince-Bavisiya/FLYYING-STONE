// config/db.js
const mysql = require("mysql2");

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce",
    waitForConnections: true,

    // ✅ Serverless (Vercel Lambda) me hamesha 1 hi rakho.
    // Har lambda container ka apna alag pool banta hai, isliye total
    // connections = concurrent containers x connectionLimit.
    // Isko 1 rakhne se ek container max 1 hi DB connection consume karega.
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 1,

    maxIdle: 0,           // ✅ Instant idle connection cleanup for Vercel Lambdas
    idleTimeout: 1000,    // ✅ 1-second idle timeout to prevent sleeping zombie connections on Clever Cloud
    queueLimit: 0,

    // 🔧 CHANGED: true rakha gaya hai taaki dead/broken TCP connections
    // jaldi detect ho sakein aur ghost connections DB side pe block na karein
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    // 🔧 NEW: naya connection lene ka max wait time (ms).
    // Isse queueLimit: 0 hone ke bawajood request turant fail hone ke bajaye
    // thoda wait kar legi agar sab connections busy hain
    connectTimeout: 10000
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

    // 🔧 NEW: pool-level error handler.
    // Serverless me agar underlying connection drop ho jaye (idle timeout,
    // DB restart, network blip), to ye event na pakadne par process crash
    // ya silent hang ho sakta hai. Isse sirf log hoga aur pool khud naya
    // connection le lega agle request pe.
    global.__mysqlPool.on("error", (err) => {
        console.error("[DB POOL ERROR]", err.code || err.message);
    });
}

const pool = global.__mysqlPool;

// 🔧 Auto-retry wrapper for mysql2 queries when max_user_connections is exceeded in serverless lambdas
if (!pool.__retryWrapped) {
    // 1. Wrap Callback Pool Query & Execute
    ["query", "execute"].forEach((method) => {
        if (typeof pool[method] === "function") {
            const originalMethod = pool[method].bind(pool);
            pool[method] = function (...args) {
                const callback = typeof args[args.length - 1] === "function" ? args.pop() : null;
                let retries = 0;
                const maxRetries = 5;

                function executeWithRetry() {
                    originalMethod(...args, (err, results, fields) => {
                        const isLimitError =
                            err &&
                            (err.code === "ER_USER_LIMIT_REACHED" ||
                                (err.message && err.message.includes("max_user_connections")));
                        if (isLimitError && retries < maxRetries) {
                            retries++;
                            const delay = retries * 300; // 300ms, 600ms, 900ms, 1200ms, 1500ms
                            console.warn(`[DB CALLBACK RETRY] max_user_connections hit. Retrying (${retries}/${maxRetries}) in ${delay}ms...`);
                            setTimeout(executeWithRetry, delay);
                        } else {
                            if (callback) callback(err, results, fields);
                        }
                    });
                }

                executeWithRetry();
            };
        }
    });

    pool.__retryWrapped = true;
}

// 2. Wrap Promise Pool Query & Execute
const promisePool = pool.promise();
if (!promisePool.__retryWrapped) {
    ["query", "execute"].forEach((method) => {
        if (typeof promisePool[method] === "function") {
            const originalMethod = promisePool[method].bind(promisePool);
            promisePool[method] = async function (...args) {
                let retries = 0;
                const maxRetries = 5;
                while (true) {
                    try {
                        return await originalMethod(...args);
                    } catch (err) {
                        const isLimitError =
                            err &&
                            (err.code === "ER_USER_LIMIT_REACHED" ||
                                (err.message && err.message.includes("max_user_connections")));
                        if (isLimitError && retries < maxRetries) {
                            retries++;
                            const delay = retries * 300;
                            console.warn(`[DB PROMISE RETRY] max_user_connections hit. Retrying (${retries}/${maxRetries}) in ${delay}ms...`);
                            await new Promise((resolve) => setTimeout(resolve, delay));
                        } else {
                            throw err;
                        }
                    }
                }
            };
        }
    });
    promisePool.__retryWrapped = true;
}

module.exports = pool;                     // ✅ callback wale controllers ke liye
module.exports.promise = promisePool;      // ✅ async/await wale controllers ke liye