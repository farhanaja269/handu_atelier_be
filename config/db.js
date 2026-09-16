// config/db.js

const mysql = require("mysql2");
require("dotenv").config();

// ======================================================
// DATABASE CONNECTION POOL
// ======================================================

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",

    user: process.env.DB_USER || "root",

    password:
        process.env.DB_PASSWORD || "",

    database:
        process.env.DB_NAME || "handu_atelier",

    port:
        Number(process.env.DB_PORT) || 3306,

    // ==============================================
    // POOL SETTINGS
    // ==============================================

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,

    // menjaga koneksi tetap aktif
    enableKeepAlive: true,

    keepAliveInitialDelay: 0,
});

// ======================================================
// TEST DATABASE
// ======================================================

db.getConnection((err, connection) => {
    if (err) {
        console.error(
            "❌ Koneksi database gagal!"
        );

        console.error(
            "Error:",
            err.message
        );

        console.error(
            "Pastikan MySQL/MariaDB sedang berjalan."
        );

        return;
    }

    console.log(
        "✅ Database berhasil terhubung"
    );

    connection.release();
});

// ======================================================
// EXPORT
// ======================================================

module.exports = db;