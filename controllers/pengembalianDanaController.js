// ======================================================
// controllers/pengembalianDanaController.js
// ======================================================

const pengembalianDanaModel =
    require("../models/pengembalianDanaModel");

const notificationModel =
    require("../models/notificationModel");


// ======================================================
// GET SEMUA PENGEMBALIAN DANA
// ======================================================

const getPengembalianDana = (
    req,
    res
) => {

    pengembalianDanaModel.getAllPengembalianDana(
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR GET PENGEMBALIAN DANA:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data pengembalian dana",
                    error:
                        err.message
                });
            }

            return res.status(200).json({
                success: true,
                data: result
            });
        }
    );
};


// ======================================================
// GET PENGEMBALIAN DANA BERDASARKAN ID
// ======================================================

const getPengembalianDanaById = (
    req,
    res
) => {

    const id =
        Number(req.params.id);

    if (
        !id ||
        isNaN(id)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID pengembalian dana tidak valid"
        });
    }


    pengembalianDanaModel.getPengembalianDanaById(
        id,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR GET PENGEMBALIAN DANA BY ID:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil pengembalian dana",
                    error:
                        err.message
                });
            }


            if (
                !result ||
                result.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Pengembalian dana tidak ditemukan"
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
// GET PENGEMBALIAN DANA BERDASARKAN PEMINJAMAN
// ======================================================

const getPengembalianDanaByPeminjaman = (
    req,
    res
) => {

    const idPeminjaman =
        Number(
            req.params.idPeminjaman
        );

    if (
        !idPeminjaman ||
        isNaN(idPeminjaman)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman tidak valid"
        });
    }


    pengembalianDanaModel
        .getPengembalianDanaByPeminjaman(
            idPeminjaman,
            (err, result) => {

                if (err) {

                    console.error(
                        "ERROR GET PENGEMBALIAN DANA BY PEMINJAMAN:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Gagal mengambil pengembalian dana",
                        error:
                            err.message
                    });
                }


                return res.status(200).json({
                    success: true,
                    data: result
                });
            }
        );
};


// ======================================================
// CREATE PENGEMBALIAN DANA
// ======================================================
// Digunakan ketika peminjaman berstatus Ditolak.
//
// Alur:
// 1. Cari pembayaran peminjaman.
// 2. Pastikan pembayaran sudah Lunas.
// 3. Ambil nominal dari pembayaran.total.
// 4. Cek apakah refund sudah pernah dibuat.
// 5. Pastikan peminjaman berstatus Ditolak.
// 6. Buat refund sebesar jumlah yang benar-benar dibayar.
// 7. Kirim notifikasi kepada user.
// ======================================================

