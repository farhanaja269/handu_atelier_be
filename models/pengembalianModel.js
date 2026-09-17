// ======================================================
// models/pengembalianModel.js
// ======================================================

const db = require("../config/db");

// ======================================================
// GET SEMUA PENGEMBALIAN
// ======================================================

const getAllPengembalian = (callback) => {
    const sql = `
        SELECT
            p.id_pengembalian,
            p.id_peminjaman,
            p.tanggal_pengembalian,
            p.kondisi_baju,
            p.denda,
            p.keterangan,
            p.diterima_oleh,

            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user,

            pt.nama AS nama_petugas,

            GROUP_CONCAT(
                DISTINCT k.nama_kostum
                ORDER BY k.nama_kostum
                SEPARATOR ', '
            ) AS nama_kostum,

            GROUP_CONCAT(
                DISTINCT k.kode_koleksi
                ORDER BY k.kode_koleksi
                SEPARATOR ', '
            ) AS kode_koleksi

        FROM pengembalian p

        INNER JOIN peminjaman pj
            ON p.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        LEFT JOIN petugas pt
            ON p.diterima_oleh = pt.id_petugas

        LEFT JOIN detail_peminjaman d
            ON p.id_peminjaman = d.id_peminjaman

        LEFT JOIN kostum k
            ON d.id_kostum = k.id_kostum

        GROUP BY
            p.id_pengembalian,
            p.id_peminjaman,
            p.tanggal_pengembalian,
            p.kondisi_baju,
            p.denda,
            p.keterangan,
            p.diterima_oleh,
            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status,
            u.nama,
            u.email,
            u.no_hp,
            pt.nama

        ORDER BY
            p.id_pengembalian DESC
    `;

    db.query(sql, callback);
};

// ======================================================
// ALIAS GET PENGEMBALIAN
// ======================================================

const getPengembalian = (callback) => {
    getAllPengembalian(callback);
};

// ======================================================
// GET PENGEMBALIAN BERDASARKAN ID
// ======================================================

const getPengembalianById = (
    id,
    callback
) => {
    const idPengembalian = Number(id);

    if (!idPengembalian) {
        return callback(
            new Error(
                "ID pengembalian tidak valid."
            ),
            null
        );
    }

    const sql = `
        SELECT
            p.id_pengembalian,
            p.id_peminjaman,
            p.tanggal_pengembalian,
            p.kondisi_baju,
            p.denda,
            p.keterangan,
            p.diterima_oleh,

            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user,

            pt.nama AS nama_petugas,

            GROUP_CONCAT(
                DISTINCT k.nama_kostum
                ORDER BY k.nama_kostum
                SEPARATOR ', '
            ) AS nama_kostum,

            GROUP_CONCAT(
                DISTINCT k.kode_koleksi
                ORDER BY k.kode_koleksi
                SEPARATOR ', '
            ) AS kode_koleksi

        FROM pengembalian p

        INNER JOIN peminjaman pj
            ON p.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        LEFT JOIN petugas pt
            ON p.diterima_oleh = pt.id_petugas

        LEFT JOIN detail_peminjaman d
            ON p.id_peminjaman = d.id_peminjaman

        LEFT JOIN kostum k
            ON d.id_kostum = k.id_kostum

        WHERE
            p.id_pengembalian = ?

        GROUP BY
            p.id_pengembalian,
            p.id_peminjaman,
            p.tanggal_pengembalian,
            p.kondisi_baju,
            p.denda,
            p.keterangan,
            p.diterima_oleh,
            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status,
            u.nama,
            u.email,
            u.no_hp,
            pt.nama

        LIMIT 1
    `;

    db.query(
        sql,
        [idPengembalian],
        callback
    );
};

// ======================================================
// CEK APAKAH SUDAH ADA PENGEMBALIAN
// ======================================================

