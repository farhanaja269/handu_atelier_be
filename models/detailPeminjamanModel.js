// ======================================================
// models/detailPeminjamanModel.js
// ======================================================

const db =
    require("../config/db");

// ======================================================
// GET DETAIL PEMINJAMAN BERDASARKAN
// ID PEMINJAMAN + USER
// ======================================================

const getDetailPeminjamanById = (
    idPeminjaman,
    idUser,
    callback
) => {

    const sql = `
        SELECT
            p.id_peminjaman,
            p.id_user,
            p.tanggal_peminjaman,
            p.tanggal_kembali,
            p.total_harga,
            p.status,

            d.id_detail,
            d.id_kostum,
            d.jumlah,
            d.harga,
            d.subtotal,

            k.id_kostum AS kostum_id,
            k.kode_koleksi,
            k.nama_kostum,
            k.ukuran,
            k.warna,
            k.foto,
            k.harga_sewa,
            k.deskripsi,

            k.id_koleksi,
            ko.nama_koleksi,

            pg.id_pengembalian,
            pg.tanggal_pengembalian,
            pg.kondisi_baju,
            pg.denda,
            pg.keterangan,

            pt.id_petugas AS petugas_pengembalian_id,
            pt.nama AS nama_petugas

        FROM peminjaman p

        INNER JOIN detail_peminjaman d
            ON p.id_peminjaman =
               d.id_peminjaman

        INNER JOIN kostum k
            ON d.id_kostum =
               k.id_kostum

        LEFT JOIN koleksi ko
            ON k.id_koleksi =
               ko.id_koleksi

        LEFT JOIN pengembalian pg
            ON p.id_peminjaman =
               pg.id_peminjaman

        LEFT JOIN petugas pt
            ON pg.diterima_oleh =
               pt.id_petugas

        WHERE
            p.id_peminjaman = ?
            AND p.id_user = ?

        ORDER BY
            d.id_detail ASC
    `;

    db.query(
        sql,
        [
            Number(idPeminjaman),
            Number(idUser),
        ],
        callback
    );
};

// ======================================================
// GET SEMUA DETAIL BERDASARKAN
// ID PEMINJAMAN
// ======================================================

const getDetailsByPeminjaman = (
    idPeminjaman,
    callback
) => {

    const sql = `
        SELECT
            id_detail,
            id_peminjaman,
            id_kostum,
            jumlah,
            harga,
            subtotal

        FROM detail_peminjaman

        WHERE
            id_peminjaman = ?

        ORDER BY
            id_detail ASC
    `;

    db.query(
        sql,
        [
            Number(idPeminjaman),
        ],
        callback
    );
};

// ======================================================
// CREATE DETAIL PEMINJAMAN
// ======================================================
//
// PENTING:
//
// Fungsi ini HANYA membuat detail.
//
// TIDAK mengurangi stok.
//
// Stok baru dikurangi ketika:
//
// Disetujui -> Diproses
//
// melalui:
// controllers/peminjamanController.js
//
// ======================================================

const createDetailPeminjaman = (
    data,
    callback
) => {

    const idPeminjaman =
        Number(
            data.id_peminjaman
        );

    const idKostum =
        Number(
            data.id_kostum
        );

    const jumlah =
        Number(
            data.jumlah
        );

    const harga =
        Number(
            data.harga
        );

    const subtotal =
        Number(
            data.subtotal
        );

    // ==================================================
    // VALIDASI ID PEMINJAMAN
    // ==================================================

    if (
        !idPeminjaman ||
        Number.isNaN(
            idPeminjaman
        )
    ) {
        return callback(
            new Error(
                "ID peminjaman tidak valid."
            )
        );
    }

    // ==================================================
    // VALIDASI ID KOSTUM
    // ==================================================

    if (
        !idKostum ||
        Number.isNaN(
            idKostum
        )
    ) {
        return callback(
            new Error(
                "ID kostum tidak valid."
            )
        );
    }

    // ==================================================
    // VALIDASI JUMLAH
    // ==================================================

    if (
        !jumlah ||
        Number.isNaN(
            jumlah
        ) ||
        jumlah <= 0
    ) {
        return callback(
            new Error(
                "Jumlah kostum tidak valid."
            )
        );
    }

    // ==================================================
    // VALIDASI HARGA
    // ==================================================

    if (
        Number.isNaN(
            harga
        ) ||
        harga < 0
    ) {
        return callback(
            new Error(
                "Harga kostum tidak valid."
            )
        );
    }

    // ==================================================
    // VALIDASI SUBTOTAL
    // ==================================================

    if (
        Number.isNaN(
            subtotal
        ) ||
        subtotal < 0
    ) {
        return callback(
            new Error(
                "Subtotal tidak valid."
            )
        );
    }

    // ==================================================
    // INSERT DETAIL
    // ==================================================

    const sql = `
        INSERT INTO detail_peminjaman
        (
            id_peminjaman,
            id_kostum,
            jumlah,
            harga,
            subtotal
        )
        VALUES
        (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            idPeminjaman,
            idKostum,
            jumlah,
            harga,
            subtotal,
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "ERROR INSERT DETAIL PEMINJAMAN:",
                    err
                );

                return callback(
                    err
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
    getDetailPeminjamanById,
    getDetailsByPeminjaman,
    createDetailPeminjaman,
};