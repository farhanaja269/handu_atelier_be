// controllers/pembayaranController.js

const pembayaranModel =
    require("../models/pembayaranModel");

const peminjamanModel =
    require("../models/peminjamanModel");

const notificationModel =
    require("../models/notificationModel");


// ======================================================
// HELPER
// ======================================================

const roundMoney = (value) => {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
};


const isValidPositiveNumber = (value) => {
    return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !isNaN(value) &&
        Number(value) > 0
    );
};


// ======================================================
// VALIDASI NOMINAL PEMBAYARAN
// ======================================================
//
// Satu pembayaran untuk satu peminjaman.
// Nominal yang diperbolehkan:
// - 50% dari total_harga = DP
// - 100% dari total_harga = pembayaran penuh
//
// Status "Lunas" di sini berarti pembayaran yang dibuat
// sudah dibayar penuh sesuai nominal transaksi tersebut.
// Untuk DP, berarti DP 50%-nya sudah dibayar.
// ======================================================

const validatePaymentAmount = (
    totalPeminjaman,
    jumlahPembayaran
) => {

    const total =
        roundMoney(totalPeminjaman);

    const jumlah =
        roundMoney(jumlahPembayaran);

    if (
        !isValidPositiveNumber(total) ||
        !isValidPositiveNumber(jumlah)
    ) {

        return {
            valid: false,
            message:
                "Total peminjaman dan nominal pembayaran harus lebih dari 0."
        };

    }


    const nominalDP =
        roundMoney(total * 0.5);

    const nominalLunas =
        roundMoney(total);


    if (
        jumlah !== nominalDP &&
        jumlah !== nominalLunas
    ) {

        return {
            valid: false,
            message:
                `Nominal pembayaran hanya dapat berupa DP 50% sebesar Rp${nominalDP.toLocaleString("id-ID")} atau pembayaran penuh sebesar Rp${nominalLunas.toLocaleString("id-ID")}.`,
            nominalDP,
            nominalLunas
        };

    }


    return {
        valid: true,
        isDP: jumlah === nominalDP,
        isFull: jumlah === nominalLunas,
        nominalDP,
        nominalLunas
    };

};


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
        !data.id_peminjaman ||
        isNaN(data.id_peminjaman)
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "ID peminjaman wajib diisi dan harus valid."
            });

    }


    const idPeminjaman =
        Number(data.id_peminjaman);


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
        !allowedMetode.includes(metode)
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "Metode pembayaran tidak valid."
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
    // ==================================================

    let bukti_bayar =
        null;


    if (req.file) {

        bukti_bayar =
            `/uploads/pembayaran/${req.file.filename}`;

    }


    // ==================================================
    // AMBIL PEMINJAMAN
    // ==================================================

    peminjamanModel.getPeminjamanById(
        idPeminjaman,
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
                            `Pembayaran tidak dapat dibuat untuk peminjaman dengan status "${loan.status}".`
                    });

            }


            // ==========================================
            // VALIDASI TOTAL PEMINJAMAN
            // ==========================================

            const totalPeminjaman =
                Number(loan.total_harga);


            if (
                !isValidPositiveNumber(
                    totalPeminjaman
                )
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Total harga peminjaman tidak valid."
                    });

            }


            // ==========================================
            // VALIDASI NOMINAL
            // ==========================================

            if (
                !isValidPositiveNumber(
                    data.total
                )
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Nominal pembayaran wajib diisi dan harus lebih dari 0."
                    });

            }


            const totalPembayaran =
                roundMoney(data.total);


            const paymentValidation =
                validatePaymentAmount(
                    totalPeminjaman,
                    totalPembayaran
                );


            if (
                !paymentValidation.valid
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            paymentValidation.message
                    });

            }


            // ==========================================
            // CEK PEMBAYARAN LAMA
            // ==========================================

            pembayaranModel.checkExistingPembayaran(
                idPeminjaman,
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
                                    "Peminjaman ini sudah memiliki data pembayaran. Sistem menggunakan satu pembayaran per peminjaman."
                            });

                    }


                    // ======================================
                    // STATUS PEMBAYARAN
                    // ======================================
                    //
                    // Pembayaran yang dibuat dianggap
                    // selesai dibayar sesuai nominal transaksi.
                    //
                    // Jika nominal 50%:
                    //     DP 50% sudah dibayar.
                    //
                    // Jika nominal 100%:
                    //     pembayaran penuh sudah dibayar.
                    //
                    // ======================================

                    const statusPembayaran =
                        "Lunas";


                    // ======================================
                    // DATA PEMBAYARAN
                    // ======================================

                    const paymentData = {

                        id_peminjaman:
                            idPeminjaman,

                        tanggal_bayar:
                            data.tanggal_bayar ||
                            null,

                        total:
                            totalPembayaran,

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
                            // INFORMASI JENIS PEMBAYARAN
                            // ==================================

                            const jenisPembayaran =
                                paymentValidation.isDP
                                    ? "DP 50%"
                                    : "Pembayaran penuh 100%";


                            // ==================================
                            // NOTIFIKASI ADMIN
                            // ==================================

                            const pesanAdmin =
                                `Pembayaran baru untuk peminjaman #${idPeminjaman}. ` +
                                `Jenis pembayaran: ${jenisPembayaran}. ` +
                                `Nominal: Rp${totalPembayaran.toLocaleString("id-ID")}. ` +
                                `Status pembayaran: ${statusPembayaran}.`;


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
                                    // NOTIFIKASI USER
                                    // ==================================

                                    const pesanUser =
                                        `Pembayaran untuk peminjaman #${idPeminjaman} ` +
                                        `sebesar Rp${totalPembayaran.toLocaleString("id-ID")} ` +
                                        `(${jenisPembayaran}) telah tercatat sebagai Lunas.`;


                                    notificationModel.createNotificationForUser(
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
                                                        idPembayaran,
                                                    jenis_pembayaran:
                                                        jenisPembayaran,
                                                    total:
                                                        totalPembayaran,
                                                    status:
                                                        statusPembayaran
                                                });

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
    // AMBIL PEMBAYARAN LAMA
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
                            "Gagal mengambil data pembayaran",
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


            const oldPayment =
                paymentResult[0];


            // ==========================================
            // VALIDASI METODE
            // ==========================================

            const allowedMetode = [
                "QRIS",
                "Transfer Bank",
                "Cash"
            ];


            const metode =
                data.metode ||
                oldPayment.metode ||
                null;


            if (
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


            // ==========================================
            // AMBIL PEMINJAMAN
            // ==========================================

            peminjamanModel.getPeminjamanById(
                oldPayment.id_peminjaman,
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
                    // NOMINAL PEMBAYARAN
                    // ==========================================

                    const totalPeminjaman =
                        Number(
                            loan.total_harga
                        );


                    const totalPembayaran =
                        data.total !== undefined &&
                        data.total !== null &&
                        data.total !== ""
                            ? roundMoney(data.total)
                            : roundMoney(
                                oldPayment.total
                            );


                    const paymentValidation =
                        validatePaymentAmount(
                            totalPeminjaman,
                            totalPembayaran
                        );


                    if (
                        !paymentValidation.valid
                    ) {

                        return res
                            .status(400)
                            .json({
                                success: false,
                                message:
                                    paymentValidation.message
                            });

                    }


                    // ==========================================
                    // VALIDASI BUKTI
                    // ==========================================

                    if (
                        (
                            metode === "QRIS" ||
                            metode === "Transfer Bank"
                        ) &&
                        !req.file &&
                        !oldPayment.bukti_bayar &&
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


                    // ==========================================
                    // STATUS
                    // ==========================================
                    //
                    // Tidak menerima status pembayaran dari
                    // frontend secara bebas.
                    //
                    // Pembayaran yang nominalnya valid dianggap
                    // sudah dibayar sesuai transaksi tersebut.
                    // ==========================================

                    const statusPembayaran =
                        "Lunas";


                    // ==========================================
                    // SIAPKAN DATA
                    // ==========================================

                    const updateData = {

                        id_peminjaman:
                            oldPayment.id_peminjaman,

                        tanggal_bayar:
                            data.tanggal_bayar ||
                            oldPayment.tanggal_bayar ||
                            null,

                        total:
                            totalPembayaran,

                        metode:
                            metode,

                        status:
                            statusPembayaran

                    };


                    // ==========================================
                    // BUKTI PEMBAYARAN
                    // ==========================================

                    if (req.file) {

                        updateData.bukti_bayar =
                            `/uploads/pembayaran/${req.file.filename}`;

                    } else if (
                        data.bukti_bayar
                    ) {

                        updateData.bukti_bayar =
                            data.bukti_bayar;

                    } else {

                        updateData.bukti_bayar =
                            oldPayment.bukti_bayar ||
                            null;

                    }


                    // ==========================================
                    // UPDATE DATABASE
                    // ==========================================

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


                            const jenisPembayaran =
                                paymentValidation.isDP
                                    ? "DP 50%"
                                    : "Pembayaran penuh 100%";


                            return res
                                .status(200)
                                .json({
                                    success: true,
                                    message:
                                        "Pembayaran berhasil diperbarui",
                                    jenis_pembayaran:
                                        jenisPembayaran,
                                    total:
                                        totalPembayaran,
                                    status:
                                        statusPembayaran
                                });

                        }
                    );

                }
            );

        }
    );

};