const checkExistingPengembalian = (
    idPeminjaman,
    callback
) => {
    const id = Number(idPeminjaman);

    if (!id) {
        return callback(
            new Error(
                "ID peminjaman tidak valid."
            ),
            null
        );
    }

    const sql = `
        SELECT
            id_pengembalian
        FROM pengembalian
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
// GET PEMINJAMAN YANG BELUM DIKEMBALIKAN
// ======================================================
//
// Hanya:
// status = Diproses
// DAN belum memiliki pengembalian
//
// ======================================================

const getPeminjamanBelumDikembalikan = (
    callback
) => {
    const sql = `
        SELECT
            pj.id_peminjaman,
            pj.id_user,
            pj.disetujui_oleh,
            pj.diproses_oleh,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user,
            u.alamat AS alamat_user,

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
                DISTINCT k.warna
                ORDER BY k.warna
                SEPARATOR ', '
            ) AS warna,

            GROUP_CONCAT(
                DISTINCT k.ukuran
                ORDER BY k.ukuran
                SEPARATOR ', '
            ) AS ukuran

        FROM peminjaman pj

        INNER JOIN users u
            ON pj.id_user = u.id_user

        INNER JOIN detail_peminjaman d
            ON pj.id_peminjaman = d.id_peminjaman

        INNER JOIN kostum k
            ON d.id_kostum = k.id_kostum

        LEFT JOIN pengembalian pg
            ON pj.id_peminjaman = pg.id_peminjaman

        WHERE
            pj.status = 'Diproses'
            AND pg.id_pengembalian IS NULL

        GROUP BY
            pj.id_peminjaman,
            pj.id_user,
            pj.disetujui_oleh,
            pj.diproses_oleh,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status,
            u.nama,
            u.email,
            u.no_hp,
            u.alamat

        ORDER BY
            pj.id_peminjaman DESC
    `;

    db.query(
        sql,
        callback
    );
};

// ======================================================
// CREATE PENGEMBALIAN
// ======================================================
//
// TRANSAKSI:
//
// 1. Lock peminjaman
// 2. Pastikan status Diproses
// 3. Pastikan belum ada pengembalian
// 4. Ambil detail peminjaman
// 5. Kembalikan stok kostum
// 6. Insert pengembalian
// 7. Jika denda > 0 -> insert denda
// 8. Status peminjaman -> Selesai
// 9. Commit
//
// Jika salah satu gagal:
// semua perubahan di-rollback.
//
// ======================================================

const createPengembalian = (
    data,
    callback
) => {
    const idPeminjaman =
        Number(data.id_peminjaman);

    const nominalDenda =
        Number(data.denda) || 0;

    // ==================================================
    // VALIDASI ID
    // ==================================================

    if (!idPeminjaman) {
        return callback(
            new Error(
                "ID peminjaman tidak valid."
            ),
            null
        );
    }

    // ==================================================
    // VALIDASI DENDA
    // ==================================================

    if (nominalDenda < 0) {
        return callback(
            new Error(
                "Nominal denda tidak boleh negatif."
            ),
            null
        );
    }

    // ==================================================
    // VALIDASI TANGGAL
    // ==================================================

    if (!data.tanggal_pengembalian) {
        return callback(
            new Error(
                "Tanggal pengembalian wajib diisi."
            ),
            null
        );
    }

    // ==================================================
    // AMBIL CONNECTION
    // ==================================================

    db.getConnection(
        (connectionErr, connection) => {

            if (connectionErr) {
                console.error(
                    "Gagal mendapatkan connection:",
                    connectionErr
                );

                return callback(
                    connectionErr,
                    null
                );
            }

            // ==================================================
            // BEGIN TRANSACTION
            // ==================================================

            connection.beginTransaction(
                (transactionErr) => {

                    if (transactionErr) {
                        connection.release();

                        return callback(
                            transactionErr,
                            null
                        );
                    }

                    // ==================================================
                    // ROLLBACK HELPER
                    // ==================================================

                    const rollback = (
                        error
                    ) => {

                        connection.rollback(
                            () => {

                                connection.release();

                                callback(
                                    error,
                                    null
                                );
                            }
                        );
                    };

                    // ==================================================
                    // LOCK PEMINJAMAN
                    // ==================================================

                    const getPeminjamanSql = `
                        SELECT
                            id_peminjaman,
                            id_user,
                            status
                        FROM peminjaman
                        WHERE id_peminjaman = ?
                        LIMIT 1
                        FOR UPDATE
                    `;

                    connection.query(
                        getPeminjamanSql,
                        [idPeminjaman],
                        (
                            peminjamanErr,
                            peminjamanRows
                        ) => {

                            if (peminjamanErr) {
                                return rollback(
                                    peminjamanErr
                                );
                            }

                            // ==================================================
                            // PEMINJAMAN TIDAK DITEMUKAN
                            // ==================================================

                            if (
                                !peminjamanRows ||
                                peminjamanRows.length === 0
                            ) {
                                return rollback(
                                    new Error(
                                        "Peminjaman tidak ditemukan."
                                    )
                                );
                            }

                            const peminjaman =
                                peminjamanRows[0];

                            // ==================================================
                            // STATUS HARUS DIPROSES
                            // ==================================================

                            if (
                                peminjaman.status !==
                                "Diproses"
                            ) {
                                return rollback(
                                    new Error(
                                        `Peminjaman tidak dapat dikembalikan karena status saat ini adalah "${peminjaman.status}".`
                                    )
                                );
                            }

                            // ==================================================
                            // CEK DUPLIKAT
                            // ==================================================

                            const existingSql = `
                                SELECT
                                    id_pengembalian
                                FROM pengembalian
                                WHERE id_peminjaman = ?
                                LIMIT 1
                                FOR UPDATE
                            `;

                            connection.query(
                                existingSql,
                                [idPeminjaman],
                                (
                                    existingErr,
                                    existingRows
                                ) => {

                                    if (existingErr) {
                                        return rollback(
                                            existingErr
                                        );
                                    }

                                    if (
                                        existingRows &&
                                        existingRows.length > 0
                                    ) {
                                        return rollback(
                                            new Error(
                                                "Peminjaman ini sudah memiliki data pengembalian."
                                            )
                                        );
                                    }

                                    // ==================================================
                                    // AMBIL DETAIL
                                    // ==================================================

                                    const detailSql = `
                                        SELECT
                                            id_detail,
                                            id_peminjaman,
                                            id_kostum,
                                            jumlah
                                        FROM detail_peminjaman
                                        WHERE id_peminjaman = ?
                                        ORDER BY id_detail ASC
                                    `;

                                    connection.query(
                                        detailSql,
                                        [idPeminjaman],
                                        (
                                            detailErr,
                                            details
                                        ) => {

                                            if (detailErr) {
                                                return rollback(
                                                    detailErr
                                                );
                                            }

                                            if (
                                                !details ||
                                                details.length === 0
                                            ) {
                                                return rollback(
                                                    new Error(
                                                        "Detail peminjaman tidak ditemukan."
                                                    )
                                                );
                                            }

                                            // ==================================================
                                            // VALIDASI DETAIL
                                            // ==================================================

                                            for (
                                                const detail of details
                                            ) {
                                                const idKostum =
                                                    Number(
                                                        detail.id_kostum
                                                    );

                                                const jumlah =
                                                    Number(
                                                        detail.jumlah
                                                    );

                                                if (
                                                    !idKostum ||
                                                    !jumlah ||
                                                    jumlah <= 0
                                                ) {
                                                    return rollback(
                                                        new Error(
                                                            `Detail kostum ID ${idKostum} tidak valid.`
                                                        )
                                                    );
                                                }
                                            }

                                            // ==================================================
                                            // PROSES STOK
                                            // ==================================================

                                            const processStock =
                                                (index) => {

                                                    if (
                                                        index >=
                                                        details.length
                                                    ) {
                                                        return insertPengembalian();
                                                    }

                                                    const detail =
                                                        details[index];

                                                    const idKostum =
                                                        Number(
                                                            detail.id_kostum
                                                        );

                                                    const jumlah =
                                                        Number(
                                                            detail.jumlah
                                                        );

                                                    // ==================================================
                                                    // KEMBALIKAN STOK
                                                    // ==================================================

                                                    const increaseStockSql = `
                                                        UPDATE kostum
                                                        SET stok = stok + ?
                                                        WHERE id_kostum = ?
                                                    `;

                                                    connection.query(
                                                        increaseStockSql,
                                                        [
                                                            jumlah,
                                                            idKostum,
                                                        ],
                                                        (
                                                            stockErr,
                                                            stockResult
                                                        ) => {

                                                            if (stockErr) {
                                                                return rollback(
                                                                    stockErr
                                                                );
                                                            }

                                                            if (
                                                                !stockResult ||
                                                                stockResult.affectedRows ===
                                                                    0
                                                            ) {
                                                                return rollback(
                                                                    new Error(
                                                                        `Kostum ID ${idKostum} tidak ditemukan.`
                                                                    )
                                                                );
                                                            }

                                                            processStock(
                                                                index + 1
                                                            );
                                                        }
                                                    );
                                                };

                                            // ==================================================
                                            // INSERT PENGEMBALIAN
                                            // ==================================================

                                            const insertPengembalian =
                                                () => {

                                                    const insertSql = `
                                                        INSERT INTO pengembalian
                                                        (
                                                            id_peminjaman,
                                                            tanggal_pengembalian,
                                                            kondisi_baju,
                                                            denda,
                                                            keterangan,
                                                            diterima_oleh
                                                        )
                                                        VALUES (?, ?, ?, ?, ?, ?)
                                                    `;

                                                    connection.query(
                                                        insertSql,
                                                        [
                                                            idPeminjaman,

                                                            data.tanggal_pengembalian,

                                                            data.kondisi_baju ||
                                                                "Baik",

                                                            nominalDenda,

                                                            data.keterangan ||
                                                                null,

                                                            data.diterima_oleh ||
                                                                null,
                                                        ],
                                                        (
                                                            insertErr,
                                                            insertResult
                                                        ) => {

                                                            if (insertErr) {
                                                                return rollback(
                                                                    insertErr
                                                                );
                                                            }

                                                            // ==================================================
                                                            // JIKA ADA DENDA
                                                            // ==================================================

                                                            if (
                                                                nominalDenda >
                                                                0
                                                            ) {

                                                                const alasanDenda =
                                                                    data.alasan_denda ||
                                                                    data.keterangan ||
                                                                    "Denda pengembalian kostum";

                                                                const insertDendaSql = `
                                                                    INSERT INTO denda
                                                                    (
                                                                        id_pengembalian,
                                                                        nominal_denda,
                                                                        alasan,
                                                                        status,
                                                                        dibuat_oleh,
                                                                        diperbarui_oleh
                                                                    )
                                                                    VALUES (?, ?, ?, ?, ?, ?)
                                                                `;

                                                                connection.query(
                                                                    insertDendaSql,
                                                                    [
                                                                        insertResult.insertId,

                                                                        nominalDenda,

                                                                        alasanDenda,

                                                                        "Belum Dibayar",

                                                                        data.diterima_oleh ||
                                                                            null,

                                                                        null,
                                                                    ],
                                                                    (
                                                                        dendaErr
                                                                    ) => {

                                                                        if (dendaErr) {
                                                                            return rollback(
                                                                                dendaErr
                                                                            );
                                                                        }

                                                                        updateStatusPeminjaman();
                                                                    }
                                                                );

                                                            } else {
                                                                updateStatusPeminjaman();
                                                            }
                                                        }
                                                    );
                                                };

                                            // ==================================================
                                            // UPDATE STATUS PEMINJAMAN
                                            // ==================================================

                                            const updateStatusPeminjaman =
                                                () => {

                                                    const updateStatusSql = `
                                                        UPDATE peminjaman
                                                        SET status = 'Selesai'
                                                        WHERE
                                                            id_peminjaman = ?
                                                            AND status = 'Diproses'
                                                    `;

                                                    connection.query(
                                                        updateStatusSql,
                                                        [idPeminjaman],
                                                        (
                                                            updateErr,
                                                            updateResult
                                                        ) => {

                                                            if (updateErr) {
                                                                return rollback(
                                                                    updateErr
                                                                );
                                                            }

                                                            if (
                                                                !updateResult ||
                                                                updateResult.affectedRows ===
                                                                    0
                                                            ) {
                                                                return rollback(
                                                                    new Error(
                                                                        "Status peminjaman gagal diubah menjadi Selesai."
                                                                    )
                                                                );
                                                            }

                                                            // ==================================================
                                                            // COMMIT
                                                            // ==================================================

                                                            connection.commit(
                                                                (
                                                                    commitErr
                                                                ) => {

                                                                    if (
                                                                        commitErr
                                                                    ) {
                                                                        return connection.rollback(
                                                                            () => {

                                                                                connection.release();

                                                                                callback(
                                                                                    commitErr,
                                                                                    null
                                                                                );
                                                                            }
                                                                        );
                                                                    }

                                                                    connection.release();

                                                                    callback(
                                                                        null,
                                                                        {
                                                                            ...insertResult,

                                                                            id_pengembalian:
                                                                                insertResult.insertId,

                                                                            id_peminjaman:
                                                                                idPeminjaman,

                                                                            denda:
                                                                                nominalDenda,

                                                                            status:
                                                                                "Selesai",
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    );
                                                };

                                            // ==================================================
                                            // MULAI PROSES STOK
                                            // ==================================================

                                            processStock(0);
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

// ======================================================
// UPDATE PENGEMBALIAN
// ======================================================
//
// Yang boleh diubah:
//
// - tanggal_pengembalian
// - kondisi_baju
// - denda
// - keterangan
// - diterima_oleh
//
// Tidak boleh mengubah:
//
// - id_peminjaman
// - stok
// - status peminjaman
//
// Sinkronisasi denda:
//
// 1. Tidak ada denda + nominal baru > 0
//    -> buat denda
//
// 2. Sudah ada denda + nominal berubah
//    -> update denda
//
// 3. Denda diubah menjadi 0
//    -> hapus denda jika belum Lunas
//
// 4. Denda sudah Lunas
//    -> nominal tidak boleh berubah
//
// ======================================================

const updatePengembalian = (
    id,
    data,
    callback
) => {
    const idPengembalian =
        Number(id);

    const nominalDenda =
        Number(data.denda) || 0;

    // ==================================================
    // VALIDASI ID
    // ==================================================

    if (!idPengembalian) {
        return callback(
            new Error(
                "ID pengembalian tidak valid."
            ),
            null
        );
    }

    // ==================================================
    // VALIDASI DENDA
    // ==================================================

    if (nominalDenda < 0) {
        return callback(
            new Error(
                "Nominal denda tidak boleh negatif."
            ),
            null
        );
    }

    // ==================================================
    // CONNECTION
    // ==================================================

    db.getConnection(
        (connectionErr, connection) => {

            if (connectionErr) {
                return callback(
                    connectionErr,
                    null
                );
            }

            connection.beginTransaction(
                (transactionErr) => {

                    if (transactionErr) {
                        connection.release();

                        return callback(
                            transactionErr,
                            null
                        );
                    }

                    // ==================================================
                    // ROLLBACK
                    // ==================================================

                    const rollback = (
                        error
                    ) => {

                        connection.rollback(
                            () => {

                                connection.release();

                                callback(
                                    error,
                                    null
                                );
                            }
                        );
                    };

                    // ==================================================
                    // COMMIT
                    // ==================================================

                    const commitUpdate =
                        () => {

                            connection.commit(
                                (
                                    commitErr
                                ) => {

                                    if (
                                        commitErr
                                    ) {
                                        return connection.rollback(
                                            () => {

                                                connection.release();

                                                callback(
                                                    commitErr,
                                                    null
                                                );
                                            }
                                        );
                                    }

                                    connection.release();

                                    callback(
                                        null,
                                        {
                                            affectedRows: 1,

                                            id_pengembalian:
                                                idPengembalian,
                                        }
                                    );
                                }
                            );
                        };

                    // ==================================================
                    // LOCK DATA PENGEMBALIAN
                    // ==================================================

                    const getReturnSql = `
                        SELECT
                            id_pengembalian,
                            id_peminjaman,
                            tanggal_pengembalian,
                            kondisi_baju,
                            denda,
                            keterangan,
                            diterima_oleh
                        FROM pengembalian
                        WHERE id_pengembalian = ?
                        LIMIT 1
                        FOR UPDATE
                    `;

                    connection.query(
                        getReturnSql,
                        [idPengembalian],
                        (
                            returnErr,
                            returnRows
                        ) => {

                            if (returnErr) {
                                return rollback(
                                    returnErr
                                );
                            }

                            if (
                                !returnRows ||
                                returnRows.length === 0
                            ) {
                                return rollback(
                                    new Error(
                                        "Data pengembalian tidak ditemukan."
                                    )
                                );
                            }

                            const pengembalian =
                                returnRows[0];

                            // ==================================================
                            // LOCK PEMINJAMAN
                            // ==================================================

                            const getPeminjamanSql = `
                                SELECT
                                    id_peminjaman,
                                    status
                                FROM peminjaman
                                WHERE id_peminjaman = ?
                                LIMIT 1
                                FOR UPDATE
                            `;

                            connection.query(
                                getPeminjamanSql,
                                [
                                    pengembalian.id_peminjaman,
                                ],
                                (
                                    peminjamanErr,
                                    peminjamanRows
                                ) => {

                                    if (
                                        peminjamanErr
                                    ) {
                                        return rollback(
                                            peminjamanErr
                                        );
                                    }

                                    if (
                                        !peminjamanRows ||
                                        peminjamanRows.length === 0
                                    ) {
                                        return rollback(
                                            new Error(
                                                "Peminjaman tidak ditemukan."
                                            )
                                        );
                                    }

                                    // ==================================================
                                    // UPDATE DATA PENGEMBALIAN
                                    // ==================================================

                                    const updateReturnSql = `
                                        UPDATE pengembalian
                                        SET
                                            tanggal_pengembalian = ?,
                                            kondisi_baju = ?,
                                            denda = ?,
                                            keterangan = ?,
                                            diterima_oleh = ?
                                        WHERE id_pengembalian = ?
                                    `;

                                    connection.query(
                                        updateReturnSql,
                                        [
                                            data.tanggal_pengembalian ||
                                                pengembalian.tanggal_pengembalian,

                                            data.kondisi_baju ||
                                                pengembalian.kondisi_baju ||
                                                "Baik",

                                            nominalDenda,

                                            data.keterangan ||
                                                null,

                                            data.diterima_oleh ||
                                                pengembalian.diterima_oleh ||
                                                null,

                                            idPengembalian,
                                        ],
                                        (
                                            updateReturnErr
                                        ) => {

                                            if (
                                                updateReturnErr
                                            ) {
                                                return rollback(
                                                    updateReturnErr
                                                );
                                            }

                                            // ==================================================
                                            // AMBIL DENDA
                                            // ==================================================

                                            const getDendaSql = `
                                                SELECT
                                                    id_denda,
                                                    nominal_denda,
                                                    alasan,
                                                    status
                                                FROM denda
                                                WHERE id_pengembalian = ?
                                                LIMIT 1
                                                FOR UPDATE
                                            `;

                                            connection.query(
                                                getDendaSql,
                                                [
                                                    idPengembalian,
                                                ],
                                                (
                                                    dendaErr,
                                                    dendaRows
                                                ) => {

                                                    if (
                                                        dendaErr
                                                    ) {
                                                        return rollback(
                                                            dendaErr
                                                        );
                                                    }

                                                    // ==================================================
                                                    // BELUM ADA DENDA
                                                    // ==================================================

                                                    if (
                                                        !dendaRows ||
                                                        dendaRows.length === 0
                                                    ) {

                                                        if (
                                                            nominalDenda <=
                                                            0
                                                        ) {
                                                            return commitUpdate();
                                                        }

                                                        const insertDendaSql = `
                                                            INSERT INTO denda
                                                            (
                                                                id_pengembalian,
                                                                nominal_denda,
                                                                alasan,
                                                                status,
                                                                dibuat_oleh,
                                                                diperbarui_oleh
                                                            )
                                                            VALUES (?, ?, ?, ?, ?, ?)
                                                        `;

                                                        connection.query(
                                                            insertDendaSql,
                                                            [
                                                                idPengembalian,

                                                                nominalDenda,

                                                                data.alasan_denda ||
                                                                    data.keterangan ||
                                                                    "Denda pengembalian kostum",

                                                                "Belum Dibayar",

                                                                data.diterima_oleh ||
                                                                    pengembalian.diterima_oleh ||
                                                                    null,

                                                                null,
                                                            ],
                                                            (
                                                                insertDendaErr
                                                            ) => {

                                                                if (
                                                                    insertDendaErr
                                                                ) {
                                                                    return rollback(
                                                                        insertDendaErr
                                                                    );
                                                                }

                                                                commitUpdate();
                                                            }
                                                        );

                                                        return;
                                                    }

                                                    const denda =
                                                        dendaRows[0];

                                                    // ==================================================
                                                    // DENDA MENJADI 0
                                                    // ==================================================

                                                    if (
                                                        nominalDenda <=
                                                        0
                                                    ) {

                                                        if (
                                                            denda.status ===
                                                            "Lunas"
                                                        ) {
                                                            return rollback(
                                                                new Error(
                                                                    "Denda yang sudah Lunas tidak dapat dihapus."
                                                                )
                                                            );
                                                        }

                                                        // ==================================================
                                                        // CEK PEMBAYARAN DENDA
                                                        // ==================================================

                                                        const checkPaymentSql = `
                                                            SELECT
                                                                id_pembayaran_denda
                                                            FROM pembayaran_denda
                                                            WHERE id_denda = ?
                                                            LIMIT 1
                                                        `;

                                                        connection.query(
                                                            checkPaymentSql,
                                                            [
                                                                denda.id_denda,
                                                            ],
                                                            (
                                                                paymentErr,
                                                                paymentRows
                                                            ) => {

                                                                if (
                                                                    paymentErr
                                                                ) {
                                                                    return rollback(
                                                                        paymentErr
                                                                    );
                                                                }

                                                                if (
                                                                    paymentRows &&
                                                                    paymentRows.length > 0
                                                                ) {
                                                                    return rollback(
                                                                        new Error(
                                                                            "Denda tidak dapat dihapus karena sudah memiliki data pembayaran."
                                                                        )
                                                                    );
                                                                }

                                                                const deleteDendaSql = `
                                                                    DELETE FROM denda
                                                                    WHERE id_denda = ?
                                                                `;

                                                                connection.query(
                                                                    deleteDendaSql,
                                                                    [
                                                                        denda.id_denda,
                                                                    ],
                                                                    (
                                                                        deleteDendaErr
                                                                    ) => {

                                                                        if (
                                                                            deleteDendaErr
                                                                        ) {
                                                                            return rollback(
                                                                                deleteDendaErr
                                                                            );
                                                                        }

                                                                        commitUpdate();
                                                                    }
                                                                );
                                                            }
                                                        );

                                                        return;
                                                    }

                                                    // ==================================================
                                                    // DENDA SUDAH LUNAS
                                                    // ==================================================

                                                    if (
                                                        denda.status ===
                                                        "Lunas"
                                                    ) {

                                                        if (
                                                            nominalDenda !==
                                                            Number(
                                                                denda.nominal_denda
                                                            )
                                                        ) {
                                                            return rollback(
                                                                new Error(
                                                                    "Nominal denda yang sudah Lunas tidak dapat diubah."
                                                                )
                                                            );
                                                        }

                                                        return commitUpdate();
                                                    }

                                                    // ==================================================
                                                    // UPDATE DENDA
                                                    // ==================================================

                                                    const updateDendaSql = `
                                                        UPDATE denda
                                                        SET
                                                            nominal_denda = ?,
                                                            alasan = ?,
                                                            diperbarui_oleh = ?,
                                                            updated_at = CURRENT_TIMESTAMP
                                                        WHERE id_denda = ?
                                                    `;

                                                    connection.query(
                                                        updateDendaSql,
                                                        [
                                                            nominalDenda,

                                                            data.alasan_denda ||
                                                                data.keterangan ||
                                                                denda.alasan ||
                                                                "Denda pengembalian kostum",

                                                            data.diterima_oleh ||
                                                                pengembalian.diterima_oleh ||
                                                                null,

                                                            denda.id_denda,
                                                        ],
                                                        (
                                                            updateDendaErr
                                                        ) => {

                                                            if (
                                                                updateDendaErr
                                                            ) {
                                                                return rollback(
                                                                    updateDendaErr
                                                                );
                                                            }

                                                            commitUpdate();
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

// ======================================================
// DELETE PENGEMBALIAN
// ======================================================
//
// PENTING:
//
// Pengembalian yang sudah berhasil:
// - sudah mengembalikan stok
// - status peminjaman sudah Selesai
//
// Karena itu tidak aman untuk menghapus record
// pengembalian secara langsung.
//
// Jika dihapus langsung:
// stok tetap bertambah
// status tetap Selesai
//
// sehingga data menjadi tidak konsisten.
//
// Oleh karena itu penghapusan diblokir jika:
// - memiliki denda
// - memiliki pembayaran denda
// - atau status peminjaman sudah Selesai
//
// ======================================================

const deletePengembalian = (
    id,
    callback
) => {

    const idPengembalian =
        Number(id);

    if (!idPengembalian) {
        return callback(
            new Error(
                "ID pengembalian tidak valid."
            ),
            null
        );
    }

    db.getConnection(
        (connectionErr, connection) => {

            if (connectionErr) {
                return callback(
                    connectionErr,
                    null
                );
            }

            connection.beginTransaction(
                (transactionErr) => {

                    if (transactionErr) {
                        connection.release();

                        return callback(
                            transactionErr,
                            null
                        );
                    }

                    const rollback = (
                        error
                    ) => {

                        connection.rollback(
                            () => {

                                connection.release();

                                callback(
                                    error,
                                    null
                                );
                            }
                        );
                    };

                    // ==================================================
                    // AMBIL PENGEMBALIAN
                    // ==================================================

                    const getReturnSql = `
                        SELECT
                            id_pengembalian,
                            id_peminjaman
                        FROM pengembalian
                        WHERE id_pengembalian = ?
                        LIMIT 1
                        FOR UPDATE
                    `;

                    connection.query(
                        getReturnSql,
                        [idPengembalian],
                        (
                            returnErr,
                            returnRows
                        ) => {

                            if (returnErr) {
                                return rollback(
                                    returnErr
                                );
                            }

                            if (
                                !returnRows ||
                                returnRows.length === 0
                            ) {
                                return rollback(
                                    new Error(
                                        "Data pengembalian tidak ditemukan."
                                    )
                                );
                            }

                            const pengembalian =
                                returnRows[0];

                            // ==================================================
                            // CEK PEMINJAMAN
                            // ==================================================

                            const getPeminjamanSql = `
                                SELECT
                                    id_peminjaman,
                                    status
                                FROM peminjaman
                                WHERE id_peminjaman = ?
                                LIMIT 1
                                FOR UPDATE
                            `;

                            connection.query(
                                getPeminjamanSql,
                                [
                                    pengembalian.id_peminjaman,
                                ],
                                (
                                    peminjamanErr,
                                    peminjamanRows
                                ) => {

                                    if (
                                        peminjamanErr
                                    ) {
                                        return rollback(
                                            peminjamanErr
                                        );
                                    }

                                    if (
                                        !peminjamanRows ||
                                        peminjamanRows.length === 0
                                    ) {
                                        return rollback(
                                            new Error(
                                                "Peminjaman tidak ditemukan."
                                            )
                                        );
                                    }

                                    const peminjaman =
                                        peminjamanRows[0];

                                    // ==================================================
                                    // CEK DENDA
                                    // ==================================================

                                    const getDendaSql = `
                                        SELECT
                                            id_denda,
                                            status
                                        FROM denda
                                        WHERE id_pengembalian = ?
                                        LIMIT 1
                                        FOR UPDATE
                                    `;

                                    connection.query(
                                        getDendaSql,
                                        [
                                            idPengembalian,
                                        ],
                                        (
                                            dendaErr,
                                            dendaRows
                                        ) => {

                                            if (
                                                dendaErr
                                            ) {
                                                return rollback(
                                                    dendaErr
                                                );
                                            }

                                            if (
                                                dendaRows &&
                                                dendaRows.length > 0
                                            ) {

                                                const denda =
                                                    dendaRows[0];

                                                // ==================================================
                                                // CEK PEMBAYARAN DENDA
                                                // ==================================================

                                                const checkPaymentSql = `
                                                    SELECT
                                                        id_pembayaran_denda
                                                    FROM pembayaran_denda
                                                    WHERE id_denda = ?
                                                    LIMIT 1
                                                `;

                                                connection.query(
                                                    checkPaymentSql,
                                                    [
                                                        denda.id_denda,
                                                    ],
                                                    (
                                                        paymentErr,
                                                        paymentRows
                                                    ) => {

                                                        if (
                                                            paymentErr
                                                        ) {
                                                            return rollback(
                                                                paymentErr
                                                            );
                                                        }

                                                        if (
                                                            paymentRows &&
                                                            paymentRows.length > 0
                                                        ) {
                                                            return rollback(
                                                                new Error(
                                                                    "Pengembalian tidak dapat dihapus karena sudah memiliki data pembayaran denda."
                                                                )
                                                            );
                                                        }

                                                        return rollback(
                                                            new Error(
                                                                "Pengembalian tidak dapat dihapus karena memiliki data denda. Gunakan fitur edit jika ingin mengubah nominal denda."
                                                            )
                                                        );
                                                    }
                                                );

                                                return;
                                            }

                                            // ==================================================
                                            // STATUS SELESAI
                                            // ==================================================
                                            //
                                            // Karena stok sudah dikembalikan,
                                            // penghapusan langsung tidak aman.
                                            //
                                            // ==================================================

                                            if (
                                                peminjaman.status ===
                                                "Selesai"
                                            ) {
                                                return rollback(
                                                    new Error(
                                                        "Data pengembalian tidak dapat dihapus karena peminjaman sudah berstatus Selesai dan stok telah dikembalikan."
                                                    )
                                                );
                                            }

                                            // ==================================================
                                            // KONDISI TIDAK NORMAL
                                            // ==================================================

                                            const deleteSql = `
                                                DELETE FROM pengembalian
                                                WHERE id_pengembalian = ?
                                            `;

                                            connection.query(
                                                deleteSql,
                                                [
                                                    idPengembalian,
                                                ],
                                                (
                                                    deleteErr,
                                                    deleteResult
                                                ) => {

                                                    if (
                                                        deleteErr
                                                    ) {
                                                        return rollback(
                                                            deleteErr
                                                        );
                                                    }

                                                    if (
                                                        !deleteResult ||
                                                        deleteResult.affectedRows ===
                                                            0
                                                    ) {
                                                        return rollback(
                                                            new Error(
                                                                "Data pengembalian gagal dihapus."
                                                            )
                                                        );
                                                    }

                                                    connection.commit(
                                                        (
                                                            commitErr
                                                        ) => {

                                                            if (
                                                                commitErr
                                                            ) {
                                                                return connection.rollback(
                                                                    () => {

                                                                        connection.release();

                                                                        callback(
                                                                            commitErr,
                                                                            null
                                                                        );
                                                                    }
                                                                );
                                                            }

                                                            connection.release();

                                                            callback(
                                                                null,
                                                                deleteResult
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getAllPengembalian,
    getPengembalian,
    getPengembalianById,
    checkExistingPengembalian,
    getPeminjamanBelumDikembalikan,
    createPengembalian,
    updatePengembalian,
    deletePengembalian,
};