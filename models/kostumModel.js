const db = require("../config/db");

// ======================================================
// GET SEMUA KOSTUM
// ======================================================
const getAllKostum = (callback) => {
    const sql = `
        SELECT
            k.id_kostum,
            k.id_kategori,
            kat.nama_kategori,
            k.id_koleksi,
            ko.nama_koleksi,
            ko.deskripsi AS deskripsi_koleksi,
            ko.status AS status_koleksi,
            k.kode_koleksi,
            k.nama_kostum,
            k.ukuran,
            k.warna,
            k.stok,
            k.harga_sewa,
            k.status,
            k.foto,
            k.deskripsi,
            k.featured
        FROM kostum k
        LEFT JOIN kategori kat
            ON k.id_kategori = kat.id_kategori
        LEFT JOIN koleksi ko
            ON k.id_koleksi = ko.id_koleksi
        ORDER BY k.id_kostum ASC
    `;

    db.query(sql, callback);
};


// ======================================================
// GET KOSTUM BERDASARKAN ID
// ======================================================
const getKostumById = (id, callback) => {
    const sql = `
        SELECT
            k.id_kostum,
            k.id_kategori,
            kat.nama_kategori,
            k.id_koleksi,
            ko.nama_koleksi,
            ko.deskripsi AS deskripsi_koleksi,
            ko.status AS status_koleksi,
            k.kode_koleksi,
            k.nama_kostum,
            k.ukuran,
            k.warna,
            k.stok,
            k.harga_sewa,
            k.status,
            k.foto,
            k.deskripsi,
            k.featured
        FROM kostum k
        LEFT JOIN kategori kat
            ON k.id_kategori = kat.id_kategori
        LEFT JOIN koleksi ko
            ON k.id_koleksi = ko.id_koleksi
        WHERE k.id_kostum = ?
        LIMIT 1
    `;

    db.query(sql, [id], callback);
};


// ======================================================
// CREATE KOSTUM
// ======================================================
const createKostum = (data, callback) => {
    const sql = `
        INSERT INTO kostum (
            id_kategori,
            id_koleksi,
            kode_koleksi,
            nama_kostum,
            ukuran,
            warna,
            stok,
            harga_sewa,
            status,
            foto,
            deskripsi,
            featured
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.id_kategori
            ? Number(data.id_kategori)
            : null,

        data.id_koleksi
            ? Number(data.id_koleksi)
            : null,

        data.kode_koleksi || null,

        data.nama_kostum || null,

        data.ukuran || null,

        data.warna || null,

        Number(data.stok) || 0,

        Number(data.harga_sewa) || 0,

        data.status || "Tersedia",

        data.foto || null,

        data.deskripsi || null,

        Number(data.featured) === 1 ? 1 : 0
    ];

    db.query(sql, values, callback);
};


// ======================================================
// UPDATE KOSTUM
// ======================================================
const updateKostum = (id, data, callback) => {
    const sql = `
        UPDATE kostum
        SET
            id_kategori = ?,
            id_koleksi = ?,
            kode_koleksi = ?,
            nama_kostum = ?,
            ukuran = ?,
            warna = ?,
            stok = ?,
            harga_sewa = ?,
            status = ?,
            foto = ?,
            deskripsi = ?,
            featured = ?
        WHERE id_kostum = ?
    `;

    const values = [
        data.id_kategori
            ? Number(data.id_kategori)
            : null,

        data.id_koleksi
            ? Number(data.id_koleksi)
            : null,

        data.kode_koleksi || null,

        data.nama_kostum || null,

        data.ukuran || null,

        data.warna || null,

        Number(data.stok) || 0,

        Number(data.harga_sewa) || 0,

        data.status || "Tersedia",

        data.foto || null,

        data.deskripsi || null,

        Number(data.featured) === 1 ? 1 : 0,

        id
    ];

    db.query(sql, values, callback);
};


// ======================================================
// DELETE KOSTUM
// ======================================================
const deleteKostum = (id, callback) => {
    const sql = `
        DELETE FROM kostum
        WHERE id_kostum = ?
    `;

    db.query(sql, [id], callback);
};


// ======================================================
// KURANGI STOK KOSTUM
// ======================================================
// Fungsi ini menggunakan kondisi:
//
// stok >= jumlah
//
// sehingga stok tidak akan pernah menjadi negatif.
//
// Contoh:
// stok = 1
// jumlah = 1
// hasil = 0
//
// Jika stok = 0
// jumlah = 1
// UPDATE tidak akan dilakukan.
// ======================================================
const decreaseStock = (id_kostum, jumlah, callback) => {
    const jumlahStok = Number(jumlah) || 1;

    const sql = `
        UPDATE kostum
        SET stok = stok - ?
        WHERE id_kostum = ?
          AND stok >= ?
    `;

    db.query(
        sql,
        [
            jumlahStok,
            id_kostum,
            jumlahStok
        ],
        (err, result) => {
            if (err) {
                console.error(
                    "Gagal mengurangi stok kostum:",
                    err
                );

                return callback(err);
            }

            if (result.affectedRows === 0) {
                return callback(
                    new Error(
                        "Stok kostum tidak mencukupi atau kostum tidak ditemukan."
                    )
                );
            }

            callback(null, result);
        }
    );
};


// ======================================================
// TAMBAH / KEMBALIKAN STOK KOSTUM
// ======================================================
// Digunakan ketika stok yang sebelumnya sudah dipesan
// harus dikembalikan.
//
// Contoh:
// stok awal = 0
// jumlah dikembalikan = 1
// hasil = 1
// ======================================================
const increaseStock = (id_kostum, jumlah, callback) => {
    const jumlahStok = Number(jumlah) || 1;

    const sql = `
        UPDATE kostum
        SET stok = stok + ?
        WHERE id_kostum = ?
    `;

    db.query(
        sql,
        [
            jumlahStok,
            id_kostum
        ],
        (err, result) => {
            if (err) {
                console.error(
                    "Gagal menambah stok kostum:",
                    err
                );

                return callback(err);
            }

            if (result.affectedRows === 0) {
                return callback(
                    new Error(
                        "Kostum tidak ditemukan."
                    )
                );
            }

            callback(null, result);
        }
    );
};


// ======================================================
// EXPORT
// ======================================================
module.exports = {
    getAllKostum,
    getKostumById,
    createKostum,
    updateKostum,
    deleteKostum,
    decreaseStock,
    increaseStock
};