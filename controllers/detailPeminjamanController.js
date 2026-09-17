// ======================================================
// controllers/detailPeminjamanController.js
// ======================================================

const detailPeminjamanModel =
    require("../models/detailPeminjamanModel");

const peminjamanModel =
    require("../models/peminjamanModel");

// ======================================================
// HELPER NORMALISASI TANGGAL
// ======================================================
//
// Fungsi ini menangani beberapa bentuk tanggal:
//
// YYYY-MM-DD
// YYYY-MM-DD HH:mm:ss
// Date object dari MySQL
// ISO datetime
//
// Hasil akhirnya selalu:
// YYYY-MM-DD
// ======================================================

const normalizeDateOnly = (value) => {
    if (value === null || value === undefined) {
        return null;
    }

    // Jika dari MySQL berupa Date object
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            return null;
        }

        const year =
            value.getFullYear();

        const month =
            String(
                value.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                value.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const text =
        String(value).trim();

    if (!text) {
        return null;
    }

    // Jika sudah YYYY-MM-DD
    const matchDate =
        text.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );

    if (matchDate) {
        const year =
            Number(matchDate[1]);

        const month =
            Number(matchDate[2]);

        const day =
            Number(matchDate[3]);

        // Validasi tanggal secara nyata
        const testDate =
            new Date(
                year,
                month - 1,
                day
            );

        if (
            testDate.getFullYear() !== year ||
            testDate.getMonth() !== month - 1 ||
            testDate.getDate() !== day
        ) {
            return null;
        }

        return `${year}-${String(month).padStart(
            2,
            "0"
        )}-${String(day).padStart(
            2,
            "0"
        )}`;
    }

    // Fallback jika format lainnya
    const parsed =
        new Date(text);

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return null;
    }

    const year =
        parsed.getFullYear();

    const month =
        String(
            parsed.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            parsed.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// ======================================================
// VALIDASI RENTANG TANGGAL
// ======================================================

const validateDateRange = (
    tanggalPeminjaman,
    tanggalKembali
) => {
    const start =
        normalizeDateOnly(
            tanggalPeminjaman
        );

    const end =
        normalizeDateOnly(
            tanggalKembali
        );

    if (!start || !end) {
        return {
            valid: false,
            message:
                "Tanggal peminjaman tidak valid",
        };
    }

    // Karena format sudah YYYY-MM-DD,
    // perbandingan string aman.
    if (end <= start) {
        return {
            valid: false,
            message:
                "Tanggal kembali harus setelah tanggal peminjaman",
        };
    }

    return {
        valid: true,
        start,
        end,
    };
};

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
        Number.isNaN(idPeminjaman)
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
        Number.isNaN(idUser)
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
        Number(
            data.id_peminjaman
        );

    const idKostum =
        Number(
            data.id_kostum
        );

    const jumlah =
        Number(
            data.jumlah
        );

    const harga =
        Number(
            data.harga
        );

    const subtotal =
        Number(
            data.subtotal
        );

    // ==================================================
    // VALIDASI ID PEMINJAMAN
    // ==================================================

    if (
        !idPeminjaman ||
        Number.isNaN(idPeminjaman)
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
        Number.isNaN(idKostum)
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
        Number.isNaN(jumlah) ||
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
        Number.isNaN(harga) ||
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
        Number.isNaN(subtotal) ||
        subtotal < 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Subtotal tidak valid",
        });
    }

    // ==================================================
    // CEK DATA PEMINJAMAN
    // ==================================================

    peminjamanModel.getPeminjamanById(
        idPeminjaman,
        (
            loanErr,
            loanResult
        ) => {
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

            const dateValidation =
                validateDateRange(
                    loan.tanggal_peminjaman,
                    loan.tanggal_kembali
                );

            if (
                !dateValidation.valid
            ) {
                console.error(
                    "VALIDASI TANGGAL DETAIL GAGAL:",
                    {
                        idPeminjaman,
                        tanggal_peminjaman:
                            loan.tanggal_peminjaman,
                        tanggal_kembali:
                            loan.tanggal_kembali,
                        tanggalPeminjamanNormal:
                            normalizeDateOnly(
                                loan.tanggal_peminjaman
                            ),
                        tanggalKembaliNormal:
                            normalizeDateOnly(
                                loan.tanggal_kembali
                            ),
                    }
                );

                return res.status(400).json({
                    success: false,
                    message:
                        dateValidation.message,
                });
            }

            // ==================================================
            // DETAIL HANYA BOLEH DITAMBAHKAN
            // SAAT STATUS MENUNGGU / DISETUJUI
            // ==================================================

            if (
                ![
                    "Menunggu",
                    "Disetujui",
                ].includes(
                    loan.status
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Detail tidak dapat ditambahkan karena status peminjaman saat ini "${loan.status}".`,
                });
            }

            // ==================================================
            // CEK KETERSEDIAAN KOSTUM
            // ==================================================
            //
            // Penting:
            // Di sini kita hanya melakukan pengecekan.
            //
            // STOK FISIK TIDAK DIKURANGI.
            //
            // Stok baru dikurangi ketika:
            //
            // Disetujui -> Diproses
            //
            // ==================================================

            peminjamanModel.checkKostumAvailability(
                idKostum,
                dateValidation.start,
                dateValidation.end,
                jumlah,
                idPeminjaman,
                (
                    availabilityErr,
                    availabilityResult
                ) => {
                    if (
                        availabilityErr
                    ) {
                        console.error(
                            "ERROR CEK KETERSEDIAAN KOSTUM:",
                            availabilityErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal mengecek ketersediaan kostum",
                            error:
                                availabilityErr.message,
                        });
                    }

                    // ==================================================
                    // CEK HASIL KETERSEDIAAN
                    // ==================================================

                    if (
                        !availabilityResult
                    ) {
                        return res.status(500).json({
                            success: false,
                            message:
                                "Hasil pengecekan ketersediaan kostum tidak tersedia",
                        });
                    }

                    if (
                        availabilityResult.tersedia === false
                    ) {
                        return res.status(409).json({
                            success: false,
                            message:
                                availabilityResult.message ||
                                "Kostum tidak tersedia pada tanggal tersebut.",
                            data:
                                availabilityResult,
                        });
                    }

                    // ==================================================
                    // CEK DETAIL DUPLIKAT
                    // ==================================================

                    detailPeminjamanModel.getDetailsByPeminjaman(
                        idPeminjaman,
                        (
                            detailErr,
                            existingDetails
                        ) => {
                            if (
                                detailErr
                            ) {
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
                                (
                                    existingDetails ||
                                    []
                                ).some(
                                    (
                                        detail
                                    ) =>
                                        Number(
                                            detail.id_kostum
                                        ) ===
                                        idKostum
                                );

                            if (
                                duplicate
                            ) {
                                return res.status(409).json({
                                    success: false,
                                    message:
                                        "Kostum tersebut sudah ada dalam detail peminjaman ini",
                                });
                            }

                            // ==================================================
                            // DATA DETAIL
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

                            console.log(
                                "DATA DETAIL YANG AKAN DISIMPAN:",
                                detailData
                            );

                            // ==================================================
                            // INSERT DETAIL
                            // ==================================================

                            detailPeminjamanModel.createDetailPeminjaman(
                                detailData,
                                (
                                    err,
                                    result
                                ) => {
                                    if (
                                        err
                                    ) {
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