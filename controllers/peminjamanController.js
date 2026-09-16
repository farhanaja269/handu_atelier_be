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
                    error: err.message
                });

            }

            return res.status(200).json(result);

        }
    );

};


// ======================================================
// GET PEMINJAMAN BERDASARKAN ID
// ======================================================

const getPeminjamanById = (req, res) => {

    const id = req.params.id;


    if (
        !id ||
        isNaN(Number(id))
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman tidak valid"
        });

    }


    peminjamanModel.getPeminjamanById(
        Number(id),
        (err, result) => {

            if (err) {

                console.error(
                    "Error get peminjaman by id:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Terjadi kesalahan",
                    error: err.message
                });

            }


            if (
                !result ||
                result.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Data peminjaman tidak ditemukan"
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

const getPeminjamanDetailForUser =
    (req, res) => {

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
                    "ID peminjaman tidak valid"
            });

        }


        if (
            !idUser ||
            isNaN(Number(idUser))
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "ID user tidak valid"
            });

        }


        peminjamanModel.getPeminjamanDetailForUser(
            Number(id),
            Number(idUser),
            (err, result) => {

                if (err) {

                    console.error(
                        "Error detail peminjaman user:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Gagal mengambil detail peminjaman",
                        error: err.message
                    });

                }


                if (
                    !result ||
                    result.length === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Detail peminjaman tidak ditemukan"
                    });

                }


                return res.status(200).json({
                    success: true,
                    data: result[0]
                });

            }
        );

    };


// ======================================================
// GET DETAIL PEMINJAMAN UNTUK PETUGAS
// ======================================================

const getPeminjamanDetailForPetugas =
    (req, res) => {

        const id =
            req.params.id;


        if (
            !id ||
            isNaN(Number(id))
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "ID peminjaman tidak valid"
            });

        }


        peminjamanModel.getPeminjamanDetailForPetugas(
            Number(id),
            (err, result) => {

                if (err) {

                    console.error(
                        "Error detail peminjaman petugas:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Gagal mengambil detail peminjaman",
                        error: err.message
                    });

                }


                if (
                    !result ||
                    result.length === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Data peminjaman tidak ditemukan"
                    });

                }


                return res.status(200).json({
                    success: true,
                    data: result[0]
                });

            }
        );

    };


// ======================================================
// CREATE PEMINJAMAN
// ======================================================

const createPeminjaman = (req, res) => {

    const data = {
        ...(req.body || {})
    };


    // ==================================================
    // VALIDASI ID USER
    // ==================================================

    if (
        !data.id_user ||
        isNaN(Number(data.id_user))
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID user wajib diisi dan harus valid"
        });

    }


    // ==================================================
    // VALIDASI TANGGAL
    // ==================================================

    if (
        !data.tanggal_peminjaman
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Tanggal peminjaman wajib diisi"
        });

    }


    if (
        !data.tanggal_kembali
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Tanggal kembali wajib diisi"
        });

    }


    const startDate =
        new Date(
            `${data.tanggal_peminjaman}T00:00:00`
        );

    const endDate =
        new Date(
            `${data.tanggal_kembali}T00:00:00`
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
                "Format tanggal peminjaman tidak valid"
        });

    }


    if (
        endDate <= startDate
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Tanggal kembali harus setelah tanggal peminjaman"
        });

    }


    // ==================================================
    // VALIDASI TOTAL HARGA
    // ==================================================

    if (
        data.total_harga ===
            undefined ||
        data.total_harga ===
            null
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Total harga wajib diisi"
        });

    }


    const totalHarga =
        Number(
            data.total_harga
        );


    if (
        Number.isNaN(
            totalHarga
        ) ||
        totalHarga < 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Total harga tidak valid"
        });

    }


    // ==================================================
    // STATUS AWAL
    // ==================================================

    // Client tidak boleh menentukan status awal.
    //
    // Semua peminjaman baru selalu:
    //
    // Menunggu
    //
    // Perubahan status dilakukan melalui:
    //
    // PUT /peminjaman/:id/status
    // ==================================================

    data.status =
        "Menunggu";

    data.id_user =
        Number(data.id_user);

    data.total_harga =
        totalHarga;


    // ==================================================
    // SIMPAN PEMINJAMAN
    // ==================================================

    peminjamanModel.createPeminjaman(
        data,
        (err, result) => {

            if (err) {

                console.error(
                    "Error create peminjaman:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal menambahkan peminjaman",
                    error: err.message
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
                (notificationError) => {

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
                            idPeminjaman
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
// Endpoint ini TIDAK digunakan untuk mengubah status.
//
// Perubahan status hanya melalui:
// PUT /peminjaman/:id/status
//
// ======================================================

const updatePeminjaman =
    (req, res) => {

        const id =
            req.params.id;


        if (
            !id ||
            isNaN(Number(id))
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "ID peminjaman tidak valid"
            });

        }


        peminjamanModel.getPeminjamanById(
            Number(id),
            (getErr, oldResult) => {

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
                            getErr.message
                    });

                }


                if (
                    !oldResult ||
                    oldResult.length === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Peminjaman tidak ditemukan"
                    });

                }


                const oldData =
                    oldResult[0];


                const data = {
                    ...(req.body || {})
                };


                // ==================================================
                // STATUS TIDAK BOLEH DIUBAH
                // ==================================================

                delete data.status;


                data.status =
                    oldData.status;


                peminjamanModel.updatePeminjaman(
                    Number(id),
                    data,
                    (err, result) => {

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
                                    err.message
                            });

                        }


                        if (
                            !result ||
                            result.affectedRows === 0
                        ) {

                            return res.status(404).json({
                                success: false,
                                message:
                                    "Peminjaman tidak ditemukan"
                            });

                        }


                        const pesanAdmin =
                            `Data peminjaman #${id} diperbarui. ` +
                            `User ID ${oldData.id_user}. ` +
                            `Status tetap "${oldData.status}".`;


                        notificationModel.createNotificationForAdmins(
                            pesanAdmin,
                            (notificationError) => {

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
                                        "Peminjaman berhasil diperbarui"
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

const sendStatusNotifications =
    (
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
            (userNotificationError) => {

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
                    (adminNotificationError) => {

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
                                responseMessage
                        });

                    }
                );

            }
        );

    };