const createPengembalianDana = (
    req,
    res
) => {

    const data =
        req.body || {};

    const idPeminjaman =
        Number(
            data.id_peminjaman
        );


    // ==================================================
    // VALIDASI ID PEMINJAMAN
    // ==================================================

    if (
        !idPeminjaman ||
        isNaN(idPeminjaman)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman wajib diisi"
        });
    }


    // ==================================================
    // CARI PEMBAYARAN PEMINJAMAN
    // ==================================================

    pengembalianDanaModel
        .getPembayaranUntukRefund(
            idPeminjaman,
            (
                paymentErr,
                paymentResult
            ) => {

                if (paymentErr) {

                    console.error(
                        "ERROR CEK PEMBAYARAN REFUND:",
                        paymentErr
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Gagal memeriksa pembayaran peminjaman",
                        error:
                            paymentErr.message
                    });
                }


                // ==========================================
                // TIDAK ADA PEMBAYARAN
                // ==========================================

                if (
                    !paymentResult ||
                    paymentResult.length === 0
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Peminjaman ini belum memiliki pembayaran sehingga tidak ada dana yang perlu dikembalikan."
                    });
                }


                const payment =
                    paymentResult[0];


                // ==========================================
                // PEMBAYARAN HARUS SUDAH LUNAS
                // ==========================================

                if (
                    payment.status !==
                    "Lunas"
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Dana hanya dapat dikembalikan dari pembayaran yang berstatus Lunas."
                    });
                }


                // ==========================================
                // JUMLAH PEMBAYARAN
                // ==========================================

                const jumlahDibayar =
                    Number(
                        payment.jumlah
                    );


                if (
                    isNaN(jumlahDibayar) ||
                    jumlahDibayar <= 0
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Jumlah pembayaran tidak valid."
                    });
                }


                // ==========================================
                // CEK REFUND YANG SUDAH ADA
                // ==========================================

                pengembalianDanaModel
                    .checkExistingPengembalianDana(
                        payment.id_pembayaran,
                        (
                            checkErr,
                            existing
                        ) => {

                            if (checkErr) {

                                console.error(
                                    "ERROR CEK REFUND EXISTING:",
                                    checkErr
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Gagal mengecek data pengembalian dana",
                                    error:
                                        checkErr.message
                                });
                            }


                            // ==================================
                            // SUDAH ADA REFUND
                            // ==================================

                            if (
                                existing &&
                                existing.length > 0
                            ) {

                                return res.status(409).json({
                                    success: false,
                                    message:
                                        "Pembayaran ini sudah memiliki data pengembalian dana."
                                });
                            }


                            // ==================================
                            // CEK STATUS PEMINJAMAN
                            // ==================================

                            if (
                                payment.status_peminjaman !==
                                "Ditolak"
                            ) {

                                return res.status(400).json({
                                    success: false,
                                    message:
                                        "Pengembalian dana hanya dapat dibuat untuk peminjaman yang berstatus Ditolak."
                                });
                            }


                            // ==================================
                            // DATA REFUND
                            // ==================================

                            const refundData = {

                                id_peminjaman:
                                    payment.id_peminjaman,

                                id_pembayaran:
                                    payment.id_pembayaran,

                                // Refund seluruh uang yang
                                // benar-benar telah dibayarkan.
                                jumlah_dana:
                                    jumlahDibayar,

                                alasan:
                                    data.alasan ||
                                    "Pengembalian dana karena peminjaman ditolak.",

                                metode_pengembalian:
                                    data.metode_pengembalian ||
                                    payment.metode ||
                                    "Transfer Bank",

                                // Status awal refund.
                                status:
                                    "Menunggu Pengembalian",

                                bukti_pengembalian:
                                    null,

                                diproses_oleh:
                                    null,

                                keterangan:
                                    data.keterangan ||
                                    null
                            };


                            // ==================================
                            // SIMPAN REFUND
                            // ==================================

                            pengembalianDanaModel
                                .createPengembalianDana(
                                    refundData,
                                    (
                                        err,
                                        result
                                    ) => {

                                        if (err) {

                                            console.error(
                                                "ERROR CREATE PENGEMBALIAN DANA:",
                                                err
                                            );

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Gagal membuat pengembalian dana",
                                                error:
                                                    err.message
                                            });
                                        }


                                        const idRefund =
                                            result.insertId;


                                        // ==================================
                                        // NOTIFIKASI USER
                                        // ==================================

                                        const pesanUser =
                                            `Peminjaman #${payment.id_peminjaman} ditolak. ` +
                                            `Dana sebesar Rp${jumlahDibayar.toLocaleString("id-ID")} ` +
                                            `telah masuk ke dalam proses pengembalian dana.`;


                                        notificationModel
                                            .createNotificationForUser(
                                                payment.id_user,
                                                pesanUser,
                                                (
                                                    notificationError
                                                ) => {

                                                    if (
                                                        notificationError
                                                    ) {

                                                        console.error(
                                                            "ERROR NOTIFIKASI REFUND USER:",
                                                            notificationError
                                                        );
                                                    }


                                                    return res.status(201).json({
                                                        success: true,
                                                        message:
                                                            "Pengembalian dana berhasil dibuat.",
                                                        id_pengembalian_dana:
                                                            idRefund,
                                                        jumlah_dana:
                                                            jumlahDibayar,
                                                        status:
                                                            "Menunggu Pengembalian"
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
// UPDATE DATA PENGEMBALIAN DANA
// ======================================================
// Data yang boleh diubah:
// - alasan
// - metode_pengembalian
// - bukti_pengembalian
// - keterangan
//
// Nominal refund harus tetap sama dengan pembayaran
// yang sebenarnya dilakukan pelanggan.
// Status tidak diubah melalui endpoint ini.
// ======================================================

const updatePengembalianDana = (
    req,
    res
) => {

    const id =
        Number(req.params.id);


    if (
        !id ||
        isNaN(id)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID pengembalian dana tidak valid"
        });
    }


    // ==========================================
    // AMBIL DATA REFUND
    // ==========================================

    pengembalianDanaModel.getPengembalianDanaById(
        id,
        (
            getErr,
            result
        ) => {

            if (getErr) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data pengembalian dana",
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
                        "Pengembalian dana tidak ditemukan"
                });
            }


            const refund =
                result[0];


            // ==========================================
            // REFUND BERHASIL TIDAK BOLEH DIUBAH
            // ==========================================

            if (
                refund.status ===
                "Berhasil"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Pengembalian dana yang sudah Berhasil tidak dapat diubah."
                });
            }


            // ==========================================
            // DATA REQUEST
            // ==========================================

            const data =
                req.body || {};


            // ==========================================
            // JUMLAH REFUND
            // ==========================================

            const jumlahDana =
                Number(
                    data.jumlah_dana
                );


            if (
                isNaN(jumlahDana) ||
                jumlahDana <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Jumlah dana pengembalian tidak valid."
                });
            }


            // ==========================================
            // JUMLAH HARUS SESUAI PEMBAYARAN
            // ==========================================

            const jumlahDibayar =
                Number(
                    refund.jumlah_dibayar
                );


            if (
                isNaN(jumlahDibayar) ||
                jumlahDibayar <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Jumlah pembayaran tidak valid."
                });
            }


            if (
                jumlahDana !==
                jumlahDibayar
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Jumlah pengembalian dana harus sama dengan jumlah yang telah dibayarkan pelanggan."
                });
            }


            // ==========================================
            // VALIDASI METODE
            // ==========================================

            const allowedMetode = [
                "Transfer Bank",
                "QRIS",
                "Cash"
            ];


            const metodePengembalian =
                data.metode_pengembalian ||
                refund.metode_pengembalian;


            if (
                !allowedMetode.includes(
                    metodePengembalian
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Metode pengembalian dana tidak valid."
                });
            }


            // ==========================================
            // DATA UPDATE
            // ==========================================

            const updateData = {

                jumlah_dana:
                    jumlahDana,

                alasan:
                    data.alasan ||
                    refund.alasan,

                metode_pengembalian:
                    metodePengembalian,

                bukti_pengembalian:
                    data.bukti_pengembalian ||
                    null,

                keterangan:
                    data.keterangan ||
                    null
            };


            // ==========================================
            // UPDATE
            // ==========================================

            pengembalianDanaModel
                .updatePengembalianDana(
                    id,
                    updateData,
                    (
                        err,
                        updateResult
                    ) => {

                        if (err) {

                            console.error(
                                "ERROR UPDATE PENGEMBALIAN DANA:",
                                err
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Gagal memperbarui pengembalian dana",
                                error:
                                    err.message
                            });
                        }


                        if (
                            updateResult.affectedRows === 0
                        ) {

                            return res.status(404).json({
                                success: false,
                                message:
                                    "Pengembalian dana tidak ditemukan"
                            });
                        }


                        return res.status(200).json({
                            success: true,
                            message:
                                "Pengembalian dana berhasil diperbarui"
                        });
                    }
                );
        }
    );
};


