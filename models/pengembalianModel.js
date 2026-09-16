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

            pt.nama AS nama_petugas

        FROM pengembalian p

        INNER JOIN peminjaman pj
            ON p.id_peminjaman =
               pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user =
               u.id_user

        LEFT JOIN petugas pt
            ON p.diterima_oleh =
               pt.id_petugas

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

            pt.nama AS nama_petugas

        FROM pengembalian p

        INNER JOIN peminjaman pj
            ON p.id_peminjaman =
               pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user =
               u.id_user

        LEFT JOIN petugas pt
            ON p.diterima_oleh =
               pt.id_petugas

        WHERE
            p.id_pengembalian = ?
    `;

    db.query(
        sql,
        [Number(id)],
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

    const sql = `
        SELECT
            id_pengembalian
        FROM pengembalian
        WHERE id_peminjaman = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [Number(idPeminjaman)],
        callback
    );
};

// ======================================================
// GET PEMINJAMAN YANG BELUM DIKEMBALIKAN
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
            ) AS kode_koleksi

        FROM peminjaman pj

        INNER JOIN users u
            ON pj.id_user =
               u.id_user

        INNER JOIN detail_peminjaman d
            ON pj.id_peminjaman =
               d.id_peminjaman

        INNER JOIN kostum k
            ON d.id_kostum =
               k.id_kostum

        LEFT JOIN pengembalian pg
            ON pj.id_peminjaman =
               pg.id_peminjaman

        WHERE
            pj.status = 'Diproses'
            AND pg.id_pengembalian IS NULL

        GROUP BY
            pj.id_peminjaman

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
// 3. Pastikan belum dikembalikan
// 4. Ambil detail
// 5. Tambah stok
// 6. Insert pengembalian
// 7. Status -> Selesai
// 8. Commit
//
// Jika gagal -> rollback semuanya.
//
// ======================================================

const createPengembalian = (
    data,
    callback
) => {

    const idPeminjaman =
        Number(data.id_peminjaman);

    if (!idPeminjaman) {
        return callback(
            new Error(
                "ID peminjaman tidak valid."
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

                                                            if (
                                                                stockErr
                                                            ) {
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
                                                            data.kondisi_baju,
                                                            Number(
                                                                data.denda
                                                            ) || 0,
                                                            data.keterangan ||
                                                                null,
                                                            data.diterima_oleh ||
                                                                null,
                                                        ],
                                                        (
                                                            insertErr,
                                                            insertResult
                                                        ) => {

                                                            if (
                                                                insertErr
                                                            ) {
                                                                return rollback(
                                                                    insertErr
                                                                );
                                                            }

                                                            // ==================================================
                                                            // STATUS -> SELESAI
                                                            // ==================================================

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

                                                                    if (
                                                                        updateErr
                                                                    ) {
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
                                                                                insertResult
                                                                            );
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    );
                                                };

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
// TIDAK BOLEH MENGUBAH:
//
// id_peminjaman
// stok
// status peminjaman
//
// Yang boleh diubah:
//
// tanggal_pengembalian
// kondisi_baju
// denda
// keterangan
// diterima_oleh
//
// ======================================================

const updatePengembalian = (
    id,
    data,
    callback
) => {

    const sql = `
        UPDATE pengembalian
        SET
            tanggal_pengembalian = ?,
            kondisi_baju = ?,
            denda = ?,
            keterangan = ?,
            diterima_oleh = ?
        WHERE id_pengembalian = ?
    `;

    db.query(
        sql,
        [
            data.tanggal_pengembalian,
            data.kondisi_baju,
            Number(data.denda) || 0,
            data.keterangan || null,
            data.diterima_oleh || null,
            Number(id),
        ],
        callback
    );
};

// ======================================================
// DELETE PENGEMBALIAN
// ======================================================
//
// Tidak mengubah stok.
//
// Stok sudah dikembalikan ketika createPengembalian()
// berhasil.
//
// ======================================================

const deletePengembalian = (
    id,
    callback
) => {

    const sql = `
        DELETE FROM pengembalian
        WHERE id_pengembalian = ?
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
    getAllPengembalian,
    getPengembalian,
    getPengembalianById,
    checkExistingPengembalian,
    getPeminjamanBelumDikembalikan,
    createPengembalian,
    updatePengembalian,
    deletePengembalian,
};