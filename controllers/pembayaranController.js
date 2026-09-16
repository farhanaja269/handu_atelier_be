// controllers/pembayaranController.js

const pembayaranModel =
    require("../models/pembayaranModel");

const peminjamanModel =
    require("../models/peminjamanModel");

const notificationModel =
    require("../models/notificationModel");


// ======================================================
// GET SEMUA PEMBAYARAN
// ======================================================

const getPembayaran = (
    req,
    res
) => {

    pembayaranModel.getAllPembayaran(
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error get pembayaran:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal mengambil data pembayaran",
                        error:
                            err.message
                    });

            }

            return res
                .status(200)
                .json({
                    success: true,
                    data:
                        result
                });

        }
    );

};


// ======================================================
// GET PEMBAYARAN BY ID
// ======================================================

const getPembayaranById = (
    req,
    res
) => {

    const id =
        req.params.id;

    if (
        !id ||
        isNaN(id)
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "ID pembayaran tidak valid"
            });

    }

    pembayaranModel.getPembayaranById(
        id,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error get pembayaran by id:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal mengambil pembayaran",
                        error:
                            err.message
                    });

            }

            if (
                !result ||
                result.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Pembayaran tidak ditemukan"
                    });

            }

            return res
                .status(200)
                .json({
                    success: true,
                    data:
                        result[0]
                });

        }
    );

};


// ======================================================
// GET PEMBAYARAN BERDASARKAN PEMINJAMAN
// ======================================================

const getPembayaranByPeminjaman = (
    req,
    res
) => {

    const idPeminjaman =
        req.params.idPeminjaman;

    if (
        !idPeminjaman ||
        isNaN(idPeminjaman)
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "ID peminjaman tidak valid"
            });

    }

    pembayaranModel.getPembayaranByPeminjaman(
        idPeminjaman,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error get pembayaran peminjaman:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal mengambil pembayaran",
                        error:
                            err.message
                    });

            }

            return res
                .status(200)
                .json({
                    success: true,
                    data:
                        result
                });

        }
    );

};


// ======================================================
// CREATE PEMBAYARAN
// ======================================================

