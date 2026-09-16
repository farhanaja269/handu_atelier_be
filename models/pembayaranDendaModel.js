// ======================================================
// models/pembayaranDendaModel.js
// ======================================================

const db = require("../config/db");

// ======================================================
// GET SEMUA PEMBAYARAN DENDA
// ======================================================

const getAllPembayaranDenda = (callback) => {
    const sql = `
        SELECT
            pd.id_pembayaran_denda,
            pd.id_denda,
            pd.tanggal_bayar,
            pd.jumlah,
            pd.metode,
            pd.bukti_bayar,
            pd.status,
            pd.diverifikasi_oleh,
            pd.tanggal_verifikasi,
            pd.keterangan,
            pd.created_at,
            pd.updated_at,

            d.nominal_denda,
            d.alasan,
            d.status AS status_denda,

            pg.id_pengembalian,
            pg.id_peminjaman,
            pg.tanggal_pengembalian,
            pg.kondisi_baju,

            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status AS status_peminjaman,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user

        FROM pembayaran_denda pd

        INNER JOIN denda d
            ON pd.id_denda = d.id_denda

        INNER JOIN pengembalian pg
            ON d.id_pengembalian = pg.id_pengembalian

        INNER JOIN peminjaman pj
            ON pg.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        ORDER BY
            pd.id_pembayaran_denda DESC
    `;

    db.query(sql, callback);
};


// ======================================================
// GET PEMBAYARAN DENDA BERDASARKAN ID
// ======================================================

const getPembayaranDendaById = (id, callback) => {

    const sql = `
        SELECT
            pd.id_pembayaran_denda,
            pd.id_denda,
            pd.tanggal_bayar,
            pd.jumlah,
            pd.metode,
            pd.bukti_bayar,
            pd.status,
            pd.diverifikasi_oleh,
            pd.tanggal_verifikasi,
            pd.keterangan,
            pd.created_at,
            pd.updated_at,

            d.nominal_denda,
            d.alasan,
            d.status AS status_denda,

            pg.id_pengembalian,
            pg.id_peminjaman,
            pg.tanggal_pengembalian,
            pg.kondisi_baju,

            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status AS status_peminjaman,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user

        FROM pembayaran_denda pd

        INNER JOIN denda d
            ON pd.id_denda = d.id_denda

        INNER JOIN pengembalian pg
            ON d.id_pengembalian = pg.id_pengembalian

        INNER JOIN peminjaman pj
            ON pg.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        WHERE pd.id_pembayaran_denda = ?

        LIMIT 1
    `;

    db.query(
        sql,
        [Number(id)],
        callback
    );
};


// ======================================================
// GET PEMBAYARAN DENDA BERDASARKAN ID DENDA
// ======================================================

const getPembayaranDendaByDenda = (idDenda, callback) => {

    const sql = `
        SELECT
            pd.id_pembayaran_denda,
            pd.id_denda,
            pd.tanggal_bayar,
            pd.jumlah,
            pd.metode,
            pd.bukti_bayar,
            pd.status,
            pd.diverifikasi_oleh,
            pd.tanggal_verifikasi,
            pd.keterangan,
            pd.created_at,
            pd.updated_at,

            d.nominal_denda,
            d.alasan,
            d.status AS status_denda,

            pg.id_pengembalian,
            pg.id_peminjaman,

            pj.id_user,
            pj.total_harga,
            pj.status AS status_peminjaman,

            u.nama AS nama_user,
            u.email AS email_user

        FROM pembayaran_denda pd

        INNER JOIN denda d
            ON pd.id_denda = d.id_denda

        INNER JOIN pengembalian pg
            ON d.id_pengembalian = pg.id_pengembalian

        INNER JOIN peminjaman pj
            ON pg.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        WHERE pd.id_denda = ?

        ORDER BY
            pd.id_pembayaran_denda DESC
    `;

    db.query(
        sql,
        [Number(idDenda)],
        callback
    );
};


// ======================================================
// CEK PEMBAYARAN DENDA YANG SUDAH ADA
// ======================================================

const checkExistingPembayaranDenda = (idDenda, callback) => {

    const sql = `
        SELECT
            id_pembayaran_denda,
            id_denda,
            tanggal_bayar,
            jumlah,
            metode,
            bukti_bayar,
            status
        FROM pembayaran_denda
        WHERE id_denda = ?
        ORDER BY id_pembayaran_denda DESC
        LIMIT 1
    `;

    db.query(
        sql,
        [Number(idDenda)],
        callback
    );
};


// ======================================================
// CREATE PEMBAYARAN DENDA
// ======================================================
// Status pembayaran otomatis:
// "Menunggu Verifikasi"
// Frontend tidak boleh menentukan status sendiri.
// ======================================================

