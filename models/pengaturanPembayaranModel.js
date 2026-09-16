const db = require("../config/db");


// ========================================
// GET SEMUA PENGATURAN PEMBAYARAN
// ========================================

const getAllPengaturanPembayaran = (
    callback
) => {

    const sql = `
        SELECT
            id_pengaturan,
            metode,
            nama_penerima,
            nomor_rekening,
            nama_bank,
            qris,
            status,
            created_at,
            updated_at
        FROM pengaturan_pembayaran
        ORDER BY id_pengaturan ASC
    `;


    db.query(
        sql,
        callback
    );

};


// ========================================
// GET PENGATURAN BERDASARKAN ID
// ========================================

const getPengaturanPembayaranById = (
    id_pengaturan,
    callback
) => {

    const sql = `
        SELECT
            id_pengaturan,
            metode,
            nama_penerima,
            nomor_rekening,
            nama_bank,
            qris,
            status,
            created_at,
            updated_at
        FROM pengaturan_pembayaran
        WHERE id_pengaturan = ?
    `;


    db.query(
        sql,
        [
            id_pengaturan
        ],
        callback
    );

};


// ========================================
// GET QRIS AKTIF
// ========================================

const getQrisAktif = (
    callback
) => {

    const sql = `
        SELECT
            id_pengaturan,
            metode,
            nama_penerima,
            nomor_rekening,
            nama_bank,
            qris,
            status,
            created_at,
            updated_at
        FROM pengaturan_pembayaran
        WHERE metode = 'QRIS'
        AND status = 'Aktif'
        LIMIT 1
    `;


    db.query(
        sql,
        callback
    );

};


// ========================================
// CREATE PENGATURAN
// ========================================

const createPengaturanPembayaran = (
    data,
    callback
) => {

    const {
        metode,
        nama_penerima,
        nomor_rekening,
        nama_bank,
        qris,
        status
    } = data;


    const sql = `
        INSERT INTO pengaturan_pembayaran
        (
            metode,
            nama_penerima,
            nomor_rekening,
            nama_bank,
            qris,
            status
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
    `;


    db.query(
        sql,
        [
            metode,
            nama_penerima || null,
            nomor_rekening || null,
            nama_bank || null,
            qris || null,
            status || "Aktif"
        ],
        callback
    );

};


// ========================================
// UPDATE PENGATURAN
// ========================================

const updatePengaturanPembayaran = (
    id_pengaturan,
    data,
    callback
) => {

    const {
        metode,
        nama_penerima,
        nomor_rekening,
        nama_bank,
        qris,
        status
    } = data;


    const sql = `
        UPDATE pengaturan_pembayaran
        SET
            metode = ?,
            nama_penerima = ?,
            nomor_rekening = ?,
            nama_bank = ?,
            qris = COALESCE(?, qris),
            status = ?
        WHERE id_pengaturan = ?
    `;


    db.query(
        sql,
        [
            metode,
            nama_penerima || null,
            nomor_rekening || null,
            nama_bank || null,
            qris || null,
            status || "Aktif",
            id_pengaturan
        ],
        callback
    );

};


// ========================================
// UPDATE QRIS SAJA
// ========================================

const updateQris = (
    id_pengaturan,
    qris,
    callback
) => {

    const sql = `
        UPDATE pengaturan_pembayaran
        SET
            qris = ?
        WHERE
            id_pengaturan = ?
            AND metode = 'QRIS'
    `;


    db.query(
        sql,
        [
            qris,
            id_pengaturan
        ],
        callback
    );

};


// ========================================
// UPDATE DATA REKENING BANK
// ========================================

const updateBank = (
    id_pengaturan,
    data,
    callback
) => {

    const {
        nama_bank,
        nomor_rekening,
        nama_penerima
    } = data;


    const sql = `
        UPDATE pengaturan_pembayaran
        SET
            nama_bank = ?,
            nomor_rekening = ?,
            nama_penerima = ?
        WHERE
            id_pengaturan = ?
    `;


    db.query(
        sql,
        [
            nama_bank,
            nomor_rekening,
            nama_penerima,
            id_pengaturan
        ],
        callback
    );

};


// ========================================
// UPDATE STATUS
// ========================================

const updateStatusPengaturanPembayaran = (
    id_pengaturan,
    status,
    callback
) => {

    const sql = `
        UPDATE pengaturan_pembayaran
        SET
            status = ?
        WHERE id_pengaturan = ?
    `;


    db.query(
        sql,
        [
            status,
            id_pengaturan
        ],
        callback
    );

};


// ========================================
// DELETE
// ========================================

const deletePengaturanPembayaran = (
    id_pengaturan,
    callback
) => {

    const sql = `
        DELETE FROM pengaturan_pembayaran
        WHERE id_pengaturan = ?
    `;


    db.query(
        sql,
        [
            id_pengaturan
        ],
        callback
    );

};


// ========================================
// EXPORT
// ========================================

module.exports = {

    getAllPengaturanPembayaran,

    getPengaturanPembayaranById,

    getQrisAktif,

    createPengaturanPembayaran,

    updatePengaturanPembayaran,

    updateQris,

    updateBank,

    updateStatusPengaturanPembayaran,

    deletePengaturanPembayaran

};