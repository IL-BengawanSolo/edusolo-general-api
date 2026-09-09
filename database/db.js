import mysql from 'mysql2/promise';
import { DATABASE_URL, MYSQL_DATABASE, MYSQL_HOST, MYSQL_USER, MYSQL_PORT, MYSQL_PASSWORD } from '../config/env.js';

let poolConfig;
if (DATABASE_URL) {
  // TiDB Cloud / PlanetScale DATABASE_URL: mysql://user:pass@host:port/db?sslMode=VERIFY_IDENTITY
  poolConfig = DATABASE_URL;
} else {
  poolConfig = {
    host: MYSQL_HOST,
    user: MYSQL_USER,
    port: MYSQL_PORT ? parseInt(MYSQL_PORT, 10) : 4000,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.MYSQL_POOL_LIMIT, 10) || 10,
    maxIdle: parseInt(process.env.MYSQL_POOL_LIMIT, 10) || 10,
    idleTimeout: 60000,
    queueLimit: 20,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: "utf8mb4",
    timezone: "+07:00",
    connectTimeout: 10000,
    ssl: { rejectUnauthorized: true },
  };
}

const pool = mysql.createPool(poolConfig);

pool.on("connection", (conn) => {
  conn.query("SET time_zone = '+07:00'");
});

pool.on("error", (err) => {
  console.error("[DB] Pool error:", err.message);
});

// Export the pool to be used in other modules
export default pool;