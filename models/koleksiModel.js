const db = require("../config/db");


// ======================================================
// GET SEMUA KOLEKSI
// ======================================================

const getAllKoleksi = (callback) => {

    const sql = `
        SELECT

            ko.id_koleksi,

            ko.nama_koleksi,

            ko.foto,

            ko.deskripsi,

            ko.status,

            ko.created_at,

            ko.updated_at,

            COUNT(
                k.id_kostum
            ) AS jumlah_kostum

        FROM koleksi ko

        LEFT JOIN kostum k
            ON ko.id_koleksi = k.id_koleksi

        GROUP BY

            ko.id_koleksi,
            ko.nama_koleksi,
            ko.foto,
            ko.deskripsi,
            ko.status,
            ko.created_at,
            ko.updated_at

        ORDER BY
            ko.id_koleksi ASC
    `;


    db.query(
        sql,
        (err, rows) => {

            if (err) {

                console.error(
                    "ERROR GET ALL KOLEKSI:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }


            callback(
                null,
                rows
            );
        }
    );
};


// ======================================================
// GET KOLEKSI BERDASARKAN ID
// ======================================================

const getKoleksiById = (
    id,
    callback
) => {

    const sql = `
        SELECT

            ko.id_koleksi,

            ko.nama_koleksi,

            ko.foto,

            ko.deskripsi,

            ko.status,

            ko.created_at,

            ko.updated_at,

            COUNT(
                k.id_kostum
            ) AS jumlah_kostum

        FROM koleksi ko

        LEFT JOIN kostum k
            ON ko.id_koleksi = k.id_koleksi

        WHERE
            ko.id_koleksi = ?

        GROUP BY

            ko.id_koleksi,
            ko.nama_koleksi,
            ko.foto,
            ko.deskripsi,
            ko.status,
            ko.created_at,
            ko.updated_at

        LIMIT 1
    `;


    db.query(
        sql,
        [id],
        (err, rows) => {

            if (err) {

                console.error(
                    "ERROR GET KOLEKSI BY ID:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }


            callback(
                null,
                rows && rows.length > 0
                    ? rows[0]
                    : null
            );
        }
    );
};


// ======================================================
// TAMBAH KOLEKSI
// ======================================================

const createKoleksi = (
    data,
    callback
) => {

    const sql = `
        INSERT INTO koleksi
        (
            nama_koleksi,
            foto,
            deskripsi,
            status
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?
        )
    `;


    const values = [

        data.nama_koleksi,

        data.foto || null,

        data.deskripsi || null,

        data.status || "Aktif"

    ];


    db.query(
        sql,
        values,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR CREATE KOLEKSI:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }


            callback(
                null,
                result
            );
        }
    );
};


// ======================================================
// UPDATE KOLEKSI
// ======================================================

const updateKoleksi = (
    id,
    data,
    callback
) => {

    const sql = `
        UPDATE koleksi

        SET

            nama_koleksi = ?,

            foto = ?,

            deskripsi = ?,

            status = ?

        WHERE
            id_koleksi = ?
    `;


    const values = [

        data.nama_koleksi,

        data.foto || null,

        data.deskripsi || null,

        data.status || "Aktif",

        id

    ];


    db.query(
        sql,
        values,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR UPDATE KOLEKSI:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }


            callback(
                null,
                result
            );
        }
    );
};


// ======================================================
// DELETE KOLEKSI
// ======================================================

const deleteKoleksi = (
    id,
    callback
) => {

    const sql = `
        DELETE FROM koleksi

        WHERE
            id_koleksi = ?
    `;


    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR DELETE KOLEKSI:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }


            callback(
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

    getAllKoleksi,

    getKoleksiById,

    createKoleksi,

    updateKoleksi,

    deleteKoleksi

};