// ======================================================
// models/dendaModel.js
// ======================================================

const db = require("../config/db");

// ======================================================
// GET SEMUA DENDA
// ======================================================

const getAllDenda = (callback) => {

    const sql = `
        SELECT
            d.id_denda,
            d.id_pengembalian,
            d.nominal_denda,
            d.alasan,
            d.status,
            d.dibuat_oleh,
            d.diperbarui_oleh,
            d.created_at,
            d.updated_at,

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

        FROM denda d

        INNER JOIN pengembalian pg
            ON d.id_pengembalian = pg.id_pengembalian

        INNER JOIN peminjaman pj
            ON pg.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        ORDER BY
            d.id_denda DESC
    `;

    db.query(
        sql,
        callback
    );
};

// ======================================================
// GET DENDA BERDASARKAN ID
// ======================================================

const getDendaById = (
    idDenda,
    callback
) => {

    const sql = `
        SELECT
            d.id_denda,
            d.id_pengembalian,
            d.nominal_denda,
            d.alasan,
            d.status,
            d.dibuat_oleh,
            d.diperbarui_oleh,
            d.created_at,
            d.updated_at,

            pg.id_peminjaman,
            pg.tanggal_pengembalian,
            pg.kondisi_baju,
            pg.keterangan AS keterangan_pengembalian,

            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status AS status_peminjaman,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user

        FROM denda d

        INNER JOIN pengembalian pg
            ON d.id_pengembalian = pg.id_pengembalian

        INNER JOIN peminjaman pj
            ON pg.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        WHERE d.id_denda = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [Number(idDenda)],
        callback
    );
};

// ======================================================
// GET DENDA BERDASARKAN PENGEMBALIAN
// ======================================================

const getDendaByPengembalian = (
    idPengembalian,
    callback
) => {

    const sql = `
        SELECT
            d.id_denda,
            d.id_pengembalian,
            d.nominal_denda,
            d.alasan,
            d.status,
            d.dibuat_oleh,
            d.diperbarui_oleh,
            d.created_at,
            d.updated_at,

            pg.id_peminjaman,
            pg.tanggal_pengembalian,
            pg.kondisi_baju,

            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,

            u.nama AS nama_user,
            u.email AS email_user

        FROM denda d

        INNER JOIN pengembalian pg
            ON d.id_pengembalian = pg.id_pengembalian

        INNER JOIN peminjaman pj
            ON pg.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        WHERE d.id_pengembalian = ?

        ORDER BY
            d.id_denda DESC
    `;

    db.query(
        sql,
        [Number(idPengembalian)],
        callback
    );
};

// ======================================================
// CREATE DENDA
// ======================================================

const createDenda = (
    data,
    callback
) => {

    const idPengembalian =
        Number(data.id_pengembalian);

    const nominalDenda =
        Number(data.nominal_denda);

    const alasan =
        data.alasan || null;

    const status =
        data.status || "Belum Dibayar";

    const dibuatOleh =
        data.dibuat_oleh
            ? Number(data.dibuat_oleh)
            : null;

    // ==================================================
    // VALIDASI
    // ==================================================

    if (
        !idPengembalian ||
        isNaN(idPengembalian)
    ) {
        return callback(
            new Error(
                "ID pengembalian tidak valid."
            )
        );
    }

    if (
        isNaN(nominalDenda) ||
        nominalDenda < 0
    ) {
        return callback(
            new Error(
                "Nominal denda tidak valid."
            )
        );
    }

    const allowedStatus = [
        "Belum Dibayar",
        "Menunggu Verifikasi",
        "Lunas"
    ];

    if (
        !allowedStatus.includes(status)
    ) {
        return callback(
            new Error(
                "Status denda tidak valid."
            )
        );
    }

    // ==================================================
    // INSERT
    // ==================================================

    const sql = `
        INSERT INTO denda
        (
            id_pengembalian,
            nominal_denda,
            alasan,
            status,
            dibuat_oleh
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            idPengembalian,
            nominalDenda,
            alasan,
            status,
            dibuatOleh
        ],
        callback
    );
};

// ======================================================
// UPDATE DENDA
// ======================================================

const updateDenda = (
    idDenda,
    data,
    callback
) => {

    const nominalDenda =
        Number(data.nominal_denda);

    const alasan =
        data.alasan || null;

    const status =
        data.status;

    const diperbaruiOleh =
        data.diperbarui_oleh
            ? Number(data.diperbarui_oleh)
            : null;

    if (
        isNaN(nominalDenda) ||
        nominalDenda < 0
    ) {
        return callback(
            new Error(
                "Nominal denda tidak valid."
            )
        );
    }

    const allowedStatus = [
        "Belum Dibayar",
        "Menunggu Verifikasi",
        "Lunas"
    ];

    if (
        !allowedStatus.includes(status)
    ) {
        return callback(
            new Error(
                "Status denda tidak valid."
            )
        );
    }

    const sql = `
        UPDATE denda
        SET
            nominal_denda = ?,
            alasan = ?,
            status = ?,
            diperbarui_oleh = ?
        WHERE id_denda = ?
    `;

    db.query(
        sql,
        [
            nominalDenda,
            alasan,
            status,
            diperbaruiOleh,
            Number(idDenda)
        ],
        callback
    );
};

// ======================================================
// UPDATE STATUS DENDA
// ======================================================

const updateStatusDenda = (
    idDenda,
    status,
    diperbaruiOleh,
    callback
) => {

    const sql = `
        UPDATE denda
        SET
            status = ?,
            diperbarui_oleh = ?
        WHERE id_denda = ?
    `;

    db.query(
        sql,
        [
            status,
            diperbaruiOleh
                ? Number(diperbaruiOleh)
                : null,
            Number(idDenda)
        ],
        callback
    );
};

// ======================================================
// DELETE DENDA
// ======================================================

const deleteDenda = (
    idDenda,
    callback
) => {

    const sql = `
        DELETE FROM denda
        WHERE id_denda = ?
    `;

    db.query(
        sql,
        [Number(idDenda)],
        callback
    );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getAllDenda,

    getDendaById,

    getDendaByPengembalian,

    createDenda,

    updateDenda,

    updateStatusDenda,

    deleteDenda

};