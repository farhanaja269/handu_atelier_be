// ======================================================
// MODELS PEMINJAMAN
// ======================================================

const db = require("../config/db");

// ======================================================
// GET SEMUA PEMINJAMAN
// ======================================================

const getAllPeminjaman = (callback) => {

    const sql = `
        SELECT
            p.id_peminjaman,
            p.id_user,
            p.disetujui_oleh,
            p.diproses_oleh,
            p.tanggal_peminjaman,
            p.tanggal_kembali,
            p.total_harga,
            p.status,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user,
            u.alamat AS alamat_user,

            admin.nama AS nama_admin,
            petugas.nama AS nama_petugas,

            GROUP_CONCAT(
                DISTINCT k.nama_kostum
                ORDER BY k.nama_kostum
                SEPARATOR ', '
            ) AS nama_kostum,

            GROUP_CONCAT(
                DISTINCT k.kode_koleksi
                ORDER BY k.kode_koleksi
                SEPARATOR ', '
            ) AS kode_koleksi,

            GROUP_CONCAT(
                DISTINCT ko.nama_koleksi
                ORDER BY ko.nama_koleksi
                SEPARATOR ', '
            ) AS nama_koleksi,

            GROUP_CONCAT(
                DISTINCT k.warna
                ORDER BY k.warna
                SEPARATOR ', '
            ) AS warna,

            GROUP_CONCAT(
                DISTINCT k.ukuran
                ORDER BY k.ukuran
                SEPARATOR ', '
            ) AS ukuran,

            GROUP_CONCAT(
                DISTINCT d.jumlah
                ORDER BY k.nama_kostum
                SEPARATOR ', '
            ) AS jumlah_kostum

        FROM peminjaman p

        INNER JOIN users u
            ON p.id_user = u.id_user

        LEFT JOIN admin
            ON p.disetujui_oleh = admin.id_admin

        LEFT JOIN petugas
            ON p.diproses_oleh = petugas.id_petugas

        LEFT JOIN detail_peminjaman d
            ON p.id_peminjaman = d.id_peminjaman

        LEFT JOIN kostum k
            ON d.id_kostum = k.id_kostum

        LEFT JOIN koleksi ko
            ON k.id_koleksi = ko.id_koleksi

        GROUP BY p.id_peminjaman

        ORDER BY p.id_peminjaman DESC
    `;

    db.query(
        sql,
        callback
    );
};


// ======================================================
// GET PEMINJAMAN BERDASARKAN ID
// ======================================================

const getPeminjamanById = (
    id,
    callback
) => {

    const sql = `
        SELECT
            p.id_peminjaman,
            p.id_user,
            p.disetujui_oleh,
            p.diproses_oleh,
            p.tanggal_peminjaman,
            p.tanggal_kembali,
            p.total_harga,
            p.status,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user,
            u.alamat AS alamat_user,

            admin.nama AS nama_admin,
            petugas.nama AS nama_petugas,

            GROUP_CONCAT(
                DISTINCT k.nama_kostum
                ORDER BY k.nama_kostum
                SEPARATOR ', '
            ) AS nama_kostum,

            GROUP_CONCAT(
                DISTINCT k.kode_koleksi
                ORDER BY k.kode_koleksi
                SEPARATOR ', '
            ) AS kode_koleksi,

            GROUP_CONCAT(
                DISTINCT ko.nama_koleksi
                ORDER BY ko.nama_koleksi
                SEPARATOR ', '
            ) AS nama_koleksi,

            GROUP_CONCAT(
                DISTINCT k.warna
                ORDER BY k.warna
                SEPARATOR ', '
            ) AS warna,

            GROUP_CONCAT(
                DISTINCT k.ukuran
                ORDER BY k.ukuran
                SEPARATOR ', '
            ) AS ukuran,

            GROUP_CONCAT(
                DISTINCT d.jumlah
                ORDER BY k.nama_kostum
                SEPARATOR ', '
            ) AS jumlah_kostum

        FROM peminjaman p

        INNER JOIN users u
            ON p.id_user = u.id_user

        LEFT JOIN admin
            ON p.disetujui_oleh = admin.id_admin

        LEFT JOIN petugas
            ON p.diproses_oleh = petugas.id_petugas

        LEFT JOIN detail_peminjaman d
            ON p.id_peminjaman = d.id_peminjaman

        LEFT JOIN kostum k
            ON d.id_kostum = k.id_kostum

        LEFT JOIN koleksi ko
            ON k.id_koleksi = ko.id_koleksi

        WHERE p.id_peminjaman = ?

        GROUP BY p.id_peminjaman
    `;

    db.query(
        sql,
        [id],
        callback
    );
};