// ======================================================
// UPDATE STATUS PENGEMBALIAN DANA
// ======================================================
//
// Alur status:
//
// Menunggu Pengembalian
//          ↓
//       Diproses
//        ↓     ↓
//   Berhasil  Gagal
//              ↓
//   Menunggu Pengembalian
//
// Status Berhasil bersifat final.
// ======================================================

const updateStatusPengembalianDana = (
    req,
    res
) => {

    const id =
        Number(req.params.id);

    const status =
        req.body?.status;

    const diprosesOleh =
        req.body?.diproses_oleh
            ? Number(
                req.body.diproses_oleh
            )
            : null;

    const buktiPengembalian =
        req.body?.bukti_pengembalian ||
        null;

    const keterangan =
        req.body?.keterangan ||
        null;


    // ==================================================
    // VALIDASI ID
    // ==================================================

    if (
        !id ||
        isNaN(id)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID pengembalian dana tidak valid"
        });
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
        !allowedStatus.includes(status)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Status pengembalian dana tidak valid"
        });
    }


    // ==================================================
    // AMBIL DATA REFUND
    // ==================================================

    pengembalianDanaModel
        .getPengembalianDanaById(
            id,
            (
                getErr,
                result
            ) => {

                if (getErr) {

                    return res.status(500).json({
                        success: false,
                        message:
                            "Gagal mengambil data pengembalian dana",
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
                            "Pengembalian dana tidak ditemukan"
                    });
                }


                const refund =
                    result[0];


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


                // ==================================================
                // STATUS SAMA
                // ==================================================

                if (
                    refund.status ===
                    status
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            `Pengembalian dana sudah berstatus "${status}"`
                    });
                }


                // ==================================================
                // CEK TRANSISI
                // ==================================================

                if (
                    !transitions[
                        refund.status
                    ]?.includes(status)
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            `Perubahan status dari "${refund.status}" ke "${status}" tidak diperbolehkan`
                    });
                }


                // ==================================================
                // DIPROSES HARUS ADA PETUGAS
                // ==================================================

                if (
                    status === "Diproses" &&
                    !diprosesOleh
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Petugas yang memproses pengembalian dana wajib diisi."
                    });
                }


                // ==================================================
                // BERHASIL HARUS ADA BUKTI
                // ==================================================

                if (
                    status === "Berhasil" &&
                    !(
                        buktiPengembalian ||
                        refund.bukti_pengembalian
                    )
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Bukti pengembalian dana wajib diisi sebelum status menjadi Berhasil."
                    });
                }


                // ==================================================
                // TANGGAL PENGEMBALIAN
                // ==================================================

                const tanggalPengembalian =
                    status === "Berhasil"
                        ? new Date()
                        : null;


                // ==================================================
                // UPDATE STATUS
                // ==================================================

                pengembalianDanaModel
                    .updateStatusPengembalianDana(
                        id,
                        status,
                        diprosesOleh,
                        tanggalPengembalian,
                        buktiPengembalian,
                        keterangan,
                        (
                            err,
                            updateResult
                        ) => {

                            if (err) {

                                console.error(
                                    "ERROR UPDATE STATUS PENGEMBALIAN DANA:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Gagal mengubah status pengembalian dana",
                                    error:
                                        err.message
                                });
                            }


                            if (
                                updateResult.affectedRows === 0
                            ) {

                                return res.status(404).json({
                                    success: false,
                                    message:
                                        "Pengembalian dana tidak ditemukan"
                                });
                            }


                            // ==================================================
                            // NOTIFIKASI USER
                            // ==================================================

                            let pesanUser;


                            if (
                                status ===
                                "Diproses"
                            ) {

                                pesanUser =
                                    `Pengembalian dana untuk peminjaman #${refund.id_peminjaman} ` +
                                    `sedang diproses.`;

                            } else if (
                                status ===
                                "Berhasil"
                            ) {

                                pesanUser =
                                    `Pengembalian dana untuk peminjaman #${refund.id_peminjaman} ` +
                                    `sebesar Rp${Number(refund.jumlah_dana).toLocaleString("id-ID")} ` +
                                    `telah berhasil diproses.`;

                            } else if (
                                status ===
                                "Gagal"
                            ) {

                                pesanUser =
                                    `Pengembalian dana untuk peminjaman #${refund.id_peminjaman} ` +
                                    `gagal diproses. Silakan menunggu informasi berikutnya.`;

                            } else {

                                pesanUser =
                                    `Status pengembalian dana untuk peminjaman #${refund.id_peminjaman} ` +
                                    `telah diperbarui menjadi "${status}".`;
                            }


                            notificationModel
                                .createNotificationForUser(
                                    refund.id_user,
                                    pesanUser,
                                    (
                                        notificationError
                                    ) => {

                                        if (
                                            notificationError
                                        ) {

                                            console.error(
                                                "ERROR NOTIFIKASI STATUS REFUND:",
                                                notificationError
                                            );
                                        }


                                        return res.status(200).json({
                                            success: true,
                                            message:
                                                `Status pengembalian dana berhasil diubah menjadi "${status}"`
                                        });
                                    }
                                );
                        }
                    );
            }
        );
};