const createPembayaran = (
    req,
    res
) => {

    const data =
        req.body || {};


    // ==================================================
    // VALIDASI ID PEMINJAMAN
    // ==================================================

    if (
        !data.id_peminjaman
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "ID peminjaman wajib diisi"
            });

    }


    // ==================================================
    // VALIDASI STATUS PEMBAYARAN
    // ==================================================

    const allowedStatusPembayaran = [
        "Belum Bayar",
        "Lunas"
    ];

    const statusPembayaran =
        data.status ||
        "Belum Bayar";

    if (
        !allowedStatusPembayaran.includes(
            statusPembayaran
        )
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "Status pembayaran tidak valid"
            });

    }


    // ==================================================
    // VALIDASI METODE PEMBAYARAN
    // ==================================================

    const allowedMetode = [
        "QRIS",
        "Transfer Bank",
        "Cash"
    ];

    const metode =
        data.metode ||
        null;

    if (
        !metode ||
        !allowedMetode.includes(
            metode
        )
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "Metode pembayaran tidak valid"
            });

    }


    // ==================================================
    // VALIDASI BUKTI PEMBAYARAN
    // ==================================================

    /*
        QRIS dan Transfer Bank
        wajib mengupload bukti.

        Cash
        tidak wajib bukti.
    */

    if (
        (
            metode === "QRIS" ||
            metode === "Transfer Bank"
        ) &&
        !req.file
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "Bukti pembayaran wajib diunggah untuk metode QRIS atau Transfer Bank."
            });

    }


    // ==================================================
    // PATH BUKTI PEMBAYARAN
    // ======================================================

    let bukti_bayar = null;

    if (req.file) {

        bukti_bayar =
            `/uploads/pembayaran/${req.file.filename}`;

    }


    // ==================================================
    // AMBIL PEMINJAMAN
    // ==================================================

    peminjamanModel.getPeminjamanById(
        data.id_peminjaman,
        (
            loanErr,
            loanResult
        ) => {

            if (loanErr) {

                console.error(
                    "Error cek peminjaman:",
                    loanErr
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal memeriksa peminjaman",
                        error:
                            loanErr.message
                    });

            }


            if (
                !loanResult ||
                loanResult.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Peminjaman tidak ditemukan"
                    });

            }


            const loan =
                loanResult[0];


            // ==========================================
            // STATUS PEMINJAMAN
            // ==========================================

            const allowedLoanStatus = [
                "Menunggu",
                "Disetujui",
                "Diproses"
            ];

            if (
                !allowedLoanStatus.includes(
                    loan.status
                )
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            `Pembayaran tidak dapat dibuat untuk peminjaman dengan status "${loan.status}"`
                    });

            }


            // ==========================================
            // CEK PEMBAYARAN LAMA
            // ==========================================

            pembayaranModel.checkExistingPembayaran(
                data.id_peminjaman,
                (
                    checkErr,
                    existing
                ) => {

                    if (checkErr) {

                        console.error(
                            "Error cek pembayaran:",
                            checkErr
                        );

                        return res
                            .status(500)
                            .json({
                                success: false,
                                message:
                                    "Gagal mengecek pembayaran",
                                error:
                                    checkErr.message
                            });

                    }


                    if (
                        existing &&
                        existing.length > 0
                    ) {

                        return res
                            .status(409)
                            .json({
                                success: false,
                                message:
                                    "Peminjaman ini sudah memiliki data pembayaran"
                            });

                    }


                    // ======================================
                    // DATA PEMBAYARAN
                    // ======================================

                    const paymentData = {

                        id_peminjaman:
                            Number(
                                data.id_peminjaman
                            ),

                        tanggal_bayar:
                            data.tanggal_bayar ||
                            null,

                        total:
                            Number(
                                data.total
                            ) || 0,

                        metode:
                            metode,

                        status:
                            statusPembayaran,

                        bukti_bayar:
                            bukti_bayar

                    };


                    // ======================================
                    // SIMPAN PEMBAYARAN
                    // ======================================

                    pembayaranModel.createPembayaran(
                        paymentData,
                        (
                            err,
                            result
                        ) => {

                            if (err) {

                                console.error(
                                    "Error create pembayaran:",
                                    err
                                );

                                return res
                                    .status(500)
                                    .json({
                                        success: false,
                                        message:
                                            "Gagal menambahkan pembayaran",
                                        error:
                                            err.message
                                    });

                            }


                            const idPembayaran =
                                result.insertId;


                            // ==================================
                            // NOTIFIKASI ADMIN
                            // ==================================

                            const pesanAdmin =
                                `Pembayaran baru untuk peminjaman #${data.id_peminjaman}. ` +
                                `Status pembayaran: ${statusPembayaran}.`;


                            /*
                                Tetap menggunakan fungsi
                                notifikasi yang ada di sistem kamu.
                            */

                            notificationModel.createNotificationForAdmins(
                                pesanAdmin,
                                (
                                    notificationError
                                ) => {

                                    if (
                                        notificationError
                                    ) {

                                        console.error(
                                            "Gagal membuat notifikasi admin pembayaran:",
                                            notificationError
                                        );

                                    }


                                    // ==================================
                                    // JIKA LUNAS
                                    // ==================================

                                    if (
                                        statusPembayaran ===
                                        "Lunas"
                                    ) {

                                        const pesanUser =
                                            `Pembayaran peminjaman #${data.id_peminjaman} ` +
                                            `telah tercatat sebagai Lunas.`;


                                        return notificationModel.createNotificationForUser(
                                            loan.id_user,
                                            pesanUser,
                                            (
                                                userNotificationError
                                            ) => {

                                                if (
                                                    userNotificationError
                                                ) {

                                                    console.error(
                                                        "Gagal membuat notifikasi pembayaran ke user:",
                                                        userNotificationError
                                                    );

                                                }


                                                return res
                                                    .status(201)
                                                    .json({
                                                        success: true,
                                                        message:
                                                            "Pembayaran berhasil ditambahkan",
                                                        id_pembayaran:
                                                            idPembayaran
                                                    });

                                            }
                                        );

                                    }


                                    return res
                                        .status(201)
                                        .json({
                                            success: true,
                                            message:
                                                "Pembayaran berhasil ditambahkan",
                                            id_pembayaran:
                                                idPembayaran
                                        });

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
// UPDATE PEMBAYARAN
// ======================================================

const updatePembayaran = (
    req,
    res
) => {

    const id =
        req.params.id;

    if (
        !id ||
        isNaN(id)
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "ID pembayaran tidak valid"
            });

    }


    const data =
        req.body || {};


    // ==================================================
    // VALIDASI METODE
    // ==================================================

    const allowedMetode = [
        "QRIS",
        "Transfer Bank",
        "Cash"
    ];

    const metode =
        data.metode ||
        null;

    if (
        !metode ||
        !allowedMetode.includes(
            metode
        )
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "Metode pembayaran tidak valid"
            });

    }


    // ==================================================
    // VALIDASI BUKTI
    // ==================================================

    if (
        (
            metode === "QRIS" ||
            metode === "Transfer Bank"
        ) &&
        !req.file &&
        !data.bukti_bayar
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "Bukti pembayaran wajib diunggah untuk metode QRIS atau Transfer Bank."
            });

    }


    // ==================================================
    // SIAPKAN DATA
    // ==================================================

    const updateData = {

        id_peminjaman:
            Number(
                data.id_peminjaman
            ),

        tanggal_bayar:
            data.tanggal_bayar ||
            null,

        total:
            Number(
                data.total
            ) || 0,

        metode:
            metode,

        status:
            data.status ||
            "Belum Bayar"

    };


    // Jika upload baru
    // gunakan file baru.

    if (req.file) {

        updateData.bukti_bayar =
            `/uploads/pembayaran/${req.file.filename}`;

    } else if (
        data.bukti_bayar
    ) {

        // Pertahankan bukti lama
        updateData.bukti_bayar =
            data.bukti_bayar;

    }


    // ==================================================
    // UPDATE DATABASE
    // ==================================================

    pembayaranModel.updatePembayaran(
        id,
        updateData,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error update pembayaran:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal memperbarui pembayaran",
                        error:
                            err.message
                    });

            }


            if (
                result.affectedRows ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Pembayaran tidak ditemukan"
                    });

            }


            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Pembayaran berhasil diperbarui"
                });

        }
    );

};


