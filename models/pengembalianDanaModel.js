// ======================================================
// models/pengembalianDanaModel.js
// ======================================================

const db = require("../config/db");


// ======================================================
// GET SEMUA PENGEMBALIAN DANA
// ======================================================

const getAllPengembalianDana = (callback) => {

    const sql = `
        SELECT
            pd.id_pengembalian_dana,
            pd.id_peminjaman,
            pd.id_pembayaran,
            pd.jumlah_dana,
            pd.alasan,
            pd.metode_pengembalian,
            pd.status,
            pd.tanggal_pengajuan,
            pd.tanggal_pengembalian,
            pd.bukti_pengembalian,
            pd.diproses_oleh,
            pd.keterangan,
            pd.created_at,
            pd.updated_at,

            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status AS status_peminjaman,

            p.total AS jumlah_dibayar,
            p.metode AS metode_pembayaran,
            p.status AS status_pembayaran,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user,

            pt.nama AS nama_petugas

        FROM pengembalian_dana pd

        INNER JOIN peminjaman pj
            ON pd.id_peminjaman = pj.id_peminjaman

        INNER JOIN pembayaran p
            ON pd.id_pembayaran = p.id_pembayaran

        INNER JOIN users u
            ON pj.id_user = u.id_user

        LEFT JOIN petugas pt
            ON pd.diproses_oleh = pt.id_petugas

        ORDER BY
            pd.id_pengembalian_dana DESC
    `;

    db.query(
        sql,
        callback
    );
};


// ======================================================
// GET PENGEMBALIAN DANA BERDASARKAN ID
// ======================================================

const getPengembalianDanaById = (
    id,
    callback
) => {

    const sql = `
        SELECT
            pd.id_pengembalian_dana,
            pd.id_peminjaman,
            pd.id_pembayaran,
            pd.jumlah_dana,
            pd.alasan,
            pd.metode_pengembalian,
            pd.status,
            pd.tanggal_pengajuan,
            pd.tanggal_pengembalian,
            pd.bukti_pengembalian,
            pd.diproses_oleh,
            pd.keterangan,
            pd.created_at,
            pd.updated_at,

            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status AS status_peminjaman,

            p.total AS jumlah_dibayar,
            p.metode AS metode_pembayaran,
            p.status AS status_pembayaran,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user,

            pt.nama AS nama_petugas

        FROM pengembalian_dana pd

        INNER JOIN peminjaman pj
            ON pd.id_peminjaman = pj.id_peminjaman

        INNER JOIN pembayaran p
            ON pd.id_pembayaran = p.id_pembayaran

        INNER JOIN users u
            ON pj.id_user = u.id_user

        LEFT JOIN petugas pt
            ON pd.diproses_oleh = pt.id_petugas

        WHERE
            pd.id_pengembalian_dana = ?

        LIMIT 1
    `;

    db.query(
        sql,
        [Number(id)],
        callback
    );
};


// ======================================================
// GET PENGEMBALIAN DANA BERDASARKAN PEMINJAMAN
// ======================================================

const getPengembalianDanaByPeminjaman = (
    idPeminjaman,
    callback
) => {

    const sql = `
        SELECT
            pd.id_pengembalian_dana,
            pd.id_peminjaman,
            pd.id_pembayaran,
            pd.jumlah_dana,
            pd.alasan,
            pd.metode_pengembalian,
            pd.status,
            pd.tanggal_pengajuan,
            pd.tanggal_pengembalian,
            pd.bukti_pengembalian,
            pd.diproses_oleh,
            pd.keterangan,
            pd.created_at,
            pd.updated_at,

            pj.id_user,
            pj.tanggal_peminjaman,
            pj.tanggal_kembali,
            pj.total_harga,
            pj.status AS status_peminjaman,

            p.total AS jumlah_dibayar,
            p.metode AS metode_pembayaran,
            p.status AS status_pembayaran,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user,

            pt.nama AS nama_petugas

        FROM pengembalian_dana pd

        INNER JOIN peminjaman pj
            ON pd.id_peminjaman = pj.id_peminjaman

        INNER JOIN pembayaran p
            ON pd.id_pembayaran = p.id_pembayaran

        INNER JOIN users u
            ON pj.id_user = u.id_user

        LEFT JOIN petugas pt
            ON pd.diproses_oleh = pt.id_petugas

        WHERE
            pd.id_peminjaman = ?

        ORDER BY
            pd.id_pengembalian_dana DESC
    `;

    db.query(
        sql,
        [Number(idPeminjaman)],
        callback
    );
};


