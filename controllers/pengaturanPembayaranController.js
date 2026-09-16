const pengaturanPembayaranModel =
    require("../models/pengaturanPembayaranModel");


// ======================================================
// GET SEMUA PENGATURAN PEMBAYARAN
// ======================================================

const getAllPengaturanPembayaran = (
    req,
    res
) => {

    pengaturanPembayaranModel.getAllPengaturanPembayaran(
        (
            err,
            results
        ) => {

            if (err) {

                console.error(
                    "Error get pengaturan pembayaran:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal mengambil pengaturan pembayaran",
                        error:
                            err.message
                    });

            }


            return res
                .status(200)
                .json({
                    success: true,
                    total:
                        results.length,
                    data:
                        results
                });

        }
    );

};


// ======================================================
// GET PENGATURAN PEMBAYARAN BY ID
// ======================================================

const getPengaturanPembayaranById = (
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
                    "ID pengaturan pembayaran tidak valid"
            });

    }


    pengaturanPembayaranModel.getPengaturanPembayaranById(
        id,
        (
            err,
            results
        ) => {

            if (err) {

                console.error(
                    "Error get pengaturan pembayaran by id:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal mengambil pengaturan pembayaran",
                        error:
                            err.message
                    });

            }


            if (
                !results ||
                results.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Pengaturan pembayaran tidak ditemukan"
                    });

            }


            return res
                .status(200)
                .json({
                    success: true,
                    data:
                        results[0]
                });

        }
    );

};


// ======================================================
// GET QRIS AKTIF
// ======================================================

const getQrisAktif = (
    req,
    res
) => {

    pengaturanPembayaranModel.getQrisAktif(
        (
            err,
            results
        ) => {

            if (err) {

                console.error(
                    "Error get QRIS aktif:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal mengambil QRIS",
                        error:
                            err.message
                    });

            }


            if (
                !results ||
                results.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "QRIS aktif belum tersedia"
                    });

            }


            return res
                .status(200)
                .json({
                    success: true,
                    data:
                        results[0]
                });

        }
    );

};


// ======================================================
// CREATE PENGATURAN PEMBAYARAN
// ======================================================

const createPengaturanPembayaran = (
    req,
    res
) => {

    const data =
        req.body || {};


    const metode =
        data.metode;


    if (!metode) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "Metode pembayaran wajib diisi"
            });

    }


    const allowedMetode = [
        "QRIS",
        "Transfer Bank",
        "Cash"
    ];


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


    // ==================================================
    // QRIS
    // ==================================================

    let qris = null;


    if (
        metode === "QRIS" &&
        req.file
    ) {

        qris =
            `/uploads/pembayaran/${req.file.filename}`;

    }


    // ==================================================
    // DATA
    // ==================================================

    const pengaturanData = {

        metode,

        nama_penerima:
            data.nama_penerima ||
            null,

        nomor_rekening:
            data.nomor_rekening ||
            null,

        nama_bank:
            data.nama_bank ||
            null,

        qris,

        status:
            data.status ||
            "Aktif"

    };


    // ==================================================
    // INSERT
    // ==================================================

    pengaturanPembayaranModel.createPengaturanPembayaran(
        pengaturanData,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error create pengaturan pembayaran:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal menambahkan pengaturan pembayaran",
                        error:
                            err.message
                    });

            }


            return res
                .status(201)
                .json({
                    success: true,
                    message:
                        "Pengaturan pembayaran berhasil ditambahkan",
                    id_pengaturan:
                        result.insertId
                });

        }
    );

};


// ======================================================
// UPDATE PENGATURAN PEMBAYARAN
// ======================================================

const updatePengaturanPembayaran = (
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
                    "ID pengaturan pembayaran tidak valid"
            });

    }


    const data =
        req.body || {};


    const metode =
        data.metode;


    if (!metode) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "Metode pembayaran wajib diisi"
            });

    }


    const allowedMetode = [
        "QRIS",
        "Transfer Bank",
        "Cash"
    ];


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


    // ==================================================
    // QRIS
    // ==================================================

    let qris = null;


    if (
        req.file
    ) {

        qris =
            `/uploads/pembayaran/${req.file.filename}`;

    }


    // ==================================================
    // DATA
    // ==================================================

    const pengaturanData = {

        metode,

        nama_penerima:
            data.nama_penerima ||
            null,

        nomor_rekening:
            data.nomor_rekening ||
            null,

        nama_bank:
            data.nama_bank ||
            null,

        qris,

        status:
            data.status ||
            "Aktif"

    };


    // ==================================================
    // UPDATE
    // ==================================================

    pengaturanPembayaranModel.updatePengaturanPembayaran(
        id,
        pengaturanData,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error update pengaturan pembayaran:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal memperbarui pengaturan pembayaran",
                        error:
                            err.message
                    });

            }


            if (
                result.affectedRows === 0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Pengaturan pembayaran tidak ditemukan"
                    });

            }


            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Pengaturan pembayaran berhasil diperbarui"
                });

        }
    );

};


