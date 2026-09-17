const db = require("../config/db");

// ======================================================
// GET SEMUA DOKUMEN JAMINAN
// ======================================================

const getAllDokumenJaminan = (callback) => {
    const sql = `
        SELECT
            dj.id_dokumen_jaminan,
            dj.id_peminjaman,
            dj.jenis_dokumen,
            dj.nama_file,
            dj.path_file,
            dj.mime_type,
            dj.ukuran_file,
            dj.status,
            dj.diverifikasi_oleh,
            dj.tanggal_verifikasi,
            dj.keterangan,
            dj.created_at,
            dj.updated_at,

            p.tanggal_peminjaman,
            p.tanggal_kembali,
            p.total_harga,
            p.status AS status_peminjaman,

            u.id_user,
            u.nama AS nama_pelanggan,
            u.email,
            u.no_hp

        FROM dokumen_jaminan dj

        INNER JOIN peminjaman p
            ON dj.id_peminjaman = p.id_peminjaman

        INNER JOIN users u
            ON p.id_user = u.id_user

        ORDER BY dj.id_dokumen_jaminan DESC
    `;

    db.query(sql, callback);
};


// ======================================================
// GET DOKUMEN BERDASARKAN ID
// ======================================================

const getDokumenJaminanById = (id, callback) => {
    const sql = `
        SELECT
            dj.id_dokumen_jaminan,
            dj.id_peminjaman,
            dj.jenis_dokumen,
            dj.nama_file,
            dj.path_file,
            dj.mime_type,
            dj.ukuran_file,
            dj.status,
            dj.diverifikasi_oleh,
            dj.tanggal_verifikasi,
            dj.keterangan,
            dj.created_at,
            dj.updated_at,

            p.tanggal_peminjaman,
            p.tanggal_kembali,
            p.total_harga,
            p.status AS status_peminjaman,

            u.id_user,
            u.nama AS nama_pelanggan,
            u.email,
            u.no_hp

        FROM dokumen_jaminan dj

        INNER JOIN peminjaman p
            ON dj.id_peminjaman = p.id_peminjaman

        INNER JOIN users u
            ON p.id_user = u.id_user

        WHERE dj.id_dokumen_jaminan = ?

        LIMIT 1
    `;

    db.query(sql, [id], callback);
};


// ======================================================
// GET DOKUMEN BERDASARKAN PEMINJAMAN
// ======================================================

const getDokumenJaminanByPeminjaman = (
    idPeminjaman,
    callback
) => {
    const sql = `
        SELECT
            dj.id_dokumen_jaminan,
            dj.id_peminjaman,
            dj.jenis_dokumen,
            dj.nama_file,
            dj.path_file,
            dj.mime_type,
            dj.ukuran_file,
            dj.status,
            dj.diverifikasi_oleh,
            dj.tanggal_verifikasi,
            dj.keterangan,
            dj.created_at,
            dj.updated_at,

            p.tanggal_peminjaman,
            p.tanggal_kembali,
            p.total_harga,
            p.status AS status_peminjaman,

            u.id_user,
            u.nama AS nama_pelanggan,
            u.email,
            u.no_hp

        FROM dokumen_jaminan dj

        INNER JOIN peminjaman p
            ON dj.id_peminjaman = p.id_peminjaman

        INNER JOIN users u
            ON p.id_user = u.id_user

        WHERE dj.id_peminjaman = ?

        ORDER BY dj.id_dokumen_jaminan DESC

        LIMIT 1
    `;

    db.query(
        sql,
        [idPeminjaman],
        callback
    );
};


// ======================================================
// CEK APAKAH PEMINJAMAN SUDAH MEMILIKI DOKUMEN
// ======================================================

const checkExistingDokumenJaminan = (
    idPeminjaman,
    callback
) => {
    const sql = `
        SELECT
            id_dokumen_jaminan,
            id_peminjaman,
            jenis_dokumen,
            nama_file,
            path_file,
            mime_type,
            ukuran_file,
            status,
            diverifikasi_oleh,
            tanggal_verifikasi,
            keterangan,
            created_at,
            updated_at

        FROM dokumen_jaminan

        WHERE id_peminjaman = ?

        LIMIT 1
    `;

    db.query(
        sql,
        [idPeminjaman],
        callback
    );
};


// ======================================================
// CREATE DOKUMEN JAMINAN
// ======================================================

const createDokumenJaminan = (
    data,
    callback
) => {
    const sql = `
        INSERT INTO dokumen_jaminan (
            id_peminjaman,
            jenis_dokumen,
            nama_file,
            path_file,
            mime_type,
            ukuran_file,
            status,
            diverifikasi_oleh,
            tanggal_verifikasi,
            keterangan
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.id_peminjaman,
        data.jenis_dokumen,
        data.nama_file,
        data.path_file,
        data.mime_type,
        data.ukuran_file,
        data.status || "Menunggu Verifikasi",
        data.diverifikasi_oleh || null,
        data.tanggal_verifikasi || null,
        data.keterangan || null,
    ];

    db.query(
        sql,
        values,
        callback
    );
};


// ======================================================
// UPDATE DOKUMEN JAMINAN
// ======================================================

const updateDokumenJaminan = (
    id,
    data,
    callback
) => {
    const sql = `
        UPDATE dokumen_jaminan

        SET
            jenis_dokumen = ?,
            nama_file = ?,
            path_file = ?,
            mime_type = ?,
            ukuran_file = ?,
            keterangan = ?

        WHERE id_dokumen_jaminan = ?
    `;

    const values = [
        data.jenis_dokumen,
        data.nama_file,
        data.path_file,
        data.mime_type,
        data.ukuran_file,
        data.keterangan || null,
        id,
    ];

    db.query(
        sql,
        values,
        callback
    );
};


// ======================================================
// UPDATE STATUS DOKUMEN
// ======================================================

const updateStatusDokumenJaminan = (
    id,
    status,
    diverifikasiOleh,
    keterangan,
    callback
) => {
    const sql = `
        UPDATE dokumen_jaminan

        SET
            status = ?,
            diverifikasi_oleh = ?,
            tanggal_verifikasi = NOW(),
            keterangan = ?

        WHERE id_dokumen_jaminan = ?
    `;

    db.query(
        sql,
        [
            status,
            diverifikasiOleh || null,
            keterangan || null,
            id,
        ],
        callback
    );
};


// ======================================================
// DELETE DOKUMEN
// ======================================================

const deleteDokumenJaminan = (
    id,
    callback
) => {
    const sql = `
        DELETE FROM dokumen_jaminan

        WHERE id_dokumen_jaminan = ?
    `;

    db.query(
        sql,
        [id],
        callback
    );
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getAllDokumenJaminan,
    getDokumenJaminanById,
    getDokumenJaminanByPeminjaman,
    checkExistingDokumenJaminan,
    createDokumenJaminan,
    updateDokumenJaminan,
    updateStatusDokumenJaminan,
    deleteDokumenJaminan,
};