// ======================================================
// CEK REFUND YANG SUDAH ADA UNTUK PEMBAYARAN
// ======================================================

const checkExistingPengembalianDana = (
    idPembayaran,
    callback
) => {

    const sql = `
        SELECT
            id_pengembalian_dana,
            id_peminjaman,
            id_pembayaran,
            jumlah_dana,
            status,
            tanggal_pengajuan,
            tanggal_pengembalian
        FROM pengembalian_dana

        WHERE
            id_pembayaran = ?

        ORDER BY
            id_pengembalian_dana DESC

        LIMIT 1
    `;

    db.query(
        sql,
        [Number(idPembayaran)],
        callback
    );
};


// ======================================================
// GET DATA PEMBAYARAN UNTUK REFUND
// ======================================================
//
// Sumber nominal refund:
// pembayaran.total
//
// Diberi alias "jumlah" supaya kompatibel dengan
// processAutomaticRefund() di controller.
// ======================================================

const getPembayaranUntukRefund = (
    idPeminjaman,
    callback
) => {

    const sql = `
        SELECT
            p.id_pembayaran,
            p.id_peminjaman,

            p.total AS jumlah,

            p.metode,
            p.status,

            pj.id_user,
            pj.total_harga,
            pj.status AS status_peminjaman,

            u.nama AS nama_user,
            u.email AS email_user,
            u.no_hp AS no_hp_user

        FROM pembayaran p

        INNER JOIN peminjaman pj
            ON p.id_peminjaman = pj.id_peminjaman

        INNER JOIN users u
            ON pj.id_user = u.id_user

        WHERE
            p.id_peminjaman = ?

        ORDER BY
            p.id_pembayaran DESC

        LIMIT 1
    `;

    db.query(
        sql,
        [Number(idPeminjaman)],
        callback
    );
};


// ======================================================
// CREATE PENGEMBALIAN DANA
// ======================================================
//
// Fungsi ini dapat dipanggil oleh controller.
//
// Nominal yang disimpan tetap berasal dari data yang
// dikirim controller setelah melakukan verifikasi
// pembayaran.
// ======================================================

