// ======================================================
// controllers/pembayaranDendaController.js
// ======================================================

const pembayaranDendaModel =
    require("../models/pembayaranDendaModel");

const dendaModel =
    require("../models/dendaModel");

const notificationModel =
    require("../models/notificationModel");

// ======================================================
// GET SEMUA PEMBAYARAN DENDA
// ======================================================

const getPembayaranDenda = (
    req,
    res
) => {

    pembayaranDendaModel.getAllPembayaranDenda(
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR GET PEMBAYARAN DENDA:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data pembayaran denda",
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
// GET PEMBAYARAN DENDA BY ID
// ======================================================

const getPembayaranDendaById = (
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
                "ID pembayaran denda tidak valid"
        });
    }

    pembayaranDendaModel.getPembayaranDendaById(
        id,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR GET PEMBAYARAN DENDA BY ID:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil pembayaran denda",
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
                        "Pembayaran denda tidak ditemukan"
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
// GET PEMBAYARAN DENDA BERDASARKAN ID DENDA
// ======================================================

const getPembayaranDendaByDenda = (
    req,
    res
) => {

    const idDenda =
        Number(
            req.params.idDenda
        );

    if (
        !idDenda ||
        isNaN(idDenda)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID denda tidak valid"
        });
    }

    pembayaranDendaModel.getPembayaranDendaByDenda(
        idDenda,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR GET PEMBAYARAN DENDA:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil pembayaran denda",
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
// CREATE PEMBAYARAN DENDA
// ======================================================

const createPembayaranDenda = (
    req,
    res
) => {

    const data =
        req.body || {};

    const idDenda =
        Number(data.id_denda);

    const jumlah =
        Number(data.jumlah);

    const metode =
        data.metode || null;

    // ==================================================
    // VALIDASI DASAR
    // ==================================================

    if (
        !idDenda ||
        isNaN(idDenda)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID denda wajib diisi"
        });
    }

    if (
        isNaN(jumlah) ||
        jumlah <= 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Jumlah pembayaran denda harus lebih dari 0"
        });
    }

    const allowedMetode = [
        "Cash",
        "Transfer",
        "QRIS"
    ];

    if (
        !allowedMetode.includes(metode)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Metode pembayaran denda tidak valid"
        });
    }

    // ==================================================
    // BUKTI PEMBAYARAN
    // ==================================================

    /*
        Transfer dan QRIS wajib memiliki bukti.
        Cash tidak wajib bukti.
    */

    if (
        (
            metode === "Transfer" ||
            metode === "QRIS"
        ) &&
        !req.file &&
        !data.bukti_bayar
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Bukti pembayaran wajib diunggah untuk Transfer atau QRIS."
        });
    }

    // ==================================================
    // PATH BUKTI
    // ==================================================

    let buktiBayar = null;

    if (req.file) {

        buktiBayar =
            `/uploads/pembayaran-denda/${req.file.filename}`;
    }

    // ==================================================
    // CEK DENDA
    // ==================================================

    dendaModel.getDendaById(
        idDenda,
        (
            dendaErr,
            dendaResult
        ) => {

            if (dendaErr) {

                console.error(
                    "ERROR CEK DENDA:",
                    dendaErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal memeriksa denda",
                    error:
                        dendaErr.message
                });
            }

            if (
                !dendaResult ||
                dendaResult.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Denda tidak ditemukan"
                });
            }

            const denda =
                dendaResult[0];

            // ==================================================
            // DENDA HARUS BELUM LUNAS
            // ==================================================

            if (
                denda.status === "Lunas"
            ) {

                return res.status(409).json({
                    success: false,
                    message:
                        "Denda ini sudah lunas"
                });
            }

            // ==================================================
            // JUMLAH HARUS SESUAI NOMINAL DENDA
            // ==================================================

            const nominalDenda =
                Number(
                    denda.nominal_denda
                );

            if (
                jumlah !== nominalDenda
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Jumlah pembayaran harus sesuai dengan nominal denda sebesar Rp${nominalDenda.toLocaleString("id-ID")}.`
                });
            }

            // ==================================================
            // CEK PEMBAYARAN DENDA SEBELUMNYA
            // ==================================================

            pembayaranDendaModel.checkExistingPembayaranDenda(
                idDenda,
                (
                    checkErr,
                    existing
                ) => {

                    if (checkErr) {

                        console.error(
                            "ERROR CEK PEMBAYARAN DENDA:",
                            checkErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal mengecek pembayaran denda",
                            error:
                                checkErr.message
                        });
                    }

                    if (
                        existing &&
                        existing.length > 0
                    ) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "Denda ini sudah memiliki data pembayaran"
                        });
                    }

                    // ==================================================
                    // DATA PEMBAYARAN
                    // ==================================================

                    const paymentData = {

                        id_denda:
                            idDenda,

                        tanggal_bayar:
                            data.tanggal_bayar ||
                            null,

                        jumlah:
                            jumlah,

                        metode:
                            metode,

                        bukti_bayar:
                            buktiBayar,

                        /*
                            Pembayaran dari pelanggan
                            belum dianggap lunas sebelum
                            diverifikasi petugas.
                        */
                        status:
                            "Menunggu Verifikasi",

                        keterangan:
                            data.keterangan ||
                            null
                    };

                    // ==================================================
                    // SIMPAN
                    // ==================================================

                    pembayaranDendaModel.createPembayaranDenda(
                        paymentData,
                        (
                            err,
                            result
                        ) => {

                            if (err) {

                                console.error(
                                    "ERROR CREATE PEMBAYARAN DENDA:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Gagal membuat pembayaran denda",
                                    error:
                                        err.message
                                });
                            }

                            const idPembayaranDenda =
                                result.insertId;

                            // ==================================================
                            // NOTIFIKASI ADMIN
                            // ==================================================

                            const pesanAdmin =
                                `Pembayaran denda baru untuk peminjaman #${denda.id_peminjaman}. ` +
                                `Nominal Rp${jumlah.toLocaleString("id-ID")} ` +
                                `menunggu verifikasi.`;

                            notificationModel.createNotificationForAdmins(
                                pesanAdmin,
                                (
                                    notificationError
                                ) => {

                                    if (
                                        notificationError
                                    ) {

                                        console.error(
                                            "ERROR NOTIFIKASI ADMIN PEMBAYARAN DENDA:",
                                            notificationError
                                        );
                                    }

                                    return res.status(201).json({
                                        success: true,
                                        message:
                                            "Pembayaran denda berhasil dikirim dan menunggu verifikasi",
                                        id_pembayaran_denda:
                                            idPembayaranDenda
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
// UPDATE PEMBAYARAN DENDA
// ======================================================

const updatePembayaranDenda = (
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
                "ID pembayaran denda tidak valid"
        });
    }

    pembayaranDendaModel.getPembayaranDendaById(
        id,
        (
            getErr,
            paymentResult
        ) => {

            if (getErr) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil pembayaran denda",
                    error:
                        getErr.message
                });
            }

            if (
                !paymentResult ||
                paymentResult.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Pembayaran denda tidak ditemukan"
                });
            }

            const payment =
                paymentResult[0];

            // ==================================================
            // PEMBAYARAN YANG SUDAH LUNAS TIDAK BOLEH DIUBAH
            // ==================================================

            if (
                payment.status === "Lunas"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Pembayaran denda yang sudah Lunas tidak dapat diubah."
                });
            }

            const data =
                req.body || {};

            const jumlah =
                Number(data.jumlah);

            const metode =
                data.metode || null;

            if (
                isNaN(jumlah) ||
                jumlah <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Jumlah pembayaran denda tidak valid"
                });
            }

            const allowedMetode = [
                "Cash",
                "Transfer",
                "QRIS"
            ];

            if (
                !allowedMetode.includes(metode)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Metode pembayaran denda tidak valid"
                });
            }

            if (
                jumlah !==
                Number(payment.nominal_denda)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Jumlah pembayaran harus sesuai dengan nominal denda"
                });
            }

            if (
                (
                    metode === "Transfer" ||
                    metode === "QRIS"
                ) &&
                !req.file &&
                !data.bukti_bayar
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Bukti pembayaran wajib diunggah untuk Transfer atau QRIS."
                });
            }

            let buktiBayar =
                data.bukti_bayar ||
                null;

            if (req.file) {

                buktiBayar =
                    `/uploads/pembayaran-denda/${req.file.filename}`;
            }

            const updateData = {

                tanggal_bayar:
                    data.tanggal_bayar ||
                    null,

                jumlah:
                    jumlah,

                metode:
                    metode,

                bukti_bayar:
                    buktiBayar,

                /*
                    Jika pembayaran diubah,
                    kembali ke proses verifikasi.
                */
                status:
                    "Menunggu Verifikasi",

                keterangan:
                    data.keterangan ||
                    null
            };

            pembayaranDendaModel.updatePembayaranDenda(
                id,
                updateData,
                (
                    err,
                    result
                ) => {

                    if (err) {

                        console.error(
                            "ERROR UPDATE PEMBAYARAN DENDA:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal memperbarui pembayaran denda",
                            error:
                                err.message
                        });
                    }

                    if (
                        result.affectedRows === 0
                    ) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "Pembayaran denda tidak ditemukan"
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message:
                            "Pembayaran denda berhasil diperbarui dan menunggu verifikasi"
                    });
                }
            );
        }
    );
};

