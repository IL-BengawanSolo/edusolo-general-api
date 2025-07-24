import mysql from 'mysql2/promise';
import { MYSQL_DATABASE, MYSQL_HOST, MYSQL_USER, MYSQL_PORT, MYSQL_PASSWORD } from '../config/env.js';

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  port: MYSQL_PORT ? parseInt(MYSQL_PORT, 10) : 3306, // Default MySQL port is 3306
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Export the pool to be used in other modules
export default pool;