const createPengembalianDana = (
    data,
    callback
) => {

    const idPeminjaman =
        Number(
            data.id_peminjaman
        );

    const idPembayaran =
        Number(
            data.id_pembayaran
        );

    const jumlahDana =
        Number(
            data.jumlah_dana
        );

    const alasan =
        data.alasan ||
        null;

    const metodePengembalian =
        data.metode_pengembalian ||
        "Transfer Bank";

    const status =
        data.status ||
        "Menunggu Pengembalian";

    const buktiPengembalian =
        data.bukti_pengembalian ||
        null;

    const diprosesOleh =
        data.diproses_oleh
            ? Number(
                data.diproses_oleh
            )
            : null;

    const keterangan =
        data.keterangan ||
        null;


    // ==================================================
    // VALIDASI ID PEMINJAMAN
    // ==================================================

    if (
        !idPeminjaman ||
        isNaN(idPeminjaman)
    ) {

        return callback(
            new Error(
                "ID peminjaman tidak valid."
            )
        );
    }


    // ==================================================
    // VALIDASI ID PEMBAYARAN
    // ==================================================

    if (
        !idPembayaran ||
        isNaN(idPembayaran)
    ) {

        return callback(
            new Error(
                "ID pembayaran tidak valid."
            )
        );
    }


    // ==================================================
    // VALIDASI JUMLAH DANA
    // ==================================================

    if (
        isNaN(jumlahDana) ||
        jumlahDana <= 0
    ) {

        return callback(
            new Error(
                "Jumlah dana pengembalian tidak valid."
            )
        );
    }


    // ==================================================
    // VALIDASI METODE
    // ==================================================

    const allowedMetode = [
        "Transfer Bank",
        "QRIS",
        "Cash"
    ];

    if (
        !allowedMetode.includes(
            metodePengembalian
        )
    ) {

        return callback(
            new Error(
                "Metode pengembalian dana tidak valid."
            )
        );
    }


    // ==================================================
    // VALIDASI STATUS
    // ==================================================

    const allowedStatus = [
        "Menunggu Pengembalian",
        "Diproses",
        "Berhasil",
        "Gagal"
    ];

    if (
        !allowedStatus.includes(
            status
        )
    ) {

        return callback(
            new Error(
                "Status pengembalian dana tidak valid."
            )
        );
    }


    // ==================================================
    // VALIDASI PEMBAYARAN
    // ==================================================
    //
    // Memastikan:
    //
    // 1. pembayaran memang milik peminjaman
    // 2. pembayaran berstatus Lunas
    // 3. nominal refund sama dengan nominal pembayaran
    //
    // Ini mencegah frontend mengirim nominal refund
    // sembarangan.
    // ==================================================

    const sqlPayment = `
        SELECT
            p.id_pembayaran,
            p.id_peminjaman,
            p.total,
            p.metode,
            p.status,

            pj.status AS status_peminjaman

        FROM pembayaran p

        INNER JOIN peminjaman pj
            ON p.id_peminjaman =
               pj.id_peminjaman

        WHERE
            p.id_pembayaran = ?
            AND p.id_peminjaman = ?

        LIMIT 1
    `;


    db.query(
        sqlPayment,
        [
            idPembayaran,
            idPeminjaman
        ],
        (
            paymentError,
            paymentRows
        ) => {

            if (
                paymentError
            ) {

                return callback(
                    paymentError
                );
            }


            if (
                !paymentRows ||
                paymentRows.length === 0
            ) {

                return callback(
                    new Error(
                        "Data pembayaran tidak ditemukan atau tidak sesuai dengan peminjaman."
                    )
                );
            }


            const payment =
                paymentRows[0];


            // ==========================================
            // PEMBAYARAN HARUS LUNAS
            // ==========================================

            if (
                payment.status !==
                "Lunas"
            ) {

                return callback(
                    new Error(
                        "Pembayaran belum Lunas sehingga dana belum dapat dikembalikan."
                    )
                );
            }


            // ==========================================
            // PEMINJAMAN HARUS DITOLAK
            // ==========================================

            if (
                payment.status_peminjaman !==
                "Ditolak"
            ) {

                return callback(
                    new Error(
                        "Pengembalian dana hanya dapat dibuat untuk peminjaman yang berstatus Ditolak."
                    )
                );
            }


            // ==========================================
            // NOMINAL HARUS SAMA
            // ==========================================

            const totalPembayaran =
                Number(
                    payment.total
                );


            if (
                isNaN(totalPembayaran) ||
                totalPembayaran <= 0
            ) {

                return callback(
                    new Error(
                        "Nominal pembayaran tidak valid."
                    )
                );
            }


            if (
                jumlahDana !==
                totalPembayaran
            ) {

                return callback(
                    new Error(
                        "Jumlah dana pengembalian harus sama dengan total pembayaran pelanggan."
                    )
                );
            }


            // ==========================================
            // CEK REFUND DUPLIKAT
            // ==========================================

            checkExistingPengembalianDana(
                idPembayaran,
                (
                    existingError,
                    existingRows
                ) => {

                    if (
                        existingError
                    ) {

                        return callback(
                            existingError
                        );
                    }


                    if (
                        existingRows &&
                        existingRows.length > 0
                    ) {

                        return callback(
                            new Error(
                                "Pembayaran ini sudah memiliki pengembalian dana."
                            )
                        );
                    }


                    // ==================================
                    // INSERT REFUND
                    // ==================================

                    const sql = `
                        INSERT INTO pengembalian_dana
                        (
                            id_peminjaman,
                            id_pembayaran,
                            jumlah_dana,
                            alasan,
                            metode_pengembalian,
                            status,
                            bukti_pengembalian,
                            diproses_oleh,
                            keterangan
                        )

                        VALUES
                        (
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?
                        )
                    `;


                    db.query(
                        sql,
                        [
                            idPeminjaman,
                            idPembayaran,
                            totalPembayaran,
                            alasan,
                            metodePengembalian,
                            status,
                            buktiPengembalian,
                            diprosesOleh,
                            keterangan
                        ],
                        callback
                    );
                }
            );
        }
    );
};