const createPembayaranDenda = (data, callback) => {

    const idDenda = Number(data.id_denda);

    const tanggalBayar =
        data.tanggal_bayar || null;

    const jumlah =
        Number(data.jumlah);

    const metode =
        data.metode || null;

    const buktiBayar =
        data.bukti_bayar || null;

    const keterangan =
        data.keterangan || null;


    // ------------------------------------------
    // VALIDASI ID DENDA
    // ------------------------------------------

    if (
        !idDenda ||
        isNaN(idDenda)
    ) {
        return callback(
            new Error(
                "ID denda tidak valid."
            )
        );
    }


    // ------------------------------------------
    // VALIDASI JUMLAH
    // ------------------------------------------

    if (
        isNaN(jumlah) ||
        jumlah <= 0
    ) {
        return callback(
            new Error(
                "Jumlah pembayaran denda tidak valid."
            )
        );
    }


    // ------------------------------------------
    // VALIDASI METODE
    // ------------------------------------------

    const allowedMetode = [
        "Cash",
        "Transfer",
        "QRIS"
    ];

    if (
        !allowedMetode.includes(metode)
    ) {
        return callback(
            new Error(
                "Metode pembayaran denda tidak valid."
            )
        );
    }


    // ------------------------------------------
    // INSERT
    // ------------------------------------------
    // Status SELALU:
    // Menunggu Verifikasi
    // ------------------------------------------

    const sql = `
        INSERT INTO pembayaran_denda
        (
            id_denda,
            tanggal_bayar,
            jumlah,
            metode,
            bukti_bayar,
            status,
            keterangan
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            idDenda,
            tanggalBayar,
            jumlah,
            metode,
            buktiBayar,
            "Menunggu Verifikasi",
            keterangan
        ],
        callback
    );
};


// ======================================================
// UPDATE PEMBAYARAN DENDA
// ======================================================
// Update data pembayaran.
// Status TIDAK diubah melalui fungsi ini.
// Perubahan status hanya melalui updateStatusPembayaranDenda.
// ======================================================

const updatePembayaranDenda = (
    id,
    data,
    callback
) => {

    const tanggalBayar =
        data.tanggal_bayar || null;

    const jumlah =
        Number(data.jumlah);

    const metode =
        data.metode || null;

    const keterangan =
        data.keterangan || null;

    const buktiBayar =
        data.bukti_bayar || null;


    // ------------------------------------------
    // VALIDASI JUMLAH
    // ------------------------------------------

    if (
        isNaN(jumlah) ||
        jumlah <= 0
    ) {
        return callback(
            new Error(
                "Jumlah pembayaran denda tidak valid."
            )
        );
    }


    // ------------------------------------------
    // VALIDASI METODE
    // ------------------------------------------

    const allowedMetode = [
        "Cash",
        "Transfer",
        "QRIS"
    ];

    if (
        !allowedMetode.includes(metode)
    ) {
        return callback(
            new Error(
                "Metode pembayaran denda tidak valid."
            )
        );
    }


    // ------------------------------------------
    // UPDATE
    // ------------------------------------------
    // Status tidak disentuh.
    // ------------------------------------------

    const sql = `
        UPDATE pembayaran_denda
        SET
            tanggal_bayar = ?,
            jumlah = ?,
            metode = ?,
            bukti_bayar = COALESCE(?, bukti_bayar),
            keterangan = ?
        WHERE id_pembayaran_denda = ?
    `;

    db.query(
        sql,
        [
            tanggalBayar,
            jumlah,
            metode,
            buktiBayar,
            keterangan,
            Number(id)
        ],
        callback
    );
};


// ======================================================
// UPDATE STATUS PEMBAYARAN DENDA
// ======================================================

const updateStatusPembayaranDenda = (
    id,
    status,
    diverifikasiOleh,
    tanggalVerifikasi,
    keterangan,
    callback
) => {

    const allowedStatus = [
        "Belum Bayar",
        "Menunggu Verifikasi",
        "Lunas"
    ];

    if (
        !allowedStatus.includes(status)
    ) {
        return callback(
            new Error(
                "Status pembayaran denda tidak valid."
            )
        );
    }


    // ------------------------------------------
    // UPDATE STATUS
    // ------------------------------------------

    const sql = `
        UPDATE pembayaran_denda
        SET
            status = ?,
            diverifikasi_oleh = ?,
            tanggal_verifikasi = ?,
            keterangan = COALESCE(?, keterangan)
        WHERE id_pembayaran_denda = ?
    `;

    db.query(
        sql,
        [
            status,
            diverifikasiOleh
                ? Number(diverifikasiOleh)
                : null,

            tanggalVerifikasi || null,

            keterangan || null,

            Number(id)
        ],
        callback
    );
};


// ======================================================
// DELETE PEMBAYARAN DENDA
// ======================================================

const deletePembayaranDenda = (
    id,
    callback
) => {

    const sql = `
        DELETE FROM pembayaran_denda
        WHERE id_pembayaran_denda = ?
    `;

    db.query(
        sql,
        [Number(id)],
        callback
    );
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getAllPembayaranDenda,

    getPembayaranDendaById,

    getPembayaranDendaByDenda,

    checkExistingPembayaranDenda,

    createPembayaranDenda,

    updatePembayaranDenda,

    updateStatusPembayaranDenda,

    deletePembayaranDenda

};