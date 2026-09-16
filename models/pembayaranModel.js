// models/pembayaranModel.js

const db = require("../config/db");


// ======================================================
// KONSTANTA VALIDASI
// ======================================================

const ALLOWED_STATUS = [
    "Belum Bayar",
    "Lunas"
];

const ALLOWED_METODE = [
    "QRIS",
    "Transfer Bank",
    "Cash"
];


// ======================================================
// HELPER
// ======================================================

const isValidId = (value) => {

    return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !isNaN(value) &&
        Number(value) > 0
    );

};


const isValidPositiveNumber = (value) => {

    return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !isNaN(value) &&
        Number(value) > 0
    );

};


// ======================================================
// GET SEMUA PEMBAYARAN
// ======================================================

const getAllPembayaran = (
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

            u.no_hp AS no_hp_user

        FROM pembayaran pb

        INNER JOIN peminjaman pj
            ON pb.id_peminjaman =
               pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user =
               u.id_user

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

    if (
        !isValidId(id)
    ) {

        return callback(
            new Error(
                "ID pembayaran tidak valid."
            )
        );

    }


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
            ON pb.id_peminjaman =
               pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user =
               u.id_user

        WHERE
            pb.id_pembayaran = ?

    `;


    db.query(
        sql,
        [Number(id)],
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

    if (
        !isValidId(idPeminjaman)
    ) {

        return callback(
            new Error(
                "ID peminjaman tidak valid."
            )
        );

    }


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
            ON pb.id_peminjaman =
               pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user =
               u.id_user

        WHERE
            pb.id_peminjaman = ?

        ORDER BY
            pb.id_pembayaran DESC

    `;


    db.query(
        sql,
        [Number(idPeminjaman)],
        callback
    );

};


// ======================================================
// CEK PEMBAYARAN UNTUK PEMINJAMAN
// ======================================================
//
// Sistem menggunakan satu pembayaran untuk satu
// peminjaman.
//
// Jadi fungsi ini digunakan sebelum CREATE.
//
// ======================================================

const checkExistingPembayaran = (
    idPeminjaman,
    callback
) => {

    if (
        !isValidId(idPeminjaman)
    ) {

        return callback(
            new Error(
                "ID peminjaman tidak valid."
            )
        );

    }


    const sql = `

        SELECT

            id_pembayaran,

            id_peminjaman,

            total,

            metode,

            status,

            bukti_bayar

        FROM pembayaran

        WHERE
            id_peminjaman = ?

        ORDER BY
            id_pembayaran DESC

        LIMIT 1

    `;


    db.query(
        sql,
        [Number(idPeminjaman)],
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

    data =
        data || {};


    // ==================================================
    // VALIDASI ID PEMINJAMAN
    // ==================================================

    if (
        !isValidId(
            data.id_peminjaman
        )
    ) {

        return callback(
            new Error(
                "ID peminjaman tidak valid."
            )
        );

    }


    // ==================================================
    // VALIDASI TOTAL
    // ==================================================

    if (
        !isValidPositiveNumber(
            data.total
        )
    ) {

        return callback(
            new Error(
                "Total pembayaran harus lebih dari 0."
            )
        );

    }


    // ==================================================
    // VALIDASI METODE
    // ==================================================

    if (
        !ALLOWED_METODE.includes(
            data.metode
        )
    ) {

        return callback(
            new Error(
                "Metode pembayaran tidak valid."
            )
        );

    }


    // ==================================================
    // VALIDASI STATUS
    // ==================================================

    const status =
        data.status ||
        "Belum Bayar";


    if (
        !ALLOWED_STATUS.includes(
            status
        )
    ) {

        return callback(
            new Error(
                "Status pembayaran tidak valid."
            )
        );

    }


    // ==================================================
    // SIAPKAN DATA
    // ==================================================

    const idPeminjaman =
        Number(
            data.id_peminjaman
        );


    const tanggalBayar =
        data.tanggal_bayar ||
        null;


    const total =
        Number(
            data.total
        );


    const metode =
        data.metode;


    const buktiBayar =
        data.bukti_bayar ||
        null;


    // ==================================================
    // INSERT
    // ==================================================

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

    if (
        !isValidId(id)
    ) {

        return callback(
            new Error(
                "ID pembayaran tidak valid."
            )
        );

    }


    data =
        data || {};


    // ==================================================
    // VALIDASI ID PEMINJAMAN
    // ==================================================

    if (
        !isValidId(
            data.id_peminjaman
        )
    ) {

        return callback(
            new Error(
                "ID peminjaman tidak valid."
            )
        );

    }


    // ==================================================
    // VALIDASI TOTAL
    // ==================================================

    if (
        !isValidPositiveNumber(
            data.total
        )
    ) {

        return callback(
            new Error(
                "Total pembayaran harus lebih dari 0."
            )
        );

    }


    // ==================================================
    // VALIDASI METODE
    // ==================================================

    if (
        !ALLOWED_METODE.includes(
            data.metode
        )
    ) {

        return callback(
            new Error(
                "Metode pembayaran tidak valid."
            )
        );

    }


    // ==================================================
    // VALIDASI STATUS
    // ==================================================

    const status =
        data.status ||
        "Belum Bayar";


    if (
        !ALLOWED_STATUS.includes(
            status
        )
    ) {

        return callback(
            new Error(
                "Status pembayaran tidak valid."
            )
        );

    }


    // ==================================================
    // SIAPKAN DATA
    // ==================================================

    const idPeminjaman =
        Number(
            data.id_peminjaman
        );


    const tanggalBayar =
        data.tanggal_bayar ||
        null;


    const total =
        Number(
            data.total
        );


    const metode =
        data.metode;


    /*
        Jika bukti_bayar bernilai null,
        bukti lama tetap dipertahankan.
    */

    const buktiBayar =
        data.bukti_bayar ||
        null;


    // ==================================================
    // UPDATE
    // ==================================================

    const sql = `

        UPDATE pembayaran

        SET

            id_peminjaman = ?,

            tanggal_bayar = ?,

            total = ?,

            metode = ?,

            status = ?,

            bukti_bayar =
                COALESCE(
                    ?,
                    bukti_bayar
                )

        WHERE
            id_pembayaran = ?

    `;


    db.query(
        sql,
        [

            idPeminjaman,

            tanggalBayar,

            total,

            metode,

            status,

            buktiBayar,

            Number(id)

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

    if (
        !isValidId(id)
    ) {

        return callback(
            new Error(
                "ID pembayaran tidak valid."
            )
        );

    }


    // ==================================================
    // VALIDASI STATUS
    // ==================================================

    if (
        !ALLOWED_STATUS.includes(
            status
        )
    ) {

        return callback(
            new Error(
                "Status pembayaran tidak valid."
            )
        );

    }


    // ==================================================
    // UPDATE
    // ==================================================

    const sql = `

        UPDATE pembayaran

        SET
            status = ?

        WHERE
            id_pembayaran = ?

    `;


    db.query(
        sql,
        [

            status,

            Number(id)

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

    if (
        !isValidId(id)
    ) {

        return callback(
            new Error(
                "ID pembayaran tidak valid."
            )
        );

    }


    const sql = `

        DELETE FROM pembayaran

        WHERE
            id_pembayaran = ?

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

    getAllPembayaran,

    getPembayaranById,

    getPembayaranByPeminjaman,

    checkExistingPembayaran,

    createPembayaran,

    updatePembayaran,

    updateStatusPembayaran,

    deletePembayaran

};