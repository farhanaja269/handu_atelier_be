// ======================================================
// controllers/pengembalianController.js
// ======================================================

const pengembalianModel =
    require("../models/pengembalianModel");

const peminjamanModel =
    require("../models/peminjamanModel");

const notificationModel =
    require("../models/notificationModel");

// ======================================================
// GET SEMUA PENGEMBALIAN
// ======================================================

const getPengembalian = (
    req,
    res
) => {

    pengembalianModel.getAllPengembalian(
        (err, result) => {

            if (err) {
                console.error(
                    "ERROR GET PENGEMBALIAN:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data pengembalian",
                    error:
                        err.message,
                });
            }

            return res.status(200).json({
                success: true,
                data: result,
            });
        }
    );
};

// ======================================================
// GET PEMINJAMAN YANG BELUM DIKEMBALIKAN
// ======================================================

const getPeminjamanBelumDikembalikan = (
    req,
    res
) => {

    pengembalianModel.getPeminjamanBelumDikembalikan(
        (err, result) => {

            if (err) {
                console.error(
                    "ERROR GET PEMINJAMAN BELUM DIKEMBALIKAN:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil daftar peminjaman",
                    error:
                        err.message,
                });
            }

            return res.status(200).json({
                success: true,
                data: result,
            });
        }
    );
};

// ======================================================
// GET PENGEMBALIAN BY ID
// ======================================================

const getPengembalianById = (
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
                "ID pengembalian tidak valid",
        });
    }

    pengembalianModel.getPengembalianById(
        id,
        (err, result) => {

            if (err) {
                console.error(
                    "ERROR GET DETAIL PENGEMBALIAN:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil detail pengembalian",
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
                        "Data pengembalian tidak ditemukan",
                });
            }

            return res.status(200).json({
                success: true,
                data: result[0],
            });
        }
    );
};

// ======================================================
// CREATE PENGEMBALIAN
// ======================================================