// ======================================================
// GET DETAIL PEMINJAMAN UNTUK PETUGAS
// ======================================================

const getPeminjamanDetailForPetugas = (
    id,
    callback
) => {

    const sql = `
        SELECT
            p.id_peminjaman,
            p.id_user,
            p.disetujui_oleh,
            p.diproses_oleh,
            p.tanggal_peminjaman,
            p.tanggal_kembali,
            p.total_harga,
            p.status,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user,
            u.alamat AS alamat_user,

            admin.nama AS nama_admin,
            petugas.nama AS nama_petugas,

            d.id_detail,
            d.id_kostum,
            d.jumlah,
            d.harga,
            d.subtotal,

            k.id_kostum AS kostum_id,
            k.id_koleksi,
            k.kode_koleksi,
            k.nama_kostum,
            k.foto,
            k.harga_sewa,
            k.ukuran,
            k.warna,
            k.deskripsi,

            ko.nama_koleksi,
            ko.deskripsi AS deskripsi_koleksi,
            ko.status AS status_koleksi

        FROM peminjaman p

        INNER JOIN users u
            ON p.id_user = u.id_user

        LEFT JOIN admin
            ON p.disetujui_oleh = admin.id_admin

        LEFT JOIN petugas
            ON p.diproses_oleh = petugas.id_petugas

        LEFT JOIN detail_peminjaman d
            ON p.id_peminjaman = d.id_peminjaman

        LEFT JOIN kostum k
            ON d.id_kostum = k.id_kostum

        LEFT JOIN koleksi ko
            ON k.id_koleksi = ko.id_koleksi

        WHERE p.id_peminjaman = ?

        ORDER BY d.id_detail ASC
    `;

    db.query(
        sql,
        [id],
        callback
    );
};


// ======================================================
// CREATE PEMINJAMAN
// ======================================================