// ======================================================
// UPDATE STATUS PEMBAYARAN
// ======================================================
//
// Status hanya boleh:
// - Belum Bayar
// - Lunas
//
// Untuk menjaga konsistensi dengan sistem refund,
// pembayaran yang sudah tercatat sebagai Lunas dapat
// digunakan sebagai dasar pengembalian dana.
//
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
        req.body || {};


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
                    // VALIDASI NOMINAL
                    // ==========================================

                    const validation =
                        validatePaymentAmount(
                            Number(loan.total_harga),
                            Number(payment.total)
                        );


                    if (
                        !validation.valid
                    ) {

                        return res
                            .status(400)
                            .json({
                                success: false,
                                message:
                                    "Nominal pembayaran yang tersimpan tidak sesuai dengan aturan DP 50% atau pembayaran penuh 100%."
                            });

                    }


                    // ==========================================
                    // CEGAH PEMBAYARAN DIBALIK KE BELUM BAYAR
                    // JIKA SUDAH ADA REFUND
                    // ==========================================

                    if (
                        status === "Belum Bayar" &&
                        payment.status === "Lunas"
                    ) {

                        /*
                            Untuk menjaga konsistensi sistem,
                            status Lunas tidak boleh sembarang
                            dikembalikan menjadi Belum Bayar.

                            Jika memang ada kesalahan pembayaran,
                            perubahan harus dilakukan melalui
                            proses administrasi pembayaran/refund.
                        */

                        return res
                            .status(400)
                            .json({
                                success: false,
                                message:
                                    "Pembayaran yang sudah Lunas tidak dapat diubah kembali menjadi Belum Bayar melalui endpoint ini."
                            });

                    }


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
                    "Error get pembayaran sebelum delete:",
                    paymentErr
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal mengambil data pembayaran",
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


            // ==================================================
            // PEMBAYARAN YANG SUDAH LUNAS TIDAK BOLEH DIHAPUS
            // SEMBARANGAN
            // ==================================================

            if (
                payment.status ===
                "Lunas"
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Pembayaran yang sudah Lunas tidak dapat dihapus."
                    });

            }


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