// ======================================================
// DELETE PENGEMBALIAN DANA
// ======================================================
//
// Refund yang sudah Berhasil tidak boleh dihapus.
// ======================================================

const deletePengembalianDana = (
    req,
    res
) => {

    const id =
        Number(req.params.id);


    if (
        !id ||
        isNaN(id)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID pengembalian dana tidak valid"
        });
    }


    pengembalianDanaModel
        .getPengembalianDanaById(
            id,
            (
                getErr,
                result
            ) => {

                if (getErr) {

                    return res.status(500).json({
                        success: false,
                        message:
                            "Gagal mengambil data pengembalian dana",
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
                            "Pengembalian dana tidak ditemukan"
                    });
                }


                const refund =
                    result[0];


                // ==========================================
                // REFUND BERHASIL TIDAK BOLEH DIHAPUS
                // ==========================================

                if (
                    refund.status ===
                    "Berhasil"
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Pengembalian dana yang sudah Berhasil tidak dapat dihapus."
                    });
                }


                // ==========================================
                // DELETE
                // ==========================================

                pengembalianDanaModel
                    .deletePengembalianDana(
                        id,
                        (
                            err,
                            deleteResult
                        ) => {

                            if (err) {

                                console.error(
                                    "ERROR DELETE PENGEMBALIAN DANA:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Gagal menghapus pengembalian dana",
                                    error:
                                        err.message
                                });
                            }


                            if (
                                deleteResult.affectedRows === 0
                            ) {

                                return res.status(404).json({
                                    success: false,
                                    message:
                                        "Pengembalian dana tidak ditemukan"
                                });
                            }


                            return res.status(200).json({
                                success: true,
                                message:
                                    "Pengembalian dana berhasil dihapus"
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

    getPengembalianDana,

    getPengembalianDanaById,

    getPengembalianDanaByPeminjaman,

    createPengembalianDana,

    updatePengembalianDana,

    updateStatusPengembalianDana,

    deletePengembalianDana

};