// ======================================================
// controllers/dendaController.js
// ======================================================

const dendaModel =
    require("../models/dendaModel");

const pengembalianModel =
    require("../models/pengembalianModel");

const notificationModel =
    require("../models/notificationModel");

// ======================================================
// GET SEMUA DENDA
// ======================================================

const getDenda = (
    req,
    res
) => {

    dendaModel.getAllDenda(
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR GET DENDA:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data denda",
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
// GET DENDA BY ID
// ======================================================

const getDendaById = (
    req,
    res
) => {

    const idDenda =
        Number(req.params.id);

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

    dendaModel.getDendaById(
        idDenda,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR GET DENDA BY ID:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data denda",
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
                        "Denda tidak ditemukan"
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
// GET DENDA BERDASARKAN PENGEMBALIAN
// ======================================================

const getDendaByPengembalian = (
    req,
    res
) => {

    const idPengembalian =
        Number(
            req.params.idPengembalian
        );

    if (
        !idPengembalian ||
        isNaN(idPengembalian)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID pengembalian tidak valid"
        });
    }

    dendaModel.getDendaByPengembalian(
        idPengembalian,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR GET DENDA PENGEMBALIAN:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil denda",
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
// CREATE DENDA
// ======================================================

const createDenda = (
    req,
    res
) => {

    const data =
        req.body || {};

    const idPengembalian =
        Number(
            data.id_pengembalian
        );

    const nominalDenda =
        Number(
            data.nominal_denda
        );

    const alasan =
        data.alasan || null;

    const dibuatOleh =
        data.dibuat_oleh
            ? Number(data.dibuat_oleh)
            : null;

    // ==================================================
    // VALIDASI
    // ==================================================

    if (
        !idPengembalian ||
        isNaN(idPengembalian)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID pengembalian wajib diisi"
        });
    }

    if (
        isNaN(nominalDenda) ||
        nominalDenda < 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Nominal denda tidak valid"
        });
    }

    // ==================================================
    // CEK PENGEMBALIAN
    // ==================================================

    pengembalianModel.getPengembalianById(
        idPengembalian,
        (returnErr, returnResult) => {

            if (returnErr) {

                console.error(
                    "ERROR CEK PENGEMBALIAN:",
                    returnErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal memeriksa pengembalian",
                    error:
                        returnErr.message
                });
            }

            if (
                !returnResult ||
                returnResult.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Data pengembalian tidak ditemukan"
                });
            }

            // ==================================================
            // CEK APAKAH SUDAH ADA DENDA
            // ==================================================

            dendaModel.getDendaByPengembalian(
                idPengembalian,
                (checkErr, existing) => {

                    if (checkErr) {

                        console.error(
                            "ERROR CEK DENDA:",
                            checkErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal memeriksa denda",
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
                                "Pengembalian ini sudah memiliki denda"
                        });
                    }

                    // ==================================================
                    // SIMPAN DENDA
                    // ==================================================

                    const dendaData = {

                        id_pengembalian:
                            idPengembalian,

                        nominal_denda:
                            nominalDenda,

                        alasan:

                            alasan,

                        status:
                            "Belum Dibayar",

                        dibuat_oleh:
                            dibuatOleh
                    };

                    dendaModel.createDenda(
                        dendaData,
                        (err, result) => {

                            if (err) {

                                console.error(
                                    "ERROR CREATE DENDA:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Gagal membuat denda",
                                    error:
                                        err.message
                                });
                            }

                            return res.status(201).json({
                                success: true,
                                message:
                                    "Denda berhasil dibuat",
                                id_denda:
                                    result.insertId
                            });
                        }
                    );
                }
            );
        }
    );
};

// ======================================================
// UPDATE DENDA
// ======================================================