// ======================================================
// UPDATE DATA PENGEMBALIAN DANA
// ======================================================
//
// Nominal refund tidak boleh berbeda dari pembayaran.
// Status tidak diubah di fungsi ini.
// ======================================================

const updatePengembalianDana = (
    id,
    data,
    callback
) => {

    const jumlahDana =
        Number(
            data.jumlah_dana
        );

    const alasan =
        data.alasan ||
        null;

    const metodePengembalian =
        data.metode_pengembalian ||
        "Transfer Bank";

    const buktiPengembalian =
        data.bukti_pengembalian ||
        null;

    const keterangan =
        data.keterangan ||
        null;


    // ==================================================
    // VALIDASI JUMLAH
    // ==================================================

    if (
        isNaN(jumlahDana) ||
        jumlahDana <= 0
    ) {

        return callback(
            new Error(
                "Jumlah dana pengembalian tidak valid."
            )
        );
    }


    // ==================================================
    // VALIDASI METODE
    // ==================================================

    const allowedMetode = [
        "Transfer Bank",
        "QRIS",
        "Cash"
    ];

    if (
        !allowedMetode.includes(
            metodePengembalian
        )
    ) {

        return callback(
            new Error(
                "Metode pengembalian dana tidak valid."
            )
        );
    }


    // ==================================================
    // AMBIL DATA REFUND + PEMBAYARAN
    // ==================================================

    const sqlCheck = `
        SELECT
            pd.id_pengembalian_dana,
            pd.status,

            p.id_pembayaran,
            p.id_peminjaman,
            p.total,
            p.status AS status_pembayaran

        FROM pengembalian_dana pd

        INNER JOIN pembayaran p
            ON pd.id_pembayaran =
               p.id_pembayaran

        WHERE
            pd.id_pengembalian_dana = ?

        LIMIT 1
    `;


    db.query(
        sqlCheck,
        [Number(id)],
        (
            checkError,
            rows
        ) => {

            if (
                checkError
            ) {

                return callback(
                    checkError
                );
            }


            if (
                !rows ||
                rows.length === 0
            ) {

                return callback(
                    new Error(
                        "Pengembalian dana tidak ditemukan."
                    )
                );
            }


            const refund =
                rows[0];


            // ==========================================
            // REFUND BERHASIL TIDAK BOLEH DIUBAH
            // ==========================================

            if (
                refund.status ===
                "Berhasil"
            ) {

                return callback(
                    new Error(
                        "Pengembalian dana yang sudah Berhasil tidak dapat diubah."
                    )
                );
            }


            // ==========================================
            // PEMBAYARAN HARUS LUNAS
            // ==========================================

            if (
                refund.status_pembayaran !==
                "Lunas"
            ) {

                return callback(
                    new Error(
                        "Pembayaran tidak berstatus Lunas."
                    )
                );
            }


            // ==========================================
            // NOMINAL REFUND HARUS SAMA
            // ==========================================

            const totalPembayaran =
                Number(
                    refund.total
                );


            if (
                isNaN(totalPembayaran) ||
                totalPembayaran <= 0
            ) {

                return callback(
                    new Error(
                        "Nominal pembayaran tidak valid."
                    )
                );
            }


            if (
                jumlahDana !==
                totalPembayaran
            ) {

                return callback(
                    new Error(
                        "Jumlah dana pengembalian harus sama dengan total pembayaran."
                    )
                );
            }


            // ==========================================
            // UPDATE
            // ==========================================

            const sql = `
                UPDATE pengembalian_dana

                SET
                    jumlah_dana = ?,
                    alasan = ?,
                    metode_pengembalian = ?,

                    bukti_pengembalian =
                        COALESCE(
                            ?,
                            bukti_pengembalian
                        ),

                    keterangan = ?

                WHERE
                    id_pengembalian_dana = ?
            `;


            db.query(
                sql,
                [
                    jumlahDana,
                    alasan,
                    metodePengembalian,
                    buktiPengembalian,
                    keterangan,
                    Number(id)
                ],
                callback
            );
        }
    );
};


