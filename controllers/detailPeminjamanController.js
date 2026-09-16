// ======================================================
// controllers/detailPeminjamanController.js
// ======================================================

const detailPeminjamanModel =
    require("../models/detailPeminjamanModel");

const peminjamanModel =
    require("../models/peminjamanModel");

// ======================================================
// GET DETAIL PEMINJAMAN BY ID + USER
// ======================================================

const getDetailPeminjamanById = (
    req,
    res
) => {

    const idPeminjaman =
        Number(req.params.id);

    const idUser =
        Number(req.params.userId);

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
                "ID peminjaman tidak valid",
        });
    }

    // ==================================================
    // VALIDASI ID USER
    // ==================================================

    if (
        !idUser ||
        isNaN(idUser)
    ) {
        return res.status(400).json({
            success: false,
            message:
                "ID user tidak valid",
        });
    }

    // ==================================================
    // QUERY
    // ==================================================

    detailPeminjamanModel.getDetailPeminjamanById(
        idPeminjaman,
        idUser,
        (err, result) => {

            if (err) {
                console.error(
                    "ERROR GET DETAIL PEMINJAMAN USER:",
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
                        "Peminjaman tidak ditemukan atau bukan milik user ini",
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
// POST DETAIL PEMINJAMAN
// ======================================================

const createDetailPeminjaman = (
    req,
    res
) => {

    const data =
        req.body || {};

    const idPeminjaman =
        Number(data.id_peminjaman);

    const idKostum =
        Number(data.id_kostum);

    const jumlah =
        Number(data.jumlah);

    const harga =
        Number(data.harga);

    const subtotal =
        Number(data.subtotal);

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
                "ID peminjaman tidak valid",
        });
    }

    // ==================================================
    // VALIDASI ID KOSTUM
    // ==================================================

    if (
        !idKostum ||
        isNaN(idKostum)
    ) {
        return res.status(400).json({
            success: false,
            message:
                "ID kostum tidak valid",
        });
    }

    // ==================================================
    // VALIDASI JUMLAH
    // ==================================================

    if (
        !jumlah ||
        isNaN(jumlah) ||
        jumlah <= 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Jumlah kostum harus lebih dari 0",
        });
    }

    // ==================================================
    // VALIDASI HARGA
    // ==================================================

    if (
        isNaN(harga) ||
        harga < 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Harga kostum tidak valid",
        });
    }

    // ==================================================
    // VALIDASI SUBTOTAL
    // ==================================================

    if (
        isNaN(subtotal) ||
        subtotal < 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Subtotal tidak valid",
        });
    }

    // ==================================================
    // CEK PEMINJAMAN
    // ==================================================

    peminjamanModel.getPeminjamanById(
        idPeminjaman,
        (loanErr, loanResult) => {

            if (loanErr) {
                console.error(
                    "ERROR CEK PEMINJAMAN:",
                    loanErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal memeriksa peminjaman",
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
            // VALIDASI TANGGAL PEMINJAMAN
            // ==================================================

            if (
                !loan.tanggal_peminjaman ||
                !loan.tanggal_kembali
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Tanggal peminjaman tidak lengkap",
                });
            }

            const tanggalPeminjaman =
                loan.tanggal_peminjaman;

            const tanggalKembali =
                loan.tanggal_kembali;

            const startDate =
                new Date(
                    `${tanggalPeminjaman}T00:00:00`
                );

            const endDate =
                new Date(
                    `${tanggalKembali}T00:00:00`
                );

            if (
                isNaN(startDate.getTime()) ||
                isNaN(endDate.getTime())
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Tanggal peminjaman tidak valid",
                });
            }

            if (
                endDate <= startDate
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Tanggal kembali harus setelah tanggal peminjaman",
                });
            }

            // ==================================================
            // DETAIL HANYA BOLEH DITAMBAHKAN SEBELUM DIPROSES
            // ==================================================

            if (
                ![
                    "Menunggu",
                    "Disetujui",
                ].includes(loan.status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Detail tidak dapat ditambahkan karena status peminjaman saat ini "${loan.status}".`,
                });
            }

            // ==================================================
            // CEK DETAIL DUPLIKAT
            // ==================================================

            detailPeminjamanModel.getDetailsByPeminjaman(
                idPeminjaman,
                (detailErr, existingDetails) => {

                    if (detailErr) {
                        console.error(
                            "ERROR CEK DETAIL PEMINJAMAN:",
                            detailErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal memeriksa detail peminjaman",
                            error:
                                detailErr.message,
                        });
                    }

                    // ==================================================
                    // CEGAH KOSTUM YANG SAMA
                    // ==================================================

                    const duplicate =
                        (existingDetails || []).some(
                            (detail) =>
                                Number(
                                    detail.id_kostum
                                ) === idKostum
                        );

                    if (duplicate) {
                        return res.status(409).json({
                            success: false,
                            message:
                                "Kostum tersebut sudah ada dalam detail peminjaman ini",
                        });
                    }

                    // ==================================================
                    // CEK KETERSEDIAAN KOSTUM
                    // ==================================================
                    //
                    // PENTING:
                    // Pengecekan dilakukan di BACKEND.
                    //
                    // Parameter:
                    // idKostum
                    // tanggalPeminjaman
                    // tanggalKembali
                    // jumlah
                    //
                    // Jika stok untuk tanggal tersebut tidak cukup,
                    // detail TIDAK akan dimasukkan ke database.
                    // ==================================================

                    peminjamanModel.checkKostumAvailability(
                        idKostum,
                        tanggalPeminjaman,
                        tanggalKembali,
                        jumlah,
                        null,
                        (availabilityErr, availability) => {

                            if (availabilityErr) {
                                console.error(
                                    "ERROR CEK AVAILABILITY KOSTUM:",
                                    availabilityErr
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Gagal memeriksa ketersediaan kostum",
                                    error:
                                        availabilityErr.message,
                                });
                            }

                            // ==================================================
                            // KOSTUM TIDAK TERSEDIA
                            // ==================================================

                            if (
                                !availability ||
                                availability.tersedia !== true
                            ) {

                                return res.status(409).json({
                                    success: false,
                                    message:
                                        "Kostum tidak tersedia untuk tanggal peminjaman tersebut.",
                                    stok_fisik:
                                        Number(
                                            availability?.stok_fisik || 0
                                        ),
                                    jumlah_terpesan:
                                        Number(
                                            availability?.jumlah_terpesan || 0
                                        ),
                                    stok_tersedia:
                                        Number(
                                            availability?.stok_tersedia || 0
                                        ),
                                });
                            }

                            // ==================================================
                            // DATA YANG AKAN DISIMPAN
                            // ==================================================

                            const detailData = {

                                id_peminjaman:
                                    idPeminjaman,

                                id_kostum:
                                    idKostum,

                                jumlah,

                                harga,

                                subtotal,
                            };

                            // ==================================================
                            // INSERT DETAIL
                            // ==================================================

                            detailPeminjamanModel.createDetailPeminjaman(
                                detailData,
                                (err, result) => {

                                    if (err) {
                                        console.error(
                                            "ERROR CREATE DETAIL PEMINJAMAN:",
                                            err
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Gagal menambahkan detail peminjaman",
                                            error:
                                                err.message,
                                        });
                                    }

                                    return res.status(201).json({
                                        success: true,
                                        message:
                                            "Detail peminjaman berhasil ditambahkan",
                                        id_detail:
                                            result.insertId,
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
// EXPORT
// ======================================================

module.exports = {
    getDetailPeminjamanById,
    createDetailPeminjaman,
};