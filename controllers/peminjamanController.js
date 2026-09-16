// ======================================================
// controllers/peminjamanController.js
// ======================================================

const db = require("../config/db");

const peminjamanModel =
    require("../models/peminjamanModel");

const detailPeminjamanModel =
    require("../models/detailPeminjamanModel");

const notificationModel =
    require("../models/notificationModel");

const pengembalianDanaModel =
    require("../models/pengembalianDanaModel");


// ======================================================
// GET SEMUA PEMINJAMAN
// ======================================================

const getPeminjaman = (req, res) => {

    peminjamanModel.getAllPeminjaman(
        (err, result) => {

            if (err) {

                console.error(
                    "Error get peminjaman:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data peminjaman",
                    error:
                        err.message,
                });
            }

            return res.status(200).json(result);
        }
    );
};


// ======================================================
// GET PEMINJAMAN BERDASARKAN ID
// ======================================================

const getPeminjamanById = (
    req,
    res
) => {

    const id =
        req.params.id;

    if (
        !id ||
        isNaN(Number(id))
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman tidak valid",
        });
    }

    peminjamanModel.getPeminjamanById(
        id,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error get peminjaman by id:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Terjadi kesalahan",
                    error:
                        err.message,
                });
            }

            if (
                !result ||
                result.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Data peminjaman tidak ditemukan",
                });
            }

            return res.status(200).json(
                result[0]
            );
        }
    );
};


// ======================================================
// GET DETAIL PEMINJAMAN UNTUK USER
// ======================================================

const getPeminjamanDetailForUser = (
    req,
    res
) => {

    const id =
        req.params.id;

    const idUser =
        req.params.id_user;

    if (
        !id ||
        isNaN(Number(id))
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman tidak valid",
        });
    }

    if (
        !idUser ||
        isNaN(Number(idUser))
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID user tidak valid",
        });
    }

    peminjamanModel.getPeminjamanDetailForUser(
        Number(id),
        Number(idUser),
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error detail peminjaman user:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil detail peminjaman",
                    error:
                        err.message,
                });
            }

            if (
                !result ||
                result.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Detail peminjaman tidak ditemukan",
                });
            }

            return res.status(200).json({
                success: true,
                data:
                    result[0],
            });
        }
    );
};


// ======================================================
// GET DETAIL PEMINJAMAN UNTUK PETUGAS
// ======================================================

const getPeminjamanDetailForPetugas = (
    req,
    res
) => {

    const id =
        req.params.id;

    if (
        !id ||
        isNaN(Number(id))
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman tidak valid",
        });
    }

    peminjamanModel.getPeminjamanDetailForPetugas(
        id,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error detail peminjaman petugas:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil detail peminjaman",
                    error:
                        err.message,
                });
            }

            if (
                !result ||
                result.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Data peminjaman tidak ditemukan",
                });
            }

            return res.status(200).json({
                success: true,
                data:
                    result[0],
            });
        }
    );
};


// ======================================================
// CREATE PEMINJAMAN
// ======================================================

const createPeminjaman = (
    req,
    res
) => {

    const data = {
        ...(req.body || {}),
    };


    // ==================================================
    // VALIDASI
    // ==================================================

    if (!data.id_user) {

        return res.status(400).json({
            success: false,
            message:
                "ID user wajib diisi",
        });
    }

    if (!data.tanggal_peminjaman) {

        return res.status(400).json({
            success: false,
            message:
                "Tanggal peminjaman wajib diisi",
        });
    }

    if (!data.tanggal_kembali) {

        return res.status(400).json({
            success: false,
            message:
                "Tanggal kembali wajib diisi",
        });
    }

    if (
        data.total_harga === undefined ||
        data.total_harga === null
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Total harga wajib diisi",
        });
    }


    // ==================================================
    // VALIDASI TANGGAL
    // ==================================================

    const tanggalPeminjaman =
        new Date(
            `${data.tanggal_peminjaman}T00:00:00`
        );

    const tanggalKembali =
        new Date(
            `${data.tanggal_kembali}T00:00:00`
        );

    if (
        Number.isNaN(
            tanggalPeminjaman.getTime()
        ) ||
        Number.isNaN(
            tanggalKembali.getTime()
        )
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Format tanggal tidak valid",
        });
    }

    if (
        tanggalKembali <=
        tanggalPeminjaman
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Tanggal kembali harus setelah tanggal peminjaman",
        });
    }


    // ==================================================
    // STATUS BARU SELALU MENUNGGU
    // ==================================================

    data.status =
        "Menunggu";

    data.total_harga =
        Number(data.total_harga) || 0;


    // ==================================================
    // SIMPAN PEMINJAMAN
    // ==================================================

    peminjamanModel.createPeminjaman(
        data,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error create peminjaman:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal menambahkan peminjaman",
                    error:
                        err.message,
                });
            }

            const idPeminjaman =
                result.insertId;


            // ==================================================
            // NOTIFIKASI ADMIN
            // ==================================================

            const pesanAdmin =
                `Pengajuan peminjaman baru #${idPeminjaman} ` +
                `dari user ID ${data.id_user}. ` +
                `Tanggal pinjam: ${data.tanggal_peminjaman}. ` +
                `Tanggal kembali: ${data.tanggal_kembali}. ` +
                `Status: Menunggu.`;

            notificationModel.createNotificationForAdmins(
                pesanAdmin,
                (
                    notificationError
                ) => {

                    if (
                        notificationError
                    ) {

                        console.error(
                            "Gagal membuat notifikasi admin:",
                            notificationError
                        );
                    }

                    return res.status(201).json({
                        success: true,
                        message:
                            "Peminjaman berhasil ditambahkan",
                        id_peminjaman:
                            idPeminjaman,
                    });
                }
            );
        }
    );
};


