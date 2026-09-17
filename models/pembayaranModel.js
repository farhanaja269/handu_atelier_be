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
        Number.isInteger(Number(value)) &&
        Number(value) > 0
    );
};


const isValidPositiveNumber = (value) => {
    return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        Number.isFinite(Number(value)) &&
        Number(value) > 0
    );
};


const roundMoney = (value) => {
    return Math.round(
        (Number(value) + Number.EPSILON) * 100
    ) / 100;
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
        [
            Number(id)
        ],
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
        [
            Number(idPeminjaman)
        ],
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
// Fungsi ini dipanggil sebelum CREATE.
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
        [
            Number(idPeminjaman)
        ],
        callback
    );

};


// ======================================================
// CREATE PEMBAYARAN
// ======================================================
//
// Model menerima data dari controller.
//
// Controller sudah memastikan:
// - nominal = DP 50% atau 100%
// - status = Belum Bayar
//
// Model tetap melakukan validasi dasar sebagai
// lapisan keamanan tambahan.
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
    // STATUS CREATE SELALU BELUM BAYAR
    // ==================================================
    //
    // Jangan menerima status dari frontend.
    // Customer tidak boleh membuat pembayaran langsung
    // sebagai Lunas.
    // ==================================================

    const status =
        "Belum Bayar";


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
        roundMoney(
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
//
// Update hanya digunakan untuk pembayaran yang masih
// Belum Bayar.
//
// Controller sudah memvalidasi nominal dan metode.
//
// Status selalu kembali/bertahan sebagai Belum Bayar.
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
    // STATUS SELALU BELUM BAYAR
    // ==================================================

    const status =
        "Belum Bayar";


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
        roundMoney(
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
//
// ALUR STATUS:
//
// Belum Bayar
//      ↓
//    Lunas
//
// Tidak diperbolehkan:
//
// Lunas
//   ↓
// Belum Bayar
//
// Controller melakukan validasi sebelum memanggil
// fungsi ini. Model juga membatasi transisi secara
// langsung menggunakan kondisi WHERE.
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
    // STATUS YANG DIIZINKAN
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
    // HANYA BOLEH:
    //
    // Belum Bayar -> Lunas
    //
    // ==================================================

    if (
        status !==
        "Lunas"
    ) {

        return callback(
            new Error(
                "Status pembayaran hanya dapat diubah menjadi Lunas."
            )
        );

    }


    // ==================================================
    // UPDATE DENGAN KONDISI STATUS
    // ==================================================
    //
    // Kondisi:
    // status lama harus Belum Bayar.
    //
    // Dengan demikian:
    // Lunas -> Belum Bayar tidak mungkin dilakukan
    // melalui model ini.
    // ==================================================

    const sql = `

        UPDATE pembayaran

        SET
            status = ?

        WHERE
            id_pembayaran = ?

            AND status = 'Belum Bayar'

    `;


    db.query(
        sql,
        [

            "Lunas",

            Number(id)

        ],
        callback
    );

};


// ======================================================
// DELETE PEMBAYARAN
// ======================================================
//
// Pembayaran Lunas tidak boleh dihapus.
//
// Pembayaran Belum Bayar masih dapat dihapus melalui
// endpoint delete apabila diperlukan.
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


    // ==================================================
    // DELETE HANYA JIKA STATUS BELUM BAYAR
    // ==================================================

    const sql = `

        DELETE FROM pembayaran

        WHERE
            id_pembayaran = ?

            AND status = 'Belum Bayar'

    `;


    db.query(
        sql,
        [
            Number(id)
        ],
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