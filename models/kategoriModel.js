const db = require("../config/db");

// ========================================
// GET SEMUA KATEGORI
// ========================================

const getAllKategori = (callback) => {
    const sql = `
        SELECT
            id_kategori,
            nama_kategori
        FROM kategori
        ORDER BY id_kategori ASC
    `;

    db.query(sql, callback);
};

// ========================================
// GET KATEGORI BERDASARKAN ID
// ========================================

const getKategoriById = (id, callback) => {
    const sql = `
        SELECT
            id_kategori,
            nama_kategori
        FROM kategori
        WHERE id_kategori = ?
    `;

    db.query(
        sql,
        [id],
        callback
    );
};

// ========================================
// CREATE KATEGORI
// ========================================

const createKategori = (data, callback) => {
    const sql = `
        INSERT INTO kategori
        (
            nama_kategori
        )
        VALUES (?)
    `;

    db.query(
        sql,
        [
            data.nama_kategori
        ],
        callback
    );
};

// ========================================
// UPDATE KATEGORI
// ========================================

const updateKategori = (
    id,
    data,
    callback
) => {
    const sql = `
        UPDATE kategori
        SET
            nama_kategori = ?
        WHERE id_kategori = ?
    `;

    db.query(
        sql,
        [
            data.nama_kategori,
            id
        ],
        callback
    );
};

// ========================================
// DELETE KATEGORI
// ========================================

const deleteKategori = (
    id,
    callback
) => {
    const sql = `
        DELETE FROM kategori
        WHERE id_kategori = ?
    `;

    db.query(
        sql,
        [id],
        callback
    );
};

// ========================================
// EXPORT
// ========================================

module.exports = {
    getAllKategori,
    getKategoriById,
    createKategori,
    updateKategori,
    deleteKategori
};