// ======================================================
// UPDATE PEMINJAMAN LENGKAP
// ======================================================
//
// Endpoint ini tidak digunakan untuk mengubah status.
// Status tetap menggunakan status lama.
//
// Perubahan status hanya melalui:
// PUT /peminjaman/:id/status
// ======================================================

const updatePeminjaman = (
    req,
    res
) => {

    const id =
        req.params.id;

    if (
        !id ||
        isNaN(Number(id))
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman tidak valid",
        });
    }


    peminjamanModel.getPeminjamanById(
        id,
        (
            getErr,
            oldResult
        ) => {

            if (getErr) {

                console.error(
                    "Error mengambil data sebelum update:",
                    getErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data peminjaman",
                    error:
                        getErr.message,
                });
            }

            if (
                !oldResult ||
                oldResult.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Peminjaman tidak ditemukan",
                });
            }

            const oldData =
                oldResult[0];


            // ==================================================
            // STATUS TIDAK BOLEH DIUBAH DI SINI
            // ==================================================

            const data = {
                ...(req.body || {}),
            };

            delete data.status;

            data.status =
                oldData.status;


            peminjamanModel.updatePeminjaman(
                id,
                data,
                (
                    err,
                    result
                ) => {

                    if (err) {

                        console.error(
                            "Error update peminjaman:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal mengubah data",
                            error:
                                err.message,
                        });
                    }

                    if (
                        !result ||
                        result.affectedRows === 0
                    ) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "Peminjaman tidak ditemukan",
                        });
                    }


                    // ==================================================
                    // NOTIFIKASI ADMIN
                    // ==================================================

                    const pesanAdmin =
                        `Data peminjaman #${id} diperbarui. ` +
                        `User ID ${oldData.id_user}. ` +
                        `Status tetap "${oldData.status}".`;

                    notificationModel.createNotificationForAdmins(
                        pesanAdmin,
                        (
                            notificationError
                        ) => {

                            if (
                                notificationError
                            ) {

                                console.error(
                                    "Gagal membuat notifikasi admin saat update:",
                                    notificationError
                                );
                            }

                            return res.status(200).json({
                                success: true,
                                message:
                                    "Peminjaman berhasil diperbarui",
                            });
                        }
                    );
                }
            );
        }
    );
};


// ======================================================
// HELPER NOTIFIKASI STATUS
// ======================================================

const sendStatusNotifications = (
    res,
    id,
    idUser,
    currentStatus,
    newStatus,
    responseMessage
) => {

    const pesanUser =
        `Peminjaman #${id} ` +
        `telah diperbarui menjadi "${newStatus}".`;

    const pesanAdmin =
        `Status peminjaman #${id} ` +
        `milik user ID ${idUser} ` +
        `diubah dari "${currentStatus}" ` +
        `menjadi "${newStatus}".`;


    notificationModel.createNotificationForUser(
        idUser,
        pesanUser,
        (
            userNotificationError
        ) => {

            if (
                userNotificationError
            ) {

                console.error(
                    "Gagal membuat notifikasi user:",
                    userNotificationError
                );
            }

            notificationModel.createNotificationForAdmins(
                pesanAdmin,
                (
                    adminNotificationError
                ) => {

                    if (
                        adminNotificationError
                    ) {

                        console.error(
                            "Gagal membuat notifikasi admin:",
                            adminNotificationError
                        );
                    }

                    return res.status(200).json({
                        success: true,
                        message:
                            responseMessage,
                    });
                }
            );
        }
    );
};


// ======================================================
// PROSES REFUND OTOMATIS
// ======================================================
//
// Dipanggil ketika:
//
// Menunggu -> Ditolak
//
// Alur:
//
// 1. Cari pembayaran.
// 2. Jika tidak ada pembayaran,
//    tidak membuat refund.
// 3. Jika pembayaran belum Lunas,
//    tidak membuat refund.
// 4. Jika sudah ada refund,
//    tidak membuat refund kedua.
// 5. Jika pembayaran Lunas,
//    buat pengembalian dana sebesar nominal
//    yang benar-benar telah dibayarkan.
// ======================================================