// ======================================================
// UPDATE QRIS SAJA
// ======================================================

const updateQris = (
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
                    "ID pengaturan QRIS tidak valid"
            });

    }


    // ==================================================
    // VALIDASI FILE
    // ==================================================

    if (!req.file) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "File QRIS wajib diunggah"
            });

    }


    // ==================================================
    // PATH QRIS
    // ==================================================

    const qris =
        `/uploads/pembayaran/${req.file.filename}`;


    // ==================================================
    // UPDATE DATABASE
    // ==================================================

    pengaturanPembayaranModel.updateQris(
        id,
        qris,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error update QRIS:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal memperbarui QRIS",
                        error:
                            err.message
                    });

            }


            // ==================================================
            // DATA TIDAK DITEMUKAN
            // ==================================================

            if (
                result.affectedRows === 0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Pengaturan QRIS tidak ditemukan"
                    });

            }


            // ==================================================
            // BERHASIL
            // ==================================================

            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "QRIS berhasil diperbarui",
                    qris
                });

        }
    );

};


// ======================================================
// UPDATE DATA REKENING BANK
// ======================================================

const updateBank = (
    req,
    res
) => {

    const id =
        req.params.id;


    // ==================================================
    // VALIDASI ID
    // ==================================================

    if (
        !id ||
        isNaN(id)
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "ID pengaturan pembayaran tidak valid"
            });

    }


    const {
        nama_bank,
        nomor_rekening,
        nama_penerima
    } = req.body || {};


    // ==================================================
    // VALIDASI DATA
    // ==================================================

    if (
        !nama_bank ||
        !nomor_rekening ||
        !nama_penerima
    ) {

        return res
            .status(400)
            .json({
                success: false,
                message:
                    "Nama bank, nomor rekening, dan nama penerima wajib diisi"
            });

    }


    // ==================================================
    // UPDATE DATABASE
    // ==================================================

    pengaturanPembayaranModel.updateBank(
        id,
        {
            nama_bank,
            nomor_rekening,
            nama_penerima
        },
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error update rekening bank:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal memperbarui rekening bank",
                        error:
                            err.message
                    });

            }


            // ==================================================
            // DATA TIDAK DITEMUKAN
            // ==================================================

            if (
                result.affectedRows === 0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Pengaturan pembayaran tidak ditemukan"
                    });

            }


            // ==================================================
            // BERHASIL
            // ==================================================

            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Rekening bank berhasil diperbarui"
                });

        }
    );

};


// ======================================================
// UPDATE STATUS
// ======================================================

const updateStatusPengaturanPembayaran = (
    req,
    res
) => {

    const id =
        req.params.id;


    const {
        status
    } = req.body;


    // ==================================================
    // STATUS YANG DIPERBOLEHKAN
    // ==================================================

    const allowedStatus = [
        "Aktif",
        "Nonaktif"
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
                    "Status tidak valid"
            });

    }


    // ==================================================
    // UPDATE STATUS
    // ==================================================

    pengaturanPembayaranModel.updateStatusPengaturanPembayaran(
        id,
        status,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error update status pengaturan pembayaran:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal mengubah status",
                        error:
                            err.message
                    });

            }


            if (
                result.affectedRows === 0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Pengaturan pembayaran tidak ditemukan"
                    });

            }


            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Status berhasil diperbarui"
                });

        }
    );

};


// ======================================================
// DELETE
// ======================================================

const deletePengaturanPembayaran = (
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
                    "ID pengaturan pembayaran tidak valid"
            });

    }


    pengaturanPembayaranModel.deletePengaturanPembayaran(
        id,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error delete pengaturan pembayaran:",
                    err
                );

                return res
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Gagal menghapus pengaturan pembayaran",
                        error:
                            err.message
                    });

            }


            if (
                result.affectedRows === 0
            ) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Pengaturan pembayaran tidak ditemukan"
                    });

            }


            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Pengaturan pembayaran berhasil dihapus"
                });

        }
    );

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getAllPengaturanPembayaran,

    getPengaturanPembayaranById,

    getQrisAktif,

    createPengaturanPembayaran,

    updatePengaturanPembayaran,

    updateQris,

    updateBank,

    updateStatusPengaturanPembayaran,

    deletePengaturanPembayaran

};