// ======================================================
// UPDATE STATUS / VERIFIKASI PEMBAYARAN DENDA
// ======================================================

const updateStatusPembayaranDenda = (
    req,
    res
) => {

    const id =
        Number(req.params.id);

    const status =
        req.body?.status;

    const diverifikasiOleh =
        req.body?.diverifikasi_oleh
            ? Number(
                req.body.diverifikasi_oleh
            )
            : null;

    const keterangan =
        req.body?.keterangan ||
        null;

    if (
        !id ||
        isNaN(id)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID pembayaran denda tidak valid"
        });
    }

    // ==================================================
    // STATUS YANG DIPERBOLEHKAN
    // ==================================================

    if (
        ![
            "Belum Bayar",
            "Menunggu Verifikasi",
            "Lunas"
        ].includes(status)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Status pembayaran denda tidak valid"
        });
    }

    // ==================================================
    // AMBIL DATA PEMBAYARAN
    // ==================================================

    pembayaranDendaModel.getPembayaranDendaById(
        id,
        (
            paymentErr,
            paymentResult
        ) => {

            if (paymentErr) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil pembayaran denda",
                    error:
                        paymentErr.message
                });
            }

            if (
                !paymentResult ||
                paymentResult.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Pembayaran denda tidak ditemukan"
                });
            }

            const payment =
                paymentResult[0];

            // ==================================================
            // TRANSISI STATUS
            // ==================================================

            const transitions = {

                "Belum Bayar": [
                    "Menunggu Verifikasi"
                ],

                "Menunggu Verifikasi": [
                    "Lunas",
                    "Belum Bayar"
                ],

                "Lunas": []
            };

            if (
                payment.status === status
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Pembayaran denda sudah berstatus "${status}"`
                });
            }

            if (
                !transitions[
                    payment.status
                ]?.includes(status)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Perubahan status dari "${payment.status}" ke "${status}" tidak diperbolehkan`
                });
            }

            // ==================================================
            // JIKA MAU LUNAS
            // ==================================================

            if (
                status === "Lunas"
            ) {

                /*
                    Pembayaran harus benar-benar sesuai
                    dengan nominal denda.
                */

                if (
                    Number(payment.jumlah) !==
                    Number(payment.nominal_denda)
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Pembayaran belum sesuai dengan nominal denda"
                    });
                }

                if (
                    payment.status !==
                    "Menunggu Verifikasi"
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Pembayaran harus berstatus Menunggu Verifikasi sebelum diverifikasi Lunas"
                    });
                }
            }

            const tanggalVerifikasi =
                status === "Lunas"
                    ? new Date()
                    : null;

            // ==================================================
            // UPDATE PEMBAYARAN
            // ==================================================

            pembayaranDendaModel.updateStatusPembayaranDenda(
                id,
                status,
                diverifikasiOleh,
                tanggalVerifikasi,
                keterangan,
                (
                    err,
                    result
                ) => {

                    if (err) {

                        console.error(
                            "ERROR UPDATE STATUS PEMBAYARAN DENDA:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal mengubah status pembayaran denda",
                            error:
                                err.message
                        });
                    }

                    if (
                        result.affectedRows === 0
                    ) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "Pembayaran denda tidak ditemukan"
                        });
                    }

                    // ==================================================
                    // JIKA LUNAS → DENDA JUGA LUNAS
                    // ==================================================

                    if (
                        status === "Lunas"
                    ) {

                        dendaModel.updateStatusDenda(
                            payment.id_denda,
                            "Lunas",
                            diverifikasiOleh,
                            (
                                dendaErr
                            ) => {

                                if (dendaErr) {

                                    console.error(
                                        "ERROR UPDATE STATUS DENDA:",
                                        dendaErr
                                    );
                                }

                                // ==========================================
                                // NOTIFIKASI USER
                                // ==========================================

                                const pesanUser =
                                    `Pembayaran denda untuk peminjaman #${payment.id_peminjaman} ` +
                                    `telah diverifikasi dan dinyatakan Lunas.`;

                                notificationModel.createNotificationForUser(
                                    payment.id_user,
                                    pesanUser,
                                    (
                                        notificationError
                                    ) => {

                                        if (
                                            notificationError
                                        ) {

                                            console.error(
                                                "ERROR NOTIFIKASI USER DENDA:",
                                                notificationError
                                            );
                                        }

                                        return res.status(200).json({
                                            success: true,
                                            message:
                                                "Pembayaran denda berhasil diverifikasi dan denda dinyatakan Lunas"
                                        });
                                    }
                                );
                            }
                        );

                    } else {

                        return res.status(200).json({
                            success: true,
                            message:
                                "Status pembayaran denda berhasil diperbarui"
                        });
                    }
                }
            );
        }
    );
};

// ======================================================
// DELETE PEMBAYARAN DENDA
// ======================================================

const deletePembayaranDenda = (
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
                "ID pembayaran denda tidak valid"
        });
    }

    pembayaranDendaModel.deletePembayaranDenda(
        id,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "ERROR DELETE PEMBAYARAN DENDA:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal menghapus pembayaran denda",
                    error:
                        err.message
                });
            }

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Pembayaran denda tidak ditemukan"
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Pembayaran denda berhasil dihapus"
            });
        }
    );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getPembayaranDenda,

    getPembayaranDendaById,

    getPembayaranDendaByDenda,

    createPembayaranDenda,

    updatePembayaranDenda,

    updateStatusPembayaranDenda,

    deletePembayaranDenda

};