// ======================================================
// UPDATE STATUS PEMBAYARAN
// ======================================================

const updateStatusPembayaran = (
    req,
    res
) => {

    const id =
        req.params.id;

    const {
        status
    } =
        req.body;


    // ==================================================
    // VALIDASI STATUS
    // ==================================================

    const allowedStatus = [
        "Belum Bayar",
        "Lunas"
    ];

    if (
        !allowedStatus.includes(
            status
        )
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "Status pembayaran tidak valid"
            });

    }


    // ==================================================
    // AMBIL PEMBAYARAN
    // ==================================================

    pembayaranModel.getPembayaranById(
        id,
        (
            paymentErr,
            paymentResult
        ) => {

            if (paymentErr) {

                console.error(
                    "Error get pembayaran:",
                    paymentErr
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal mengambil pembayaran",
                        error:
                            paymentErr.message
                    });

            }


            if (
                !paymentResult ||
                paymentResult.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Pembayaran tidak ditemukan"
                    });

            }


            const payment =
                paymentResult[0];


            // ==========================================
            // AMBIL PEMINJAMAN
            // ==========================================

            peminjamanModel.getPeminjamanById(
                payment.id_peminjaman,
                (
                    loanErr,
                    loanResult
                ) => {

                    if (loanErr) {

                        console.error(
                            "Error get peminjaman pembayaran:",
                            loanErr
                        );

                        return res
                            .status(500)
                            .json({
                                success: false,
                                message:
                                    "Gagal mengambil data peminjaman",
                                error:
                                    loanErr.message
                            });

                    }


                    if (
                        !loanResult ||
                        loanResult.length === 0
                    ) {

                        return res
                            .status(404)
                            .json({
                                success: false,
                                message:
                                    "Peminjaman tidak ditemukan"
                            });

                    }


                    const loan =
                        loanResult[0];


                    // ==========================================
                    // UPDATE STATUS
                    // ==========================================

                    pembayaranModel.updateStatusPembayaran(
                        id,
                        status,
                        (
                            err,
                            result
                        ) => {

                            if (err) {

                                console.error(
                                    "Error update status pembayaran:",
                                    err
                                );

                                return res
                                    .status(500)
                                    .json({
                                        success: false,
                                        message:
                                            "Gagal mengubah status pembayaran",
                                        error:
                                            err.message
                                    });

                            }


                            if (
                                result.affectedRows ===
                                0
                            ) {

                                return res
                                    .status(404)
                                    .json({
                                        success: false,
                                        message:
                                            "Pembayaran tidak ditemukan"
                                    });

                            }


                            // ==================================
                            // NOTIFIKASI USER
                            // ==================================

                            const pesanUser =
                                `Status pembayaran untuk peminjaman #${payment.id_peminjaman} ` +
                                `telah diubah menjadi "${status}".`;


                            notificationModel.createNotificationForUser(
                                loan.id_user,
                                pesanUser,
                                (
                                    notificationError
                                ) => {

                                    if (
                                        notificationError
                                    ) {

                                        console.error(
                                            "Gagal membuat notifikasi status pembayaran:",
                                            notificationError
                                        );

                                    }


                                    return res
                                        .status(200)
                                        .json({
                                            success: true,
                                            message:
                                                "Status pembayaran berhasil diperbarui"
                                        });

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
// DELETE PEMBAYARAN
// ======================================================

const deletePembayaran = (
    req,
    res
) => {

    const id =
        req.params.id;


    pembayaranModel.deletePembayaran(
        id,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error delete pembayaran:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal menghapus pembayaran",
                        error:
                            err.message
                    });

            }


            if (
                result.affectedRows ===
                0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Pembayaran tidak ditemukan"
                    });

            }


            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Pembayaran berhasil dihapus"
                });

        }
    );

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getPembayaran,

    getPembayaranById,

    getPembayaranByPeminjaman,

    createPembayaran,

    updatePembayaran,

    updateStatusPembayaran,

    deletePembayaran

};