const createPengembalian = (
    req,
    res
) => {

    const data =
        req.body || {};

    const idPeminjaman =
        Number(data.id_peminjaman);

    // ==================================================
    // VALIDASI ID
    // ==================================================

    if (
        !idPeminjaman ||
        isNaN(idPeminjaman)
    ) {
        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman wajib diisi dan harus valid",
        });
    }

    // ==================================================
    // VALIDASI TANGGAL
    // ==================================================

    if (
        !data.tanggal_pengembalian
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Tanggal pengembalian wajib diisi",
        });
    }

    // ==================================================
    // VALIDASI KONDISI
    // ==================================================

    if (
        !data.kondisi_baju
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Kondisi baju wajib dipilih",
        });
    }

    // ==================================================
    // VALIDASI DENDA
    // ==================================================

    const denda =
        Number(data.denda) || 0;

    if (
        denda < 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Denda tidak boleh bernilai negatif",
        });
    }

    // ==================================================
    // AMBIL DATA PEMINJAMAN
    // ==================================================

    peminjamanModel.getPeminjamanById(
        idPeminjaman,
        (
            loanErr,
            loanResult
        ) => {

            if (loanErr) {
                console.error(
                    "ERROR GET PEMINJAMAN PENGEMBALIAN:",
                    loanErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data peminjaman",
                    error:
                        loanErr.message,
                });
            }

            if (
                !loanResult ||
                loanResult.length === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Peminjaman tidak ditemukan",
                });
            }

            const loan =
                loanResult[0];

            // ==================================================
            // STATUS HARUS DIPROSES
            // ==================================================

            if (
                loan.status !==
                "Diproses"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Peminjaman tidak dapat dikembalikan karena status saat ini adalah "${loan.status}".`,
                });
            }

            // ==================================================
            // CEK DUPLIKAT
            // ==================================================

            pengembalianModel.checkExistingPengembalian(
                idPeminjaman,
                (
                    checkErr,
                    existing
                ) => {

                    if (checkErr) {
                        console.error(
                            "ERROR CEK PENGEMBALIAN:",
                            checkErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal memeriksa data pengembalian",
                            error:
                                checkErr.message,
                        });
                    }

                    if (
                        existing &&
                        existing.length > 0
                    ) {
                        return res.status(409).json({
                            success: false,
                            message:
                                "Peminjaman ini sudah memiliki data pengembalian",
                        });
                    }

                    // ==================================================
                    // DATA UNTUK MODEL
                    // ==================================================

                    const pengembalianData = {
                        id_peminjaman:
                            idPeminjaman,

                        tanggal_pengembalian:
                            data.tanggal_pengembalian,

                        kondisi_baju:
                            data.kondisi_baju,

                        denda,

                        keterangan:
                            data.keterangan ||
                            null,

                        diterima_oleh:
                            data.diterima_oleh ||
                            null,
                    };

                    // ==================================================
                    // CREATE
                    // ==================================================

                    pengembalianModel.createPengembalian(
                        pengembalianData,
                        (
                            err,
                            result
                        ) => {

                            if (err) {
                                console.error(
                                    "ERROR CREATE PENGEMBALIAN:",
                                    err
                                );

                                let statusCode =
                                    500;

                                if (
                                    err.message &&
                                    (
                                        err.message.includes(
                                            "sudah memiliki"
                                        )
                                    )
                                ) {
                                    statusCode =
                                        409;
                                }

                                if (
                                    err.message &&
                                    err.message.includes(
                                        "status saat ini"
                                    )
                                ) {
                                    statusCode =
                                        400;
                                }

                                return res.status(
                                    statusCode
                                ).json({
                                    success: false,
                                    message:
                                        err.message ||
                                        "Gagal menambahkan pengembalian",
                                    error:
                                        err.message,
                                });
                            }

                            const idPengembalian =
                                result.insertId;

                            // ==================================================
                            // NOTIFIKASI ADMIN
                            // ==================================================

                            const pesanAdmin =
                                `Pengembalian baru untuk peminjaman #${idPeminjaman}. ` +
                                `Kondisi: ${data.kondisi_baju}.`;

                            notificationModel.createNotificationForAdmins(
                                pesanAdmin,
                                (
                                    adminNotificationError
                                ) => {

                                    if (
                                        adminNotificationError
                                    ) {
                                        console.error(
                                            "Gagal membuat notifikasi admin pengembalian:",
                                            adminNotificationError
                                        );
                                    }

                                    // ==================================================
                                    // NOTIFIKASI USER
                                    // ==================================================

                                    const pesanUser =
                                        `Pengembalian untuk peminjaman #${idPeminjaman} ` +
                                        `telah dicatat. Kondisi: ${data.kondisi_baju}.`;

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
                                                    "Gagal membuat notifikasi user pengembalian:",
                                                    userNotificationError
                                                );
                                            }

                                            return res.status(201).json({
                                                success: true,
                                                message:
                                                    "Pengembalian berhasil ditambahkan",
                                                id_pengembalian:
                                                    idPengembalian,
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
// UPDATE PENGEMBALIAN
// ======================================================

const updatePengembalian = (
    req,
    res
) => {

    const id =
        Number(req.params.id);

    const data =
        req.body || {};

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
                "ID pengembalian tidak valid",
        });
    }

    // ==================================================
    // VALIDASI TANGGAL
    // ==================================================

    if (
        !data.tanggal_pengembalian
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Tanggal pengembalian wajib diisi",
        });
    }

    // ==================================================
    // VALIDASI KONDISI
    // ==================================================

    if (
        !data.kondisi_baju
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Kondisi baju wajib dipilih",
        });
    }

    // ==================================================
    // VALIDASI DENDA
    // ==================================================

    const denda =
        Number(data.denda) || 0;

    if (
        denda < 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Denda tidak boleh bernilai negatif",
        });
    }

    // ==================================================
    // AMBIL DATA PENGEMBALIAN LAMA
    // ==================================================

    pengembalianModel.getPengembalianById(
        id,
        (
            pengembalianErr,
            pengembalianResult
        ) => {

            if (pengembalianErr) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data pengembalian",
                    error:
                        pengembalianErr.message,
                });
            }

            if (
                !pengembalianResult ||
                pengembalianResult.length === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Data pengembalian tidak ditemukan",
                });
            }

            const pengembalian =
                pengembalianResult[0];

            const idPeminjaman =
                Number(
                    pengembalian.id_peminjaman
                );

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
                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal mengambil data peminjaman",
                            error:
                                loanErr.message,
                        });
                    }

                    if (
                        !loanResult ||
                        loanResult.length === 0
                    ) {
                        return res.status(404).json({
                            success: false,
                            message:
                                "Peminjaman tidak ditemukan",
                        });
                    }

                    const loan =
                        loanResult[0];

                    // ==================================================
                    // DATA UPDATE
                    // ==================================================
                    //
                    // id_peminjaman TIDAK dimasukkan.
                    //
                    // Stok juga TIDAK disentuh.
                    // ==================================================

                    const updateData = {

                        tanggal_pengembalian:
                            data.tanggal_pengembalian,

                        kondisi_baju:
                            data.kondisi_baju,

                        denda,

                        keterangan:
                            data.keterangan ||
                            null,

                        diterima_oleh:
                            data.diterima_oleh ||
                            null,
                    };

                    pengembalianModel.updatePengembalian(
                        id,
                        updateData,
                        (
                            err,
                            result
                        ) => {

                            if (err) {
                                console.error(
                                    "ERROR UPDATE PENGEMBALIAN:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Gagal mengubah data pengembalian",
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
                                        "Data pengembalian tidak ditemukan",
                                });
                            }

                            // ==================================================
                            // NOTIFIKASI USER
                            // ==================================================

                            const pesanUser =
                                `Data pengembalian untuk peminjaman #${idPeminjaman} ` +
                                `telah diperbarui. Kondisi: ${data.kondisi_baju}.`;

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
                                            "Gagal membuat notifikasi update pengembalian:",
                                            notificationError
                                        );
                                    }

                                    return res.status(200).json({
                                        success: true,
                                        message:
                                            "Pengembalian berhasil diperbarui",
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
// DELETE PENGEMBALIAN
// ======================================================
//
// Tidak mengubah stok.
//
// ======================================================

const deletePengembalian = (
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
                "ID pengembalian tidak valid",
        });
    }

    pengembalianModel.deletePengembalian(
        id,
        (
            err,
            result
        ) => {

            if (err) {
                console.error(
                    "ERROR DELETE PENGEMBALIAN:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal menghapus pengembalian",
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
                        "Data pengembalian tidak ditemukan",
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Pengembalian berhasil dihapus",
            });
        }
    );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getPengembalian,
    getPeminjamanBelumDikembalikan,
    getPengembalianById,
    createPengembalian,
    updatePengembalian,
    deletePengembalian,
};