// ======================================================
// UPDATE STATUS PENGEMBALIAN DANA
// ======================================================

const updateStatusPengembalianDana = (
    id,
    status,
    diprosesOleh,
    tanggalPengembalian,
    buktiPengembalian,
    keterangan,
    callback
) => {

    const allowedStatus = [
        "Menunggu Pengembalian",
        "Diproses",
        "Berhasil",
        "Gagal"
    ];


    if (
        !allowedStatus.includes(
            status
        )
    ) {

        return callback(
            new Error(
                "Status pengembalian dana tidak valid."
            )
        );
    }


    // ==================================================
    // AMBIL STATUS SAAT INI
    // ==================================================

    const sqlCheck = `
        SELECT
            id_pengembalian_dana,
            status

        FROM pengembalian_dana

        WHERE
            id_pengembalian_dana = ?

        LIMIT 1
    `;


    db.query(
        sqlCheck,
        [Number(id)],
        (
            checkError,
            rows
        ) => {

            if (
                checkError
            ) {

                return callback(
                    checkError
                );
            }


            if (
                !rows ||
                rows.length === 0
            ) {

                return callback(
                    new Error(
                        "Pengembalian dana tidak ditemukan."
                    )
                );
            }


            const currentStatus =
                rows[0].status;


            // ==================================================
            // TRANSISI STATUS
            // ==================================================

            const transitions = {

                "Menunggu Pengembalian": [
                    "Diproses",
                    "Gagal"
                ],

                "Diproses": [
                    "Berhasil",
                    "Gagal"
                ],

                "Berhasil": [],

                "Gagal": [
                    "Menunggu Pengembalian"
                ]
            };


            if (
                currentStatus ===
                status
            ) {

                return callback(
                    new Error(
                        `Pengembalian dana sudah berstatus "${status}".`
                    )
                );
            }


            if (
                !transitions[
                    currentStatus
                ] ||
                !transitions[
                    currentStatus
                ].includes(status)
            ) {

                return callback(
                    new Error(
                        `Perubahan status dari "${currentStatus}" ke "${status}" tidak diperbolehkan.`
                    )
                );
            }


            // ==================================================
            // DIPROSES HARUS ADA PETUGAS
            // ==================================================

            if (
                status === "Diproses" &&
                !diprosesOleh
            ) {

                return callback(
                    new Error(
                        "Petugas yang memproses pengembalian dana wajib diisi."
                    )
                );
            }


            // ==================================================
            // UPDATE STATUS
            // ==================================================

            const sql = `
                UPDATE pengembalian_dana

                SET
                    status = ?,

                    diproses_oleh =
                        COALESCE(
                            ?,
                            diproses_oleh
                        ),

                    tanggal_pengembalian = ?,

                    bukti_pengembalian =
                        COALESCE(
                            ?,
                            bukti_pengembalian
                        ),

                    keterangan =
                        COALESCE(
                            ?,
                            keterangan
                        )

                WHERE
                    id_pengembalian_dana = ?
            `;


            db.query(
                sql,
                [
                    status,

                    diprosesOleh
                        ? Number(diprosesOleh)
                        : null,

                    tanggalPengembalian ||
                        null,

                    buktiPengembalian ||
                        null,

                    keterangan ||
                        null,

                    Number(id)
                ],
                callback
            );
        }
    );
};


// ======================================================
// DELETE PENGEMBALIAN DANA
// ======================================================
//
// Validasi status final dilakukan di controller.
// ======================================================

const deletePengembalianDana = (
    id,
    callback
) => {

    const sql = `
        DELETE FROM pengembalian_dana

        WHERE
            id_pengembalian_dana = ?
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

    getAllPengembalianDana,

    getPengembalianDanaById,

    getPengembalianDanaByPeminjaman,

    checkExistingPengembalianDana,

    getPembayaranUntukRefund,

    createPengembalianDana,

    updatePengembalianDana,

    updateStatusPengembalianDana,

    deletePengembalianDana

};