const db = require("../config/db");

// ======================================================
// GET SEMUA PEMBAYARAN
// ======================================================

const getAllPembayaran = (callback) => {
    const sql = `
        SELECT
            pb.id_pembayaran,
            pb.id_peminjaman,
            pb.tanggal_bayar,
            pb.total,
            pb.metode,
            pb.status,
            pb.bukti_bayar,

            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status AS status_peminjaman,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user

        FROM pembayaran pb

        INNER JOIN peminjaman pj
            ON pb.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        ORDER BY
            pb.id_pembayaran DESC
    `;

    db.query(
        sql,
        callback
    );
};


// ======================================================
// GET PEMBAYARAN BERDASARKAN ID
// ======================================================

const getPembayaranById = (
    id,
    callback
) => {

    const sql = `
        SELECT
            pb.id_pembayaran,
            pb.id_peminjaman,
            pb.tanggal_bayar,
            pb.total,
            pb.metode,
            pb.status,
            pb.bukti_bayar,

            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status AS status_peminjaman,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user,
            u.alamat AS alamat_user

        FROM pembayaran pb

        INNER JOIN peminjaman pj
            ON pb.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        WHERE pb.id_pembayaran = ?
    `;

    db.query(
        sql,
        [id],
        callback
    );
};


// ======================================================
// GET PEMBAYARAN BERDASARKAN PEMINJAMAN
// ======================================================

const getPembayaranByPeminjaman = (
    idPeminjaman,
    callback
) => {

    const sql = `
        SELECT
            pb.id_pembayaran,
            pb.id_peminjaman,
            pb.tanggal_bayar,
            pb.total,
            pb.metode,
            pb.status,
            pb.bukti_bayar,

            pj.total_harga,
            pj.status AS status_peminjaman,

            u.nama AS nama_user,
            u.email AS email_user

        FROM pembayaran pb

        INNER JOIN peminjaman pj
            ON pb.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        WHERE pb.id_peminjaman = ?

        ORDER BY
            pb.id_pembayaran DESC
    `;

    db.query(
        sql,
        [idPeminjaman],
        callback
    );
};


// ======================================================
// CEK PEMBAYARAN UNTUK PEMINJAMAN
// ======================================================

const checkExistingPembayaran = (
    idPeminjaman,
    callback
) => {

    const sql = `
        SELECT
            id_pembayaran,
            id_peminjaman,
            total,
            metode,
            status,
            bukti_bayar

        FROM pembayaran

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
// CREATE PEMBAYARAN
// ======================================================

const createPembayaran = (
    data,
    callback
) => {

    const sql = `
        INSERT INTO pembayaran
        (
            id_peminjaman,
            tanggal_bayar,
            total,
            metode,
            status,
            bukti_bayar
        )

        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const idPeminjaman =
        data.id_peminjaman;

    const tanggalBayar =
        data.tanggal_bayar ||
        null;

    const total =
        data.total ?? 0;

    const metode =
        data.metode ||
        null;

    const status =
        data.status ||
        "Belum Bayar";

    const buktiBayar =
        data.bukti_bayar ||
        null;

    db.query(
        sql,
        [
            idPeminjaman,
            tanggalBayar,
            total,
            metode,
            status,
            buktiBayar
        ],
        callback
    );
};


// ======================================================
// UPDATE PEMBAYARAN
// ======================================================

const updatePembayaran = (
    id,
    data,
    callback
) => {

    /*
        Jika bukti_bayar tidak dikirim,
        bukti lama tetap dipertahankan.
    */

    const sql = `
        UPDATE pembayaran

        SET
            id_peminjaman = ?,
            tanggal_bayar = ?,
            total = ?,
            metode = ?,
            status = ?,
            bukti_bayar = COALESCE(?, bukti_bayar)

        WHERE id_pembayaran = ?
    `;

    const idPeminjaman =
        data.id_peminjaman;

    const tanggalBayar =
        data.tanggal_bayar ||
        null;

    const total =
        data.total ?? 0;

    const metode =
        data.metode ||
        null;

    const status =
        data.status ||
        "Belum Bayar";

    /*
        null berarti jangan mengganti
        bukti pembayaran yang sudah ada.
    */

    const buktiBayar =
        data.bukti_bayar ||
        null;

    db.query(
        sql,
        [
            idPeminjaman,
            tanggalBayar,
            total,
            metode,
            status,
            buktiBayar,
            id
        ],
        callback
    );
};


// ======================================================
// UPDATE STATUS PEMBAYARAN
// ======================================================

const updateStatusPembayaran = (
    id,
    status,
    callback
) => {

    const sql = `
        UPDATE pembayaran

        SET status = ?

        WHERE id_pembayaran = ?
    `;

    db.query(
        sql,
        [
            status,
            id
        ],
        callback
    );
};


// ======================================================
// DELETE PEMBAYARAN
// ======================================================

const deletePembayaran = (
    id,
    callback
) => {

    const sql = `
        DELETE FROM pembayaran

        WHERE id_pembayaran = ?
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

    getAllPembayaran,

    getPembayaranById,

    getPembayaranByPeminjaman,

    checkExistingPembayaran,

    createPembayaran,

    updatePembayaran,

    updateStatusPembayaran,

    deletePembayaran

};