// ======================================================
// UPDATE STATUS PEMINJAMAN
// ======================================================

const updateStatusPeminjaman =
    (req, res) => {

        const id =
            req.params.id;

        const {
            status
        } = req.body || {};


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
                    "ID peminjaman tidak valid"
            });

        }


        // ==================================================
        // STATUS YANG DIIZINKAN
        // ==================================================

        const allowedStatus = [
            "Menunggu",
            "Disetujui",
            "Diproses",
            "Ditolak",
            "Dibatalkan",
            "Selesai"
        ];


        if (!status) {

            return res.status(400).json({
                success: false,
                message:
                    "Status wajib diisi"
            });

        }


        if (
            !allowedStatus.includes(
                status
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Status peminjaman tidak valid"
            });

        }


        // ==================================================
        // AMBIL STATUS SAAT INI
        // ==================================================

        peminjamanModel.getPeminjamanById(
            Number(id),
            (getErr, result) => {

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
                            getErr.message
                    });

                }


                if (
                    !result ||
                    result.length === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Peminjaman tidak ditemukan"
                    });

                }


                const currentData =
                    result[0];

                const currentStatus =
                    currentData.status;

                const idUser =
                    currentData.id_user;


                // ==================================================
                // TRANSISI STATUS
                // ==================================================
                //
                // Menunggu
                //   -> Disetujui
                //   -> Ditolak
                //   -> Dibatalkan
                //
                // Disetujui
                //   -> Diproses
                //   -> Dibatalkan
                //
                // Diproses
                //   -> Dibatalkan
                //
                // Selesai hanya melalui proses
                // pengembalian.
                //
                // ==================================================

                const transitions = {

                    Menunggu: [
                        "Disetujui",
                        "Ditolak",
                        "Dibatalkan"
                    ],

                    Disetujui: [
                        "Diproses",
                        "Dibatalkan"
                    ],

                    Diproses: [
                        "Dibatalkan"
                    ],

                    Ditolak: [],

                    Dibatalkan: [],

                    Selesai: []

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
                            `tidak dapat diubah menjadi ${status}`
                    });

                }


                // ==================================================
                // TRANSISI TANPA PERUBAHAN STOK
                // ==================================================
                //
                // Menunggu -> Disetujui
                // Menunggu -> Ditolak
                // Menunggu -> Dibatalkan
                // Disetujui -> Dibatalkan
                //
                // Tidak ada pengurangan stok.
                //
                // ==================================================

                if (
                    status !== "Diproses"
                ) {

                    return peminjamanModel.updateStatusPeminjaman(
                        Number(id),
                        status,
                        (updateErr, updateResult) => {

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
                                        updateErr.message
                                });

                            }


                            if (
                                !updateResult ||
                                updateResult.affectedRows === 0
                            ) {

                                return res.status(404).json({
                                    success: false,
                                    message:
                                        "Peminjaman tidak ditemukan"
                                });

                            }


                            return sendStatusNotifications(
                                res,
                                Number(id),
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
                // Pada saat menjadi Diproses:
                //
                // 1. Lock peminjaman
                // 2. Ambil semua detail
                // 3. Kurangi stok setiap kostum
                // 4. Jika salah satu gagal:
                //    rollback seluruh transaksi
                // 5. Jika semua berhasil:
                //    ubah status menjadi Diproses
                // 6. Commit
                //
                // ==================================================

                if (
                    currentStatus !==
                        "Disetujui" ||
                    status !==
                        "Diproses"
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Transisi status tidak valid"
                    });

                }


                db.getConnection(
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
                                    connectionError.message
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
                                            transactionError.message
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

                                                    console.error(
                                                        "Gagal mengunci data peminjaman:",
                                                        loanError
                                                    );

                                                    return res.status(500).json({
                                                        success: false,
                                                        message:
                                                            "Gagal mengunci data peminjaman",
                                                        error:
                                                            loanError.message
                                                    });

                                                }
                                            );

                                        }


                                        if (
                                            !loanRows ||
                                            loanRows.length ===
                                                0
                                        ) {

                                            return connection.rollback(
                                                () => {

                                                    connection.release();

                                                    return res.status(404).json({
                                                        success: false,
                                                        message:
                                                            "Peminjaman tidak ditemukan"
                                                    });

                                                }
                                            );

                                        }


                                        const lockedLoan =
                                            loanRows[0];


                                        // ==================================================
                                        // PASTIKAN STATUS MASIH DISETUJUI
                                        // ==================================================

                                        if (
                                            lockedLoan.status !==
                                            "Disetujui"
                                        ) {

                                            return connection.rollback(
                                                () => {

                                                    connection.release();

                                                    return res.status(400).json({
                                                        success: false,
                                                        message:
                                                            `Status peminjaman sudah berubah menjadi "${lockedLoan.status}".`
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

                                                            console.error(
                                                                "Gagal mengambil detail kostum:",
                                                                detailError
                                                            );

                                                            return res.status(500).json({
                                                                success: false,
                                                                message:
                                                                    "Gagal mengambil detail kostum",
                                                                error:
                                                                    detailError.message
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

                                                            return res.status(400).json({
                                                                success: false,
                                                                message:
                                                                    "Peminjaman belum memiliki detail kostum"
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
                                                        !detail.id_kostum ||
                                                        isNaN(
                                                            Number(
                                                                detail.id_kostum
                                                            )
                                                        )
                                                    ) {

                                                        return connection.rollback(
                                                            () => {

                                                                connection.release();

                                                                return res.status(400).json({
                                                                    success: false,
                                                                    message:
                                                                        "Detail peminjaman memiliki kostum yang tidak valid"
                                                                });

                                                            }
                                                        );

                                                    }


                                                    if (
                                                        !detail.jumlah ||
                                                        Number(
                                                            detail.jumlah
                                                        ) <=
                                                            0
                                                    ) {

                                                        return connection.rollback(
                                                            () => {

                                                                connection.release();

                                                                return res.status(400).json({
                                                                    success: false,
                                                                    message:
                                                                        "Jumlah kostum dalam detail peminjaman tidak valid"
                                                                });

                                                            }
                                                        );

                                                    }

                                                }


                                                // ==================================================
                                                // KURANGI STOK
                                                // ==================================================

                                                const processNext =
                                                    (
                                                        index
                                                    ) => {

                                                        if (
                                                            index >=
                                                            details.length
                                                        ) {

                                                            // ==================================================
                                                            // SEMUA STOK BERHASIL DIKURANGI
                                                            // ==================================================

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
                                                                    Number(id)
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

                                                                                return res.status(500).json({
                                                                                    success: false,
                                                                                    message:
                                                                                        "Gagal mengubah status peminjaman",
                                                                                    error:
                                                                                        statusError.message
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

                                                                                return res.status(400).json({
                                                                                    success: false,
                                                                                    message:
                                                                                        "Status peminjaman sudah berubah atau tidak dapat diproses."
                                                                                });

                                                                            }
                                                                        );

                                                                    }


                                                                    // ==================================================
                                                                    // COMMIT
                                                                    // ==================================================

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

                                                                                        return res.status(500).json({
                                                                                            success: false,
                                                                                            message:
                                                                                                "Gagal menyimpan perubahan stok",
                                                                                            error:
                                                                                                commitError.message
                                                                                        });

                                                                                    }
                                                                                );

                                                                            }


                                                                            connection.release();


                                                                            return sendStatusNotifications(
                                                                                res,
                                                                                Number(id),
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

                                                                            return res.status(500).json({
                                                                                success: false,
                                                                                message:
                                                                                    "Gagal mengurangi stok kostum",
                                                                                error:
                                                                                    stockError.message
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

                                                                            return res.status(400).json({
                                                                                success: false,
                                                                                message:
                                                                                    `Stok kostum ID ${detail.id_kostum} tidak mencukupi`
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

        );

    };


// ======================================================
// DELETE PEMINJAMAN
// ======================================================
//
// Diproses tidak boleh dihapus karena stok sudah dikurangi.
//
// Selesai tidak boleh dihapus karena merupakan riwayat.
//
// ======================================================

const deletePeminjaman =
    (req, res) => {

        const id =
            req.params.id;


        if (
            !id ||
            isNaN(Number(id))
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "ID peminjaman tidak valid"
            });

        }


        peminjamanModel.getPeminjamanById(
            Number(id),
            (getErr, result) => {

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
                            getErr.message
                    });

                }


                if (
                    !result ||
                    result.length === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Peminjaman tidak ditemukan"
                    });

                }


                const data =
                    result[0];

                const currentStatus =
                    data.status;


                // ==================================================
                // DIPROSES TIDAK BOLEH DIHAPUS
                // ==================================================

                if (
                    currentStatus ===
                    "Diproses"
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Peminjaman yang sedang Diproses tidak dapat dihapus. Selesaikan atau batalkan peminjaman terlebih dahulu."
                    });

                }


                // ==================================================
                // SELESAI TIDAK BOLEH DIHAPUS
                // ==================================================

                if (
                    currentStatus ===
                    "Selesai"
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Peminjaman yang sudah Selesai tidak dapat dihapus karena merupakan riwayat transaksi."
                    });

                }


                // ==================================================
                // HAPUS
                // ==================================================

                peminjamanModel.deletePeminjaman(
                    Number(id),
                    (err, deleteResult) => {

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
                                    err.message
                            });

                        }


                        if (
                            !deleteResult ||
                            deleteResult.affectedRows ===
                                0
                        ) {

                            return res.status(404).json({
                                success: false,
                                message:
                                    "Peminjaman tidak ditemukan"
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
                                        "Peminjaman berhasil dihapus"
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

const checkKostumAvailability =
    (req, res) => {

        const {
            id_kostum,
            tanggal_peminjaman,
            tanggal_kembali,
            jumlah
        } = req.query;


        // ==================================================
        // VALIDASI PARAMETER
        // ==================================================

        if (
            !id_kostum ||
            !tanggal_peminjaman ||
            !tanggal_kembali
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "ID kostum, tanggal peminjaman, dan tanggal kembali wajib diisi."
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
                    "ID kostum tidak valid."
            });

        }


        // ==================================================
        // VALIDASI JUMLAH
        // ==================================================

        const requestedJumlah =
            Number(jumlah) || 1;


        if (
            requestedJumlah <=
                0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Jumlah kostum harus lebih dari 0."
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
                    "Format tanggal tidak valid."
            });

        }


        if (
            endDate <=
                startDate
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Tanggal kembali harus setelah tanggal peminjaman."
            });

        }


        // ==================================================
        // CEK DATABASE
        // ==================================================

        peminjamanModel.checkKostumAvailability(
            Number(id_kostum),
            tanggal_peminjaman,
            tanggal_kembali,
            requestedJumlah,
            null,
            (err, availability) => {

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
                            err.message
                    });

                }


                return res.status(200).json({
                    success: true,
                    data:
                        availability
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

    checkKostumAvailability

};