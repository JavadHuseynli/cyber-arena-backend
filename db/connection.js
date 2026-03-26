const mysql = require('mysql2/promise');
require('dotenv').config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cyber_arena',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
};

// Only use socket for local XAMPP, otherwise use SSL for remote
if (process.env.DB_HOST === 'localhost' || !process.env.DB_HOST) {
  poolConfig.socketPath = process.env.DB_SOCKET || '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock';
} else {
  poolConfig.ssl = { rejectUnauthorized: true };
}

const pool = mysql.createPool(poolConfig);

pool.getConnection()
  .then(conn => {
    console.log('✓ MySQL connected');
    conn.release();
  })
  .catch(err => {
    console.error('✗ MySQL connection failed:', err.message);
  });

module.exports = pool;