const createPeminjaman = (
    data,
    callback
) => {

    const sql = `
        INSERT INTO peminjaman
        (
            id_user,
            disetujui_oleh,
            diproses_oleh,
            tanggal_peminjaman,
            tanggal_kembali,
            total_harga,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            data.id_user,
            data.disetujui_oleh || null,
            data.diproses_oleh || null,
            data.tanggal_peminjaman,
            data.tanggal_kembali,
            data.total_harga,
            data.status
        ],
        callback
    );
};


// ======================================================
// UPDATE PEMINJAMAN LENGKAP
// ======================================================

const updatePeminjaman = (
    id,
    data,
    callback
) => {

    const sql = `
        UPDATE peminjaman
        SET
            id_user = ?,
            disetujui_oleh = ?,
            diproses_oleh = ?,
            tanggal_peminjaman = ?,
            tanggal_kembali = ?,
            total_harga = ?,
            status = ?
        WHERE id_peminjaman = ?
    `;

    db.query(
        sql,
        [
            data.id_user,
            data.disetujui_oleh || null,
            data.diproses_oleh || null,
            data.tanggal_peminjaman,
            data.tanggal_kembali,
            data.total_harga,
            data.status,
            id
        ],
        callback
    );
};


// ======================================================
// UPDATE STATUS PEMINJAMAN
// ======================================================

const updateStatusPeminjaman = (
    id,
    status,
    callback
) => {

    const sql = `
        UPDATE peminjaman
        SET status = ?
        WHERE id_peminjaman = ?
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
// GET STATUS PEMINJAMAN
// ======================================================

const getStatusPeminjaman = (
    id,
    callback
) => {

    const sql = `
        SELECT
            id_peminjaman,
            status
        FROM peminjaman
        WHERE id_peminjaman = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [id],
        callback
    );
};


// ======================================================
// DELETE PEMINJAMAN
// ======================================================

const deletePeminjaman = (
    id,
    callback
) => {

    const sql = `
        DELETE FROM peminjaman
        WHERE id_peminjaman = ?
    `;

    db.query(
        sql,
        [id],
        callback
    );
};


// ======================================================
// CEK KETERSEDIAAN KOSTUM BERDASARKAN TANGGAL
// ======================================================
//
// ALUR STOK:
//
// 1. k.stok
//    = stok yang tersedia secara fisik saat ini.
//
// 2. Ketika status menjadi "Diproses",
//    stok fisik dikurangi.
//
// 3. Ketika pengembalian diterima,
//    stok fisik ditambahkan kembali.
//
// 4. Karena itu, untuk mendapatkan TOTAL STOK FISIK,
//    kostum yang sedang "Diproses" harus ditambahkan kembali
//    ke k.stok.
//
// STATUS YANG MEMBLOKIR TANGGAL:
//
// - Menunggu
// - Disetujui
// - Diproses
//
// STATUS YANG TIDAK MEMBLOKIR:
//
// - Ditolak
// - Dibatalkan
// - Selesai
//
// ======================================================

const checkKostumAvailability = (
    idKostum,
    tanggalPeminjaman,
    tanggalKembali,
    jumlah = 1,
    excludePeminjamanId = null,
    callback
) => {

    const requestedJumlah =
        Number(jumlah) || 1;


    // ==================================================
    // QUERY
    // ==================================================

    const sql = `
        SELECT
            k.id_kostum,
            k.nama_kostum,

            /*
             * ==================================================
             * TOTAL STOK FISIK
             * ==================================================
             *
             * k.stok merupakan stok yang sedang tersedia.
             *
             * Jika ada peminjaman berstatus Diproses,
             * unit tersebut sudah dikeluarkan dari k.stok.
             *
             * Oleh karena itu jumlah unit Diproses
             * ditambahkan kembali untuk mendapatkan
             * total stok fisik sebenarnya.
             */

            (
                k.stok
                +
                COALESCE(
                    (
                        SELECT
                            SUM(d2.jumlah)
                        FROM detail_peminjaman d2
                        INNER JOIN peminjaman p2
                            ON p2.id_peminjaman = d2.id_peminjaman
                        WHERE
                            d2.id_kostum = k.id_kostum
                            AND p2.status = 'Diproses'
                    ),
                    0
                )
            ) AS stok_fisik,


            /*
             * ==================================================
             * JUMLAH YANG TERPESAN PADA PERIODE TERSEBUT
             * ==================================================
             *
             * Hanya peminjaman dengan status:
             *
             * Menunggu
             * Disetujui
             * Diproses
             *
             * yang dianggap memblokir tanggal.
             */

            COALESCE(
                SUM(
                    CASE
                        WHEN p.status IN (
                            'Menunggu',
                            'Disetujui',
                            'Diproses'
                        )
                        THEN d.jumlah
                        ELSE 0
                    END
                ),
                0
            ) AS jumlah_terpesan


        FROM kostum k


        /*
         * ==================================================
         * DETAIL PEMINJAMAN
         * ==================================================
         */

        LEFT JOIN detail_peminjaman d
            ON d.id_kostum = k.id_kostum


        /*
         * ==================================================
         * PEMINJAMAN
         * ==================================================
         */

        LEFT JOIN peminjaman p
            ON p.id_peminjaman = d.id_peminjaman

            /*
             * ==================================================
             * CEK BENTROK TANGGAL
             * ==================================================
             *
             * Dua periode dianggap bentrok apabila:
             *
             * tanggal mulai peminjaman lama
             * <= tanggal kembali yang diperiksa
             *
             * DAN
             *
             * tanggal kembali peminjaman lama
             * >= tanggal peminjaman yang diperiksa
             *
             * Contoh:
             *
             * Peminjaman lama:
             * 20 - 22 September
             *
             * Pemeriksaan:
             * 21 - 23 September
             *
             * => BENTROK
             *
             *
             * Peminjaman lama:
             * 20 - 22 September
             *
             * Pemeriksaan:
             * 25 - 27 September
             *
             * => TIDAK BENTROK
             */

            AND p.tanggal_peminjaman <= ?
            AND p.tanggal_kembali >= ?

            /*
             * ==================================================
             * EXCLUDE PEMINJAMAN
             * ==================================================
             *
             * Digunakan ketika peminjaman sedang diedit.
             *
             * Peminjaman yang sedang diedit tidak boleh
             * dihitung sebagai pemesanan yang bentrok
             * dengan dirinya sendiri.
             */

            ${
                excludePeminjamanId
                    ? "AND p.id_peminjaman <> ?"
                    : ""
            }


        /*
         * ==================================================
         * KOSTUM YANG DIPERIKSA
         * ==================================================
         */

        WHERE
            k.id_kostum = ?


        /*
         * ==================================================
         * GROUP
         * ==================================================
         */

        GROUP BY
            k.id_kostum,
            k.nama_kostum,
            k.stok


        LIMIT 1
    `;


    // ==================================================
    // PARAMETER QUERY
    // ==================================================

    const params = [
        tanggalKembali,
        tanggalPeminjaman
    ];


    // Jika ada peminjaman yang dikecualikan
    if (excludePeminjamanId) {

        params.push(
            Number(excludePeminjamanId)
        );
    }


    params.push(
        Number(idKostum)
    );


    // ==================================================
    // EXECUTE QUERY
    // ==================================================

    db.query(
        sql,
        params,
        (err, result) => {

            // ==================================================
            // ERROR DATABASE
            // ==================================================

            if (err) {

                console.error(
                    "Error cek ketersediaan kostum:",
                    err
                );

                return callback(err);
            }


            // ==================================================
            // KOSTUM TIDAK DITEMUKAN
            // ==================================================

            if (
                !result ||
                result.length === 0
            ) {

                return callback(
                    null,
                    {
                        tersedia: false,
                        stok_fisik: 0,
                        jumlah_terpesan: 0,
                        stok_tersedia: 0
                    }
                );
            }


            // ==================================================
            // AMBIL DATA
            // ==================================================

            const data = result[0];


            const stokFisik =
                Number(data.stok_fisik) || 0;


            const jumlahTerpesan =
                Number(data.jumlah_terpesan) || 0;


            // ==================================================
            // HITUNG STOK TERSEDIA
            // ==================================================
            //
            // Total stok fisik
            // dikurangi jumlah yang sudah dipesan
            // pada periode tersebut.
            //
            // Math.max(0, ...)
            // mencegah hasil stok negatif.
            // ==================================================

            const stokTersedia =
                Math.max(
                    0,
                    stokFisik - jumlahTerpesan
                );


            // ==================================================
            // CEK JUMLAH YANG DIMINTA
            // ==================================================

            const tersedia =
                stokTersedia >= requestedJumlah;


            // ==================================================
            // RETURN
            // ==================================================

            callback(
                null,
                {
                    tersedia,
                    stok_fisik: stokFisik,
                    jumlah_terpesan: jumlahTerpesan,
                    stok_tersedia: stokTersedia
                }
            );
        }
    );
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getAllPeminjaman,

    getPeminjamanById,

    getPeminjamanDetailForPetugas,

    createPeminjaman,

    updatePeminjaman,

    updateStatusPeminjaman,

    getStatusPeminjaman,

    deletePeminjaman,

    checkKostumAvailability

};