const processAutomaticRefund = (
    idPeminjaman,
    callback
) => {

    pengembalianDanaModel.getPembayaranUntukRefund(
        Number(idPeminjaman),
        (
            paymentErr,
            paymentResult
        ) => {

            if (paymentErr) {

                console.error(
                    "ERROR CEK PEMBAYARAN UNTUK REFUND:",
                    paymentErr
                );

                return callback(
                    paymentErr
                );
            }


            // ==================================================
            // TIDAK ADA PEMBAYARAN
            // ==================================================

            if (
                !paymentResult ||
                paymentResult.length === 0
            ) {

                return callback(
                    null,
                    {
                        dibuat: false,
                        alasan:
                            "Tidak ada pembayaran."
                    }
                );
            }


            const payment =
                paymentResult[0];


            // ==================================================
            // PEMBAYARAN HARUS LUNAS
            // ==================================================

            if (
                payment.status !==
                "Lunas"
            ) {

                return callback(
                    null,
                    {
                        dibuat: false,
                        alasan:
                            "Pembayaran belum Lunas."
                    }
                );
            }


            // ==================================================
            // NOMINAL PEMBAYARAN
            // ==================================================

            const jumlahDibayar =
                Number(
                    payment.jumlah
                );


            if (
                isNaN(jumlahDibayar) ||
                jumlahDibayar <= 0
            ) {

                return callback(
                    new Error(
                        "Jumlah pembayaran untuk refund tidak valid."
                    )
                );
            }


            // ==================================================
            // CEK REFUND SEBELUMNYA
            // ==================================================

            pengembalianDanaModel
                .checkExistingPengembalianDana(
                    payment.id_pembayaran,
                    (
                        existingErr,
                        existing
                    ) => {

                        if (existingErr) {

                            console.error(
                                "ERROR CEK REFUND EXISTING:",
                                existingErr
                            );

                            return callback(
                                existingErr
                            );
                        }


                        if (
                            existing &&
                            existing.length > 0
                        ) {

                            return callback(
                                null,
                                {
                                    dibuat: false,
                                    sudahAda: true,
                                    id_pengembalian_dana:
                                        existing[0]
                                            .id_pengembalian_dana,
                                    alasan:
                                        "Refund untuk pembayaran ini sudah ada."
                                }
                            );
                        }


                        // ==================================================
                        // DATA REFUND
                        // ==================================================

                        const refundData = {

                            id_peminjaman:
                                payment.id_peminjaman,

                            id_pembayaran:
                                payment.id_pembayaran,

                            jumlah_dana:
                                jumlahDibayar,

                            alasan:
                                "Pengembalian dana karena peminjaman ditolak.",

                            metode_pengembalian:
                                payment.metode ||
                                "Transfer Bank",

                            status:
                                "Menunggu Pengembalian",

                            bukti_pengembalian:
                                null,

                            diproses_oleh:
                                null,

                            keterangan:
                                "Refund dibuat otomatis karena peminjaman ditolak."
                        };


                        // ==================================================
                        // INSERT REFUND
                        // ==================================================

                        pengembalianDanaModel
                            .createPengembalianDana(
                                refundData,
                                (
                                    createErr,
                                    createResult
                                ) => {

                                    if (
                                        createErr
                                    ) {

                                        console.error(
                                            "ERROR CREATE REFUND OTOMATIS:",
                                            createErr
                                        );

                                        return callback(
                                            createErr
                                        );
                                    }


                                    return callback(
                                        null,
                                        {
                                            dibuat: true,
                                            id_pengembalian_dana:
                                                createResult.insertId,
                                            jumlah_dana:
                                                jumlahDibayar
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
// UPDATE STATUS PEMINJAMAN
// ======================================================

const updateStatusPeminjaman = (
    req,
    res
) => {

    const id =
        req.params.id;

    const {
        status
    } =
        req.body || {};


    // ==================================================
    // VALIDASI ID
    // ==================================================

    if (
        !id ||
        isNaN(Number(id))
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman tidak valid",
        });
    }


    // ==================================================
    // VALIDASI STATUS
    // ==================================================

    const allowedStatus = [
        "Menunggu",
        "Disetujui",
        "Diproses",
        "Ditolak",
        "Dibatalkan",
        "Selesai",
    ];


    if (!status) {

        return res.status(400).json({
            success: false,
            message:
                "Status wajib diisi",
        });
    }


    if (
        !allowedStatus.includes(status)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Status peminjaman tidak valid",
        });
    }


    // ==================================================
    // AMBIL DATA PEMINJAMAN
    // ==================================================

    peminjamanModel.getPeminjamanById(
        Number(id),
        (
            getErr,
            result
        ) => {

            if (getErr) {

                console.error(
                    "Error mengambil peminjaman:",
                    getErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data peminjaman",
                    error:
                        getErr.message,
                });
            }


            if (
                !result ||
                result.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Peminjaman tidak ditemukan",
                });
            }


            const currentData =
                result[0];

            const currentStatus =
                currentData.status;

            const idUser =
                currentData.id_user;


            // ==================================================
            // VALIDASI TRANSISI
            // ==================================================

            const transitions = {

                Menunggu: [
                    "Disetujui",
                    "Ditolak",
                    "Dibatalkan",
                ],

                Disetujui: [
                    "Diproses",
                    "Dibatalkan",
                ],

                Diproses: [
                    "Selesai",
                    "Dibatalkan",
                ],

                Ditolak: [],

                Dibatalkan: [],

                Selesai: [],
            };


            const allowedTransitions =
                transitions[
                    currentStatus
                ] || [];


            if (
                !allowedTransitions.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Status ${currentStatus || "kosong"} ` +
                        `tidak dapat diubah menjadi ${status}`,
                });
            }


            // ==================================================
            // MENUNGGU -> DITOLAK
            // ==================================================
            //
            // Status peminjaman diubah terlebih dahulu.
            // Setelah berhasil, sistem mengecek pembayaran
            // dan membuat refund otomatis apabila memenuhi
            // syarat.
            // ==================================================

            if (
                currentStatus === "Menunggu" &&
                status === "Ditolak"
            ) {

                return peminjamanModel.updateStatusPeminjaman(
                    Number(id),
                    status,
                    (
                        updateErr,
                        updateResult
                    ) => {

                        if (updateErr) {

                            console.error(
                                "Error update status menjadi Ditolak:",
                                updateErr
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Gagal mengubah status peminjaman",
                                error:
                                    updateErr.message,
                            });
                        }


                        if (
                            !updateResult ||
                            updateResult.affectedRows === 0
                        ) {

                            return res.status(404).json({
                                success: false,
                                message:
                                    "Peminjaman tidak ditemukan",
                            });
                        }


                        // ==================================================
                        // PROSES REFUND OTOMATIS
                        // ==================================================

                        processAutomaticRefund(
                            Number(id),
                            (
                                refundErr,
                                refundResult
                            ) => {

                                if (refundErr) {

                                    console.error(
                                        "ERROR REFUND OTOMATIS SETELAH DITOLAK:",
                                        refundErr
                                    );

                                    // Status peminjaman tetap Ditolak.
                                    // Refund dapat diproses kembali melalui
                                    // endpoint pengembalian dana.
                                    return sendStatusNotifications(
                                        res,
                                        id,
                                        idUser,
                                        currentStatus,
                                        status,
                                        "Peminjaman berhasil ditolak, tetapi proses refund otomatis mengalami kendala."
                                    );
                                }


                                let responseMessage =
                                    "Peminjaman berhasil ditolak";


                                if (
                                    refundResult &&
                                    refundResult.dibuat
                                ) {

                                    responseMessage =
                                        `Peminjaman berhasil ditolak dan refund sebesar Rp${Number(
                                            refundResult.jumlah_dana
                                        ).toLocaleString(
                                            "id-ID"
                                        )} berhasil dibuat.`;

                                } else if (
                                    refundResult &&
                                    refundResult.sudahAda
                                ) {

                                    responseMessage =
                                        "Peminjaman berhasil ditolak. Data refund untuk pembayaran ini sudah tersedia.";

                                } else if (
                                    refundResult &&
                                    refundResult.alasan ===
                                    "Pembayaran belum Lunas."
                                ) {

                                    responseMessage =
                                        "Peminjaman berhasil ditolak. Pembayaran belum Lunas sehingga tidak ada refund otomatis yang dibuat.";

                                } else if (
                                    refundResult &&
                                    refundResult.alasan ===
                                    "Tidak ada pembayaran."
                                ) {

                                    responseMessage =
                                        "Peminjaman berhasil ditolak. Peminjaman tidak memiliki pembayaran sehingga tidak ada refund yang dibuat.";
                                }


                                return sendStatusNotifications(
                                    res,
                                    id,
                                    idUser,
                                    currentStatus,
                                    status,
                                    responseMessage
                                );
                            }
                        );
                    }
                );
            }


            // ==================================================
            // TRANSISI TANPA PERUBAHAN STOK
            // ==================================================
            //
            // Menunggu -> Disetujui
            // Menunggu -> Dibatalkan
            // Disetujui -> Dibatalkan
            //
            // Tidak ada pengurangan stok.
            //
            // Diproses -> Dibatalkan ditangani khusus
            // di bawah karena harus mengembalikan stok.
            // ==================================================

            if (
                status !== "Diproses" &&
                !(
                    currentStatus === "Diproses" &&
                    status === "Dibatalkan"
                )
            ) {

                return peminjamanModel.updateStatusPeminjaman(
                    Number(id),
                    status,
                    (
                        updateErr,
                        updateResult
                    ) => {

                        if (updateErr) {

                            console.error(
                                "Error update status:",
                                updateErr
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Gagal mengubah status peminjaman",
                                error:
                                    updateErr.message,
                            });
                        }


                        if (
                            !updateResult ||
                            updateResult.affectedRows === 0
                        ) {

                            return res.status(404).json({
                                success: false,
                                message:
                                    "Peminjaman tidak ditemukan",
                            });
                        }


                        return sendStatusNotifications(
                            res,
                            id,
                            idUser,
                            currentStatus,
                            status,
                            `Status peminjaman berhasil diubah menjadi ${status}`
                        );
                    }
                );
            }


            // ==================================================
            // DISETUJUI -> DIPROSES
            // ==================================================
            //
            // Saat menjadi Diproses:
            //
            // 1. Lock peminjaman.
            // 2. Ambil detail.
            // 3. Validasi detail.
            // 4. Kurangi stok setiap kostum.
            // 5. Jika salah satu gagal -> rollback.
            // 6. Ubah status menjadi Diproses.
            // 7. Commit.
            // ==================================================

            if (
                currentStatus === "Disetujui" &&
                status === "Diproses"
            ) {

                return db.getConnection(
                    (
                        connectionError,
                        connection
                    ) => {

                        if (
                            connectionError
                        ) {

                            console.error(
                                "Gagal mendapatkan koneksi database:",
                                connectionError
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Gagal memulai transaksi database",
                                error:
                                    connectionError.message,
                            });
                        }


                        connection.beginTransaction(
                            (
                                transactionError
                            ) => {

                                if (
                                    transactionError
                                ) {

                                    connection.release();

                                    console.error(
                                        "Gagal memulai transaksi:",
                                        transactionError
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Gagal memulai transaksi",
                                        error:
                                            transactionError.message,
                                    });
                                }


                                // ==================================================
                                // LOCK PEMINJAMAN
                                // ==================================================

                                const sqlLoan = `
                                    SELECT
                                        id_peminjaman,
                                        id_user,
                                        status
                                    FROM peminjaman
                                    WHERE id_peminjaman = ?
                                    FOR UPDATE
                                `;


                                connection.query(
                                    sqlLoan,
                                    [
                                        Number(id)
                                    ],
                                    (
                                        loanError,
                                        loanRows
                                    ) => {

                                        if (
                                            loanError
                                        ) {

                                            return connection.rollback(
                                                () => {

                                                    connection.release();

                                                    return res.status(
                                                        500
                                                    ).json({
                                                        success: false,
                                                        message:
                                                            "Gagal mengunci data peminjaman",
                                                        error:
                                                            loanError.message,
                                                    });
                                                }
                                            );
                                        }


                                        if (
                                            !loanRows ||
                                            loanRows.length === 0
                                        ) {

                                            return connection.rollback(
                                                () => {

                                                    connection.release();

                                                    return res.status(
                                                        404
                                                    ).json({
                                                        success: false,
                                                        message:
                                                            "Peminjaman tidak ditemukan",
                                                    });
                                                }
                                            );
                                        }


                                        const lockedLoan =
                                            loanRows[0];


                                        if (
                                            lockedLoan.status !==
                                            "Disetujui"
                                        ) {

                                            return connection.rollback(
                                                () => {

                                                    connection.release();

                                                    return res.status(
                                                        400
                                                    ).json({
                                                        success: false,
                                                        message:
                                                            `Status peminjaman sudah berubah menjadi "${lockedLoan.status}".`,
                                                    });
                                                }
                                            );
                                        }


                                        // ==================================================
                                        // AMBIL DETAIL
                                        // ==================================================

                                        const sqlDetail = `
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
                                            sqlDetail,
                                            [
                                                Number(id)
                                            ],
                                            (
                                                detailError,
                                                details
                                            ) => {

                                                if (
                                                    detailError
                                                ) {

                                                    return connection.rollback(
                                                        () => {

                                                            connection.release();

                                                            return res.status(
                                                                500
                                                            ).json({
                                                                success: false,
                                                                message:
                                                                    "Gagal mengambil detail kostum",
                                                                error:
                                                                    detailError.message,
                                                            });
                                                        }
                                                    );
                                                }


                                                if (
                                                    !details ||
                                                    details.length ===
                                                        0
                                                ) {

                                                    return connection.rollback(
                                                        () => {

                                                            connection.release();

                                                            return res.status(
                                                                400
                                                            ).json({
                                                                success: false,
                                                                message:
                                                                    "Peminjaman belum memiliki detail kostum",
                                                            });
                                                        }
                                                    );
                                                }


                                                // ==================================================
                                                // VALIDASI DETAIL
                                                // ==================================================

                                                for (
                                                    const detail of details
                                                ) {

                                                    if (
                                                        !detail.id_kostum
                                                    ) {

                                                        return connection.rollback(
                                                            () => {

                                                                connection.release();

                                                                return res.status(
                                                                    400
                                                                ).json({
                                                                    success: false,
                                                                    message:
                                                                        "Detail peminjaman memiliki kostum yang tidak valid",
                                                                });
                                                            }
                                                        );
                                                    }


                                                    if (
                                                        !detail.jumlah ||
                                                        Number(
                                                            detail.jumlah
                                                        ) <= 0
                                                    ) {

                                                        return connection.rollback(
                                                            () => {

                                                                connection.release();

                                                                return res.status(
                                                                    400
                                                                ).json({
                                                                    success: false,
                                                                    message:
                                                                        "Jumlah kostum dalam detail peminjaman tidak valid",
                                                                });
                                                            }
                                                        );
                                                    }
                                                }


                                                // ==================================================
                                                // KURANGI STOK SATU PER SATU
                                                // ==================================================

                                                const processNext =
                                                    (
                                                        index
                                                    ) => {

                                                        if (
                                                            index >=
                                                            details.length
                                                        ) {

                                                            // ==========================================
                                                            // SEMUA STOK BERHASIL DIKURANGI
                                                            // ==========================================

                                                            const sqlStatus = `
                                                                UPDATE peminjaman
                                                                SET status = ?
                                                                WHERE id_peminjaman = ?
                                                                  AND status = 'Disetujui'
                                                            `;


                                                            return connection.query(
                                                                sqlStatus,
                                                                [
                                                                    "Diproses",
                                                                    Number(
                                                                        id
                                                                    )
                                                                ],
                                                                (
                                                                    statusError,
                                                                    statusResult
                                                                ) => {

                                                                    if (
                                                                        statusError
                                                                    ) {

                                                                        return connection.rollback(
                                                                            () => {

                                                                                connection.release();

                                                                                console.error(
                                                                                    "Gagal mengubah status menjadi Diproses:",
                                                                                    statusError
                                                                                );

                                                                                return res
                                                                                    .status(
                                                                                        500
                                                                                    )
                                                                                    .json({
                                                                                        success: false,
                                                                                        message:
                                                                                            "Gagal mengubah status peminjaman",
                                                                                        error:
                                                                                            statusError.message,
                                                                                    });
                                                                            }
                                                                        );
                                                                    }


                                                                    if (
                                                                        !statusResult ||
                                                                        statusResult.affectedRows ===
                                                                            0
                                                                    ) {

                                                                        return connection.rollback(
                                                                            () => {

                                                                                connection.release();

                                                                                return res
                                                                                    .status(
                                                                                        400
                                                                                    )
                                                                                    .json({
                                                                                        success: false,
                                                                                        message:
                                                                                            "Status peminjaman sudah berubah atau tidak dapat diproses.",
                                                                                    });
                                                                            }
                                                                        );
                                                                    }


                                                                    // ==========================================
                                                                    // COMMIT
                                                                    // ==========================================

                                                                    connection.commit(
                                                                        (
                                                                            commitError
                                                                        ) => {

                                                                            if (
                                                                                commitError
                                                                            ) {

                                                                                return connection.rollback(
                                                                                    () => {

                                                                                        connection.release();

                                                                                        console.error(
                                                                                            "Gagal commit transaksi:",
                                                                                            commitError
                                                                                        );

                                                                                        return res
                                                                                            .status(
                                                                                                500
                                                                                            )
                                                                                            .json({
                                                                                                success: false,
                                                                                                message:
                                                                                                    "Gagal menyimpan perubahan stok",
                                                                                                error:
                                                                                                    commitError.message,
                                                                                            });
                                                                                    }
                                                                                );
                                                                            }


                                                                            connection.release();


                                                                            return sendStatusNotifications(
                                                                                res,
                                                                                id,
                                                                                idUser,
                                                                                currentStatus,
                                                                                "Diproses",
                                                                                "Peminjaman berhasil diproses dan stok kostum berhasil dikurangi"
                                                                            );
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }


                                                        const detail =
                                                            details[
                                                                index
                                                            ];


                                                        const jumlah =
                                                            Number(
                                                                detail.jumlah
                                                            );


                                                        // ==================================================
                                                        // KURANGI STOK SECARA ATOMIK
                                                        // ==================================================

                                                        const sqlStock = `
                                                            UPDATE kostum
                                                            SET stok = stok - ?
                                                            WHERE id_kostum = ?
                                                              AND stok >= ?
                                                        `;


                                                        connection.query(
                                                            sqlStock,
                                                            [
                                                                jumlah,
                                                                Number(
                                                                    detail.id_kostum
                                                                ),
                                                                jumlah
                                                            ],
                                                            (
                                                                stockError,
                                                                stockResult
                                                            ) => {

                                                                if (
                                                                    stockError
                                                                ) {

                                                                    return connection.rollback(
                                                                        () => {

                                                                            connection.release();

                                                                            console.error(
                                                                                "Gagal mengurangi stok kostum:",
                                                                                stockError
                                                                            );

                                                                            return res
                                                                                .status(
                                                                                    500
                                                                                )
                                                                                .json({
                                                                                    success: false,
                                                                                    message:
                                                                                        "Gagal mengurangi stok kostum",
                                                                                    error:
                                                                                        stockError.message,
                                                                                });
                                                                        }
                                                                    );
                                                                }


                                                                if (
                                                                    !stockResult ||
                                                                    stockResult.affectedRows ===
                                                                        0
                                                                ) {

                                                                    return connection.rollback(
                                                                        () => {

                                                                            connection.release();

                                                                            return res
                                                                                .status(
                                                                                    400
                                                                                )
                                                                                .json({
                                                                                    success: false,
                                                                                    message:
                                                                                        `Stok kostum ID ${detail.id_kostum} tidak mencukupi`,
                                                                                });
                                                                        }
                                                                    );
                                                                }


                                                                processNext(
                                                                    index +
                                                                        1
                                                                );
                                                            }
                                                        );
                                                    };


                                                processNext(0);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }


            // ==================================================
            // DIPROSES -> DIBATALKAN
            // ==================================================
            //
            // Karena stok sudah dikurangi ketika menjadi
            // Diproses, stok harus dikembalikan ketika
            // peminjaman dibatalkan.
            //
            // Semua dilakukan dalam satu transaksi.
            // ==================================================

            if (
                currentStatus === "Diproses" &&
                status === "Dibatalkan"
            ) {

                return db.getConnection(
                    (
                        connectionError,
                        connection
                    ) => {

                        if (
                            connectionError
                        ) {

                            console.error(
                                "Gagal mendapatkan koneksi database:",
                                connectionError
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Gagal memulai transaksi database",
                                error:
                                    connectionError.message,
                            });
                        }


                        connection.beginTransaction(
                            (
                                transactionError
                            ) => {

                                if (
                                    transactionError
                                ) {

                                    connection.release();

                                    console.error(
                                        "Gagal memulai transaksi:",
                                        transactionError
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Gagal memulai transaksi",
                                        error:
                                            transactionError.message,
                                    });
                                }


                                // ==================================================
                                // LOCK PEMINJAMAN
                                // ==================================================

                                const sqlLoan = `
                                    SELECT
                                        id_peminjaman,
                                        id_user,
                                        status
                                    FROM peminjaman
                                    WHERE id_peminjaman = ?
                                    FOR UPDATE
                                `;


                                connection.query(
                                    sqlLoan,
                                    [
                                        Number(id)
                                    ],
                                    (
                                        loanError,
                                        loanRows
                                    ) => {

                                        if (
                                            loanError
                                        ) {

                                            return connection.rollback(
                                                () => {

                                                    connection.release();

                                                    return res.status(
                                                        500
                                                    ).json({
                                                        success: false,
                                                        message:
                                                            "Gagal mengunci data peminjaman",
                                                        error:
                                                            loanError.message,
                                                    });
                                                }
                                            );
                                        }


                                        if (
                                            !loanRows ||
                                            loanRows.length === 0
                                        ) {

                                            return connection.rollback(
                                                () => {

                                                    connection.release();

                                                    return res.status(
                                                        404
                                                    ).json({
                                                        success: false,
                                                        message:
                                                            "Peminjaman tidak ditemukan",
                                                    });
                                                }
                                            );
                                        }


                                        const lockedLoan =
                                            loanRows[0];


                                        if (
                                            lockedLoan.status !==
                                            "Diproses"
                                        ) {

                                            return connection.rollback(
                                                () => {

                                                    connection.release();

                                                    return res.status(
                                                        400
                                                    ).json({
                                                        success: false,
                                                        message:
                                                            `Status peminjaman sudah berubah menjadi "${lockedLoan.status}".`,
                                                    });
                                                }
                                            );
                                        }


                                        // ==================================================
                                        // AMBIL DETAIL
                                        // ==================================================

                                        const sqlDetail = `
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
                                            sqlDetail,
                                            [
                                                Number(id)
                                            ],
                                            (
                                                detailError,
                                                details
                                            ) => {

                                                if (
                                                    detailError
                                                ) {

                                                    return connection.rollback(
                                                        () => {

                                                            connection.release();

                                                            return res.status(
                                                                500
                                                            ).json({
                                                                success: false,
                                                                message:
                                                                    "Gagal mengambil detail kostum",
                                                                error:
                                                                    detailError.message,
                                                            });
                                                        }
                                                    );
                                                }


                                                if (
                                                    !details ||
                                                    details.length ===
                                                        0
                                                ) {

                                                    return connection.rollback(
                                                        () => {

                                                            connection.release();

                                                            return res.status(
                                                                400
                                                            ).json({
                                                                success: false,
                                                                message:
                                                                    "Peminjaman belum memiliki detail kostum",
                                                            });
                                                        }
                                                    );
                                                }


                                                // ==================================================
                                                // VALIDASI DETAIL
                                                // ==================================================

                                                for (
                                                    const detail of details
                                                ) {

                                                    if (
                                                        !detail.id_kostum
                                                    ) {

                                                        return connection.rollback(
                                                            () => {

                                                                connection.release();

                                                                return res.status(
                                                                    400
                                                                ).json({
                                                                    success: false,
                                                                    message:
                                                                        "Detail peminjaman memiliki kostum yang tidak valid",
                                                                });
                                                            }
                                                        );
                                                    }


                                                    if (
                                                        !detail.jumlah ||
                                                        Number(
                                                            detail.jumlah
                                                        ) <= 0
                                                    ) {

                                                        return connection.rollback(
                                                            () => {

                                                                connection.release();

                                                                return res.status(
                                                                    400
                                                                ).json({
                                                                    success: false,
                                                                    message:
                                                                        "Jumlah kostum dalam detail peminjaman tidak valid",
                                                                });
                                                            }
                                                        );
                                                    }
                                                }


                                                // ==================================================
                                                // KEMBALIKAN STOK SATU PER SATU
                                                // ==================================================

                                                const restoreNext =
                                                    (
                                                        index
                                                    ) => {

                                                        if (
                                                            index >=
                                                            details.length
                                                        ) {

                                                            // ==========================================
                                                            // UBAH STATUS
                                                            // ==========================================

                                                            const sqlStatus = `
                                                                UPDATE peminjaman
                                                                SET status = ?
                                                                WHERE id_peminjaman = ?
                                                                  AND status = 'Diproses'
                                                            `;


                                                            return connection.query(
                                                                sqlStatus,
                                                                [
                                                                    "Dibatalkan",
                                                                    Number(
                                                                        id
                                                                    )
                                                                ],
                                                                (
                                                                    statusError,
                                                                    statusResult
                                                                ) => {

                                                                    if (
                                                                        statusError
                                                                    ) {

                                                                        return connection.rollback(
                                                                            () => {

                                                                                connection.release();

                                                                                console.error(
                                                                                    "Gagal mengubah status menjadi Dibatalkan:",
                                                                                    statusError
                                                                                );

                                                                                return res
                                                                                    .status(
                                                                                        500
                                                                                    )
                                                                                    .json({
                                                                                        success: false,
                                                                                        message:
                                                                                            "Gagal mengubah status peminjaman",
                                                                                        error:
                                                                                            statusError.message,
                                                                                    });
                                                                            }
                                                                        );
                                                                    }


                                                                    if (
                                                                        !statusResult ||
                                                                        statusResult.affectedRows ===
                                                                            0
                                                                    ) {

                                                                        return connection.rollback(
                                                                            () => {

                                                                                connection.release();

                                                                                return res
                                                                                    .status(
                                                                                        400
                                                                                    )
                                                                                    .json({
                                                                                        success: false,
                                                                                        message:
                                                                                            "Status peminjaman sudah berubah atau tidak dapat dibatalkan.",
                                                                                    });
                                                                            }
                                                                        );
                                                                    }


                                                                    // ==========================================
                                                                    // COMMIT
                                                                    // ==========================================

                                                                    connection.commit(
                                                                        (
                                                                            commitError
                                                                        ) => {

                                                                            if (
                                                                                commitError
                                                                            ) {

                                                                                return connection.rollback(
                                                                                    () => {

                                                                                        connection.release();

                                                                                        console.error(
                                                                                            "Gagal commit pengembalian stok:",
                                                                                            commitError
                                                                                        );

                                                                                        return res
                                                                                            .status(
                                                                                                500
                                                                                            )
                                                                                            .json({
                                                                                                success: false,
                                                                                                message:
                                                                                                    "Gagal menyimpan pengembalian stok",
                                                                                                error:
                                                                                                    commitError.message,
                                                                                            });
                                                                                    }
                                                                                );
                                                                            }


                                                                            connection.release();


                                                                            return sendStatusNotifications(
                                                                                res,
                                                                                id,
                                                                                idUser,
                                                                                currentStatus,
                                                                                "Dibatalkan",
                                                                                "Peminjaman dibatalkan dan stok kostum berhasil dikembalikan"
                                                                            );
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }


                                                        const detail =
                                                            details[
                                                                index
                                                            ];


                                                        const jumlah =
                                                            Number(
                                                                detail.jumlah
                                                            );


                                                        // ==================================================
                                                        // TAMBAH STOK
                                                        // ==================================================

                                                        const sqlRestoreStock = `
                                                            UPDATE kostum
                                                            SET stok = stok + ?
                                                            WHERE id_kostum = ?
                                                        `;


                                                        connection.query(
                                                            sqlRestoreStock,
                                                            [
                                                                jumlah,
                                                                Number(
                                                                    detail.id_kostum
                                                                )
                                                            ],
                                                            (
                                                                stockError,
                                                                stockResult
                                                            ) => {

                                                                if (
                                                                    stockError
                                                                ) {

                                                                    return connection.rollback(
                                                                        () => {

                                                                            connection.release();

                                                                            console.error(
                                                                                "Gagal mengembalikan stok kostum:",
                                                                                stockError
                                                                            );

                                                                            return res
                                                                                .status(
                                                                                    500
                                                                                )
                                                                                .json({
                                                                                    success: false,
                                                                                    message:
                                                                                        "Gagal mengembalikan stok kostum",
                                                                                    error:
                                                                                        stockError.message,
                                                                                });
                                                                        }
                                                                    );
                                                                }


                                                                if (
                                                                    !stockResult ||
                                                                    stockResult.affectedRows ===
                                                                        0
                                                                ) {

                                                                    return connection.rollback(
                                                                        () => {

                                                                            connection.release();

                                                                            return res
                                                                                .status(
                                                                                    400
                                                                                )
                                                                                .json({
                                                                                    success: false,
                                                                                    message:
                                                                                        `Kostum ID ${detail.id_kostum} tidak ditemukan`,
                                                                                });
                                                                        }
                                                                    );
                                                                }


                                                                restoreNext(
                                                                    index +
                                                                        1
                                                                );
                                                            }
                                                        );
                                                    };


                                                restoreNext(0);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        }
    );
};


// ======================================================
// DELETE PEMINJAMAN
// ======================================================
//
// Tidak boleh menghapus:
// - Diproses
// - Selesai
//
// Karena:
// - Diproses sudah mengurangi stok.
// - Selesai merupakan riwayat transaksi.
// ======================================================

const deletePeminjaman = (
    req,
    res
) => {

    const id =
        req.params.id;

    if (
        !id ||
        isNaN(Number(id))
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman tidak valid",
        });
    }


    peminjamanModel.getPeminjamanById(
        id,
        (
            getErr,
            result
        ) => {

            if (getErr) {

                console.error(
                    "Error mengambil peminjaman sebelum delete:",
                    getErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data peminjaman",
                    error:
                        getErr.message,
                });
            }


            if (
                !result ||
                result.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Peminjaman tidak ditemukan",
                });
            }


            const data =
                result[0];

            const currentStatus =
                data.status;


            // ==================================================
            // JANGAN HAPUS DIPROSES
            // ==================================================

            if (
                currentStatus ===
                "Diproses"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Peminjaman yang sedang Diproses tidak dapat dihapus. Selesaikan atau batalkan peminjaman terlebih dahulu.",
                });
            }


            // ==================================================
            // JANGAN HAPUS SELESAI
            // ==================================================

            if (
                currentStatus ===
                "Selesai"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Peminjaman yang sudah Selesai tidak dapat dihapus karena merupakan riwayat transaksi.",
                });
            }


            peminjamanModel.deletePeminjaman(
                id,
                (
                    err,
                    deleteResult
                ) => {

                    if (err) {

                        console.error(
                            "Error delete peminjaman:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal menghapus peminjaman",
                            error:
                                err.message,
                        });
                    }


                    if (
                        !deleteResult ||
                        deleteResult.affectedRows === 0
                    ) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "Peminjaman tidak ditemukan",
                        });
                    }


                    // ==================================================
                    // NOTIFIKASI ADMIN
                    // ==================================================

                    const pesanAdmin =
                        `Peminjaman #${id} ` +
                        `milik user ID ${data.id_user} ` +
                        `telah dihapus dari sistem. ` +
                        `Status sebelumnya: ${currentStatus}.`;

                    notificationModel.createNotificationForAdmins(
                        pesanAdmin,
                        (
                            notificationError
                        ) => {

                            if (
                                notificationError
                            ) {

                                console.error(
                                    "Gagal membuat notifikasi admin setelah delete:",
                                    notificationError
                                );
                            }


                            return res.status(200).json({
                                success: true,
                                message:
                                    "Peminjaman berhasil dihapus",
                            });
                        }
                    );
                }
            );
        }
    );
};


// ======================================================
// CEK KETERSEDIAAN KOSTUM BERDASARKAN TANGGAL
// ======================================================

const checkKostumAvailability = (
    req,
    res
) => {

    const {
        id_kostum,
        tanggal_peminjaman,
        tanggal_kembali,
        jumlah,
    } =
        req.query;


    // ==================================================
    // VALIDASI
    // ==================================================

    if (
        !id_kostum ||
        !tanggal_peminjaman ||
        !tanggal_kembali
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID kostum, tanggal peminjaman, dan tanggal kembali wajib diisi.",
        });
    }


    if (
        isNaN(
            Number(id_kostum)
        )
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID kostum tidak valid.",
        });
    }


    // ==================================================
    // VALIDASI TANGGAL
    // ==================================================

    const startDate =
        new Date(
            `${tanggal_peminjaman}T00:00:00`
        );

    const endDate =
        new Date(
            `${tanggal_kembali}T00:00:00`
        );


    if (
        Number.isNaN(
            startDate.getTime()
        ) ||
        Number.isNaN(
            endDate.getTime()
        )
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Format tanggal tidak valid.",
        });
    }


    if (
        endDate <=
        startDate
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Tanggal kembali harus setelah tanggal peminjaman.",
        });
    }


    // ==================================================
    // CEK DATABASE
    // ==================================================

    peminjamanModel.checkKostumAvailability(
        Number(id_kostum),
        tanggal_peminjaman,
        tanggal_kembali,
        Number(jumlah) || 1,
        null,
        (
            err,
            availability
        ) => {

            if (err) {

                console.error(
                    "Error check availability:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengecek ketersediaan kostum.",
                    error:
                        err.message,
                });
            }


            return res.status(200).json({
                success: true,
                data:
                    availability,
            });
        }
    );
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getPeminjaman,

    getPeminjamanById,

    getPeminjamanDetailForUser,

    getPeminjamanDetailForPetugas,

    createPeminjaman,

    updatePeminjaman,

    updateStatusPeminjaman,

    deletePeminjaman,

    checkKostumAvailability,

};