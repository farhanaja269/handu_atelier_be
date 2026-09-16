// models/registrasiModel.js

const db = require("../config/db");


// ======================================================
// GET SEMUA DATA REGISTRASI PELANGGAN
// ======================================================
//
// SUMBER UTAMA DATA = users
//
// id_role:
// 1 = ADMIN
// 2 = PETUGAS
// 3 = PELANGGAN
//
// Jadi semua user dengan id_role = 3 akan muncul,
// walaupun belum mempunyai data pada tabel registrasi.
//
// Jika belum mempunyai data registrasi:
// - id_registrasi = null
// - id_admin = null
// - admin = null
// - status = Menunggu
//
// ======================================================

const getAllRegistrasi = (callback) => {

    const sql = `
        SELECT

            /* ==============================
               DATA REGISTRASI
            ============================== */

            r.id_registrasi,
            r.id_user AS id_user_registrasi,
            r.id_admin,

            /* ==============================
               DATA PELANGGAN
            ============================== */

            u.id_user,
            u.nama,
            u.email,
            u.no_hp,
            u.alamat,
            u.created_at,

            /* ==============================
               DATA ADMIN
            ============================== */

            a.nama AS admin,

            /* ==============================
               STATUS
            ============================== */

            COALESCE(
                r.status,
                'Menunggu'
            ) AS status

        FROM users u

        /* ==================================
           REGISTRASI BOLEH BELUM ADA
        ================================== */

        LEFT JOIN registrasi r
            ON r.id_user = u.id_user

        /* ==================================
           ADMIN
        ================================== */

        LEFT JOIN admin a
            ON r.id_admin = a.id_admin

        /* ==================================
           HANYA PELANGGAN
           ROLE 3 = PELANGGAN
        ================================== */

        WHERE
            u.id_role = 3
            AND u.deleted_at IS NULL

        ORDER BY
            u.id_user DESC
    `;

    console.log(
        "========================================"
    );

    console.log(
        "GET SEMUA REGISTRASI PELANGGAN"
    );

    console.log(
        "Query:",
        sql
    );

    console.log(
        "========================================"
    );


    db.query(
        sql,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR getAllRegistrasi:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }


            console.log(
                "Jumlah pelanggan:",
                result.length
            );


            return callback(
                null,
                result
            );
        }
    );
};



// ======================================================
// GET REGISTRASI BERDASARKAN ID USER
// ======================================================
//
// Endpoint:
// GET /api/registrasi/:id
//
// ID yang digunakan adalah id_user.
//
// ======================================================

const getRegistrasiById = (
    id,
    callback
) => {

    const sql = `
        SELECT

            /* ==============================
               DATA REGISTRASI
            ============================== */

            r.id_registrasi,
            r.id_user AS id_user_registrasi,
            r.id_admin,

            /* ==============================
               DATA USER
            ============================== */

            u.id_user,
            u.nama,
            u.email,
            u.no_hp,
            u.alamat,
            u.created_at,

            /* ==============================
               ADMIN
            ============================== */

            a.nama AS admin,

            /* ==============================
               STATUS
            ============================== */

            COALESCE(
                r.status,
                'Menunggu'
            ) AS status

        FROM users u

        LEFT JOIN registrasi r
            ON r.id_user = u.id_user

        LEFT JOIN admin a
            ON r.id_admin = a.id_admin

        WHERE
            u.id_user = ?
            AND u.id_role = 3
            AND u.deleted_at IS NULL
    `;


    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR getRegistrasiById:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }


            return callback(
                null,
                result
            );
        }
    );
};



// ======================================================
// CREATE REGISTRASI
// ======================================================

const createRegistrasi = (
    data,
    callback
) => {

    const sql = `
        INSERT INTO registrasi
        (
            id_user,
            id_admin,
            status
        )
        VALUES (?, ?, ?)
    `;


    db.query(
        sql,
        [
            data.id_user,
            data.id_admin || null,
            data.status || "Menunggu"
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR createRegistrasi:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }


            return callback(
                null,
                result
            );
        }
    );
};



// ======================================================
// UPDATE REGISTRASI
// ======================================================

const updateRegistrasi = (
    id,
    data,
    callback
) => {

    const sql = `
        UPDATE registrasi

        SET
            id_user = ?,
            id_admin = ?,
            status = ?

        WHERE
            id_registrasi = ?
    `;


    db.query(
        sql,
        [
            data.id_user,
            data.id_admin || null,
            data.status || "Menunggu",
            id
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR updateRegistrasi:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }


            return callback(
                null,
                result
            );
        }
    );
};



// ======================================================
// DELETE REGISTRASI
// ======================================================

const deleteRegistrasi = (
    id,
    callback
) => {

    const sql = `
        DELETE FROM registrasi

        WHERE
            id_registrasi = ?
    `;


    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR deleteRegistrasi:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }


            return callback(
                null,
                result
            );
        }
    );
};



// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getAllRegistrasi,

    getRegistrasiById,

    createRegistrasi,

    updateRegistrasi,

    deleteRegistrasi

};