const updateDenda = (
    req,
    res
) => {

    const idDenda =
        Number(req.params.id);

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

    const data =
        req.body || {};

    const nominalDenda =
        Number(
            data.nominal_denda
        );

    if (
        isNaN(nominalDenda) ||
        nominalDenda < 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Nominal denda tidak valid"
        });
    }

    const allowedStatus = [
        "Belum Dibayar",
        "Menunggu Verifikasi",
        "Lunas"
    ];

    const status =
        data.status ||
        "Belum Dibayar";

    if (
        !allowedStatus.includes(status)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Status denda tidak valid"
        });
    }

    const updateData = {

        nominal_denda:
            nominalDenda,

        alasan:
            data.alasan || null,

        status:

            status,

        diperbarui_oleh:

            data.diperbarui_oleh
                ? Number(data.diperbarui_oleh)
                : null
    };

    dendaModel.updateDenda(
        idDenda,
        updateData,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR UPDATE DENDA:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal memperbarui denda",
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
                        "Denda tidak ditemukan"
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Denda berhasil diperbarui"
            });
        }
    );
};

// ======================================================
// UPDATE STATUS DENDA
// ======================================================

const updateStatusDenda = (
    req,
    res
) => {

    const idDenda =
        Number(req.params.id);

    const status =
        req.body?.status;

    const diperbaruiOleh =
        req.body?.diperbarui_oleh
            ? Number(req.body.diperbarui_oleh)
            : null;

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

    const allowedStatus = [
        "Belum Dibayar",
        "Menunggu Verifikasi",
        "Lunas"
    ];

    if (
        !allowedStatus.includes(status)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Status denda tidak valid"
        });
    }

    dendaModel.getDendaById(
        idDenda,
        (getErr, dendaResult) => {

            if (getErr) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data denda",
                    error:
                        getErr.message
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
            // VALIDASI TRANSISI STATUS
            // ==================================================

            const transitions = {

                "Belum Dibayar": [
                    "Menunggu Verifikasi"
                ],

                "Menunggu Verifikasi": [
                    "Lunas",
                    "Belum Dibayar"
                ],

                "Lunas": []
            };

            const currentStatus =
                denda.status;

            if (
                currentStatus === status
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Denda sudah berstatus "${status}"`
                });
            }

            if (
                !transitions[
                    currentStatus
                ]?.includes(status)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Perubahan status denda dari "${currentStatus}" ke "${status}" tidak diperbolehkan`
                });
            }

            dendaModel.updateStatusDenda(
                idDenda,
                status,
                diperbaruiOleh,
                (err, result) => {

                    if (err) {

                        console.error(
                            "ERROR UPDATE STATUS DENDA:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal mengubah status denda",
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
                                "Denda tidak ditemukan"
                        });
                    }

                    // ==================================================
                    // NOTIFIKASI USER
                    // ==================================================

                    if (
                        denda.id_user
                    ) {

                        const pesan =
                            `Status denda untuk peminjaman #${denda.id_peminjaman} ` +
                            `telah diubah menjadi "${status}".`;

                        notificationModel.createNotificationForUser(
                            denda.id_user,
                            pesan,
                            (
                                notificationError
                            ) => {

                                if (
                                    notificationError
                                ) {

                                    console.error(
                                        "Gagal membuat notifikasi denda:",
                                        notificationError
                                    );
                                }

                                return res.status(200).json({
                                    success: true,
                                    message:
                                        "Status denda berhasil diperbarui"
                                });
                            }
                        );

                    } else {

                        return res.status(200).json({
                            success: true,
                            message:
                                "Status denda berhasil diperbarui"
                        });
                    }
                }
            );
        }
    );
};

// ======================================================
// DELETE DENDA
// ======================================================

const deleteDenda = (
    req,
    res
) => {

    const idDenda =
        Number(req.params.id);

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

    dendaModel.deleteDenda(
        idDenda,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR DELETE DENDA:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal menghapus denda",
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
                        "Denda tidak ditemukan"
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Denda berhasil dihapus"
            });
        }
    );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getDenda,

    getDendaById,

    getDendaByPengembalian,

    createDenda,

    updateDenda,

    updateStatusDenda,

    deleteDenda

};