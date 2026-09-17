const fs = require("fs");
const path = require("path");

const dokumenJaminanModel = require("../models/dokumenJaminanModel");
const peminjamanModel = require("../models/peminjamanModel");


// ======================================================
// GET SEMUA DOKUMEN
// ======================================================

const getDokumenJaminan = (req, res) => {
    dokumenJaminanModel.getAllDokumenJaminan(
        (err, result) => {
            if (err) {
                console.error(
                    "Error get dokumen jaminan:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data dokumen jaminan.",
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
// GET DOKUMEN BERDASARKAN ID
// ======================================================

const getDokumenJaminanById = (
    req,
    res
) => {
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
        return res.status(400).json({
            success: false,
            message:
                "ID dokumen jaminan tidak valid.",
        });
    }

    dokumenJaminanModel.getDokumenJaminanById(
        id,
        (err, result) => {
            if (err) {
                console.error(
                    "Error get dokumen jaminan:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil dokumen jaminan.",
                });
            }

            if (!result || result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Dokumen jaminan tidak ditemukan.",
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
// GET DOKUMEN BERDASARKAN PEMINJAMAN
// ======================================================

const getDokumenJaminanByPeminjaman = (
    req,
    res
) => {
    const idPeminjaman =
        Number(req.params.idPeminjaman);

    if (
        !idPeminjaman ||
        Number.isNaN(idPeminjaman)
    ) {
        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman tidak valid.",
        });
    }

    dokumenJaminanModel.getDokumenJaminanByPeminjaman(
        idPeminjaman,
        (err, result) => {
            if (err) {
                console.error(
                    "Error get dokumen berdasarkan peminjaman:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil dokumen jaminan.",
                });
            }

            return res.status(200).json({
                success: true,
                data:
                    result && result.length > 0
                        ? result[0]
                        : null,
            });
        }
    );
};


// ======================================================
// CREATE DOKUMEN JAMINAN
// ======================================================

const createDokumenJaminan = (
    req,
    res
) => {
    const {
        id_peminjaman,
        jenis_dokumen,
        keterangan,
    } = req.body;

    const idPeminjaman =
        Number(id_peminjaman);

    // ==================================================
    // VALIDASI PEMINJAMAN
    // ==================================================

    if (
        !idPeminjaman ||
        Number.isNaN(idPeminjaman)
    ) {
        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman wajib diisi.",
        });
    }

    // ==================================================
    // VALIDASI JENIS DOKUMEN
    // ==================================================

    const allowedJenis = [
        "KTP",
        "Kartu Keluarga",
    ];

    if (
        !allowedJenis.includes(
            jenis_dokumen
        )
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Jenis dokumen harus KTP atau Kartu Keluarga.",
        });
    }

    // ==================================================
    // VALIDASI FILE
    // ==================================================

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message:
                "Dokumen jaminan wajib diunggah.",
        });
    }

    // ==================================================
    // VALIDASI MIME TYPE
    // ==================================================

    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (
        !allowedMimeTypes.includes(
            req.file.mimetype
        )
    ) {
        // Hapus file jika middleware
        // sudah sempat menyimpannya
        try {
            if (req.file.path) {
                fs.unlinkSync(req.file.path);
            }
        } catch (deleteError) {
            console.error(
                "Gagal menghapus file invalid:",
                deleteError
            );
        }

        return res.status(400).json({
            success: false,
            message:
                "Dokumen jaminan harus berupa JPG, PNG, atau WEBP.",
        });
    }

    // ==================================================
    // VALIDASI UKURAN
    // ==================================================

    if (
        Number(req.file.size) >
        5 * 1024 * 1024
    ) {
        try {
            if (req.file.path) {
                fs.unlinkSync(req.file.path);
            }
        } catch (deleteError) {
            console.error(
                "Gagal menghapus file terlalu besar:",
                deleteError
            );
        }

        return res.status(400).json({
            success: false,
            message:
                "Ukuran dokumen jaminan maksimal 5 MB.",
        });
    }

    // ==================================================
    // CEK PEMINJAMAN
    // ==================================================

    peminjamanModel.getPeminjamanById(
        idPeminjaman,
        (loanError, loanResult) => {
            if (loanError) {
                console.error(
                    "Error cek peminjaman:",
                    loanError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal memeriksa peminjaman.",
                });
            }

            if (
                !loanResult ||
                loanResult.length === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Peminjaman tidak ditemukan.",
                });
            }

            const peminjaman =
                loanResult[0];

            // ==================================================
            // DOKUMEN HANYA UNTUK PEMINJAMAN
            // YANG MASIH MENUNGGU
            // ==================================================

            if (
                peminjaman.status !==
                "Menunggu"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Dokumen jaminan hanya dapat ditambahkan pada peminjaman dengan status Menunggu.",
                });
            }

            // ==================================================
            // CEK DUPLIKAT
            // ==================================================

            dokumenJaminanModel.checkExistingDokumenJaminan(
                idPeminjaman,
                (existingError, existingResult) => {
                    if (existingError) {
                        console.error(
                            "Error cek dokumen:",
                            existingError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal memeriksa dokumen jaminan.",
                        });
                    }

                    if (
                        existingResult &&
                        existingResult.length > 0
                    ) {
                        return res.status(409).json({
                            success: false,
                            message:
                                "Peminjaman ini sudah memiliki dokumen jaminan.",
                        });
                    }

                    // ==================================================
                    // SIMPAN DATABASE
                    // ==================================================

                    const relativePath =
                        path
                            .relative(
                                process.cwd(),
                                req.file.path
                            )
                            .replace(/\\/g, "/");

                    const data = {
                        id_peminjaman:
                            idPeminjaman,

                        jenis_dokumen:
                            jenis_dokumen,

                        nama_file:
                            req.file.filename,

                        path_file:
                            relativePath,

                        mime_type:
                            req.file.mimetype,

                        ukuran_file:
                            Number(req.file.size),

                        status:
                            "Menunggu Verifikasi",

                        diverifikasi_oleh:
                            null,

                        tanggal_verifikasi:
                            null,

                        keterangan:
                            keterangan ||
                            null,
                    };

                    dokumenJaminanModel.createDokumenJaminan(
                        data,
                        (createError, result) => {
                            if (createError) {
                                console.error(
                                    "Error create dokumen:",
                                    createError
                                );

                                // Hapus file jika DB gagal
                                try {
                                    if (
                                        req.file.path
                                    ) {
                                        fs.unlinkSync(
                                            req.file.path
                                        );
                                    }
                                } catch (
                                    deleteError
                                ) {
                                    console.error(
                                        "Gagal menghapus file:",
                                        deleteError
                                    );
                                }

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Gagal menyimpan dokumen jaminan.",
                                });
                            }

                            return res.status(201).json({
                                success: true,
                                message:
                                    "Dokumen jaminan berhasil diunggah.",
                                id_dokumen_jaminan:
                                    result.insertId,
                            });
                        }
                    );
                }
            );
        }
    );
};


// ======================================================
// UPDATE STATUS DOKUMEN
// ======================================================

const updateStatusDokumenJaminan = (
    req,
    res
) => {
    const id =
        Number(req.params.id);

    const {
        status,
        diverifikasi_oleh,
        keterangan,
    } = req.body;

    const allowedStatus = [
        "Menunggu Verifikasi",
        "Terverifikasi",
        "Ditolak",
    ];

    if (
        !id ||
        Number.isNaN(id)
    ) {
        return res.status(400).json({
            success: false,
            message:
                "ID dokumen tidak valid.",
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
                "Status dokumen tidak valid.",
        });
    }

    if (
        status === "Terverifikasi" &&
        !diverifikasi_oleh
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Petugas yang memverifikasi wajib diisi.",
        });
    }

    dokumenJaminanModel.getDokumenJaminanById(
        id,
        (getError, result) => {
            if (getError) {
                console.error(
                    "Error get dokumen:",
                    getError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil dokumen jaminan.",
                });
            }

            if (
                !result ||
                result.length === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Dokumen jaminan tidak ditemukan.",
                });
            }

            const current =
                result[0];

            // Jangan izinkan verifikasi ulang
            // terhadap dokumen yang sudah terverifikasi
            if (
                current.status ===
                    "Terverifikasi" &&
                status !== "Terverifikasi"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Dokumen yang sudah terverifikasi tidak dapat diubah kembali.",
                });
            }

            dokumenJaminanModel.updateStatusDokumenJaminan(
                id,
                status,
                diverifikasi_oleh,
                keterangan,
                (updateError) => {
                    if (updateError) {
                        console.error(
                            "Error update status dokumen:",
                            updateError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal memperbarui status dokumen.",
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message:
                            "Status dokumen berhasil diperbarui.",
                    });
                }
            );
        }
    );
};


// ======================================================
// DELETE DOKUMEN
// ======================================================

const deleteDokumenJaminan = (
    req,
    res
) => {
    const id =
        Number(req.params.id);

    if (
        !id ||
        Number.isNaN(id)
    ) {
        return res.status(400).json({
            success: false,
            message:
                "ID dokumen tidak valid.",
        });
    }

    dokumenJaminanModel.getDokumenJaminanById(
        id,
        (getError, result) => {
            if (getError) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil dokumen.",
                });
            }

            if (
                !result ||
                result.length === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Dokumen tidak ditemukan.",
                });
            }

            const dokumen =
                result[0];

            // Jangan hapus dokumen yang
            // sudah terverifikasi
            if (
                dokumen.status ===
                "Terverifikasi"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Dokumen yang sudah terverifikasi tidak dapat dihapus.",
                });
            }

            dokumenJaminanModel.deleteDokumenJaminan(
                id,
                (deleteError) => {
                    if (deleteError) {
                        console.error(
                            "Error delete dokumen:",
                            deleteError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal menghapus dokumen jaminan.",
                        });
                    }

                    // Hapus file fisik
                    try {
                        const absolutePath =
                            path.resolve(
                                process.cwd(),
                                dokumen.path_file
                            );

                        if (
                            fs.existsSync(
                                absolutePath
                            )
                        ) {
                            fs.unlinkSync(
                                absolutePath
                            );
                        }
                    } catch (fileError) {
                        console.error(
                            "Gagal menghapus file fisik:",
                            fileError
                        );
                    }

                    return res.status(200).json({
                        success: true,
                        message:
                            "Dokumen jaminan berhasil dihapus.",
                    });
                }
            );
        }
    );
};


// ======================================================
// LIHAT FILE DOKUMEN SECARA TERPROTEKSI
// ======================================================

const viewDokumenJaminan = (
    req,
    res
) => {
    const id =
        Number(req.params.id);

    const idUser =
        Number(req.query.id_user);

    const idRole =
        Number(req.query.id_role);

    if (
        !id ||
        Number.isNaN(id)
    ) {
        return res.status(400).json({
            success: false,
            message:
                "ID dokumen tidak valid.",
        });
    }

    dokumenJaminanModel.getDokumenJaminanById(
        id,
        (err, result) => {
            if (err) {
                console.error(
                    "Error view dokumen:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil dokumen.",
                });
            }

            if (
                !result ||
                result.length === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Dokumen tidak ditemukan.",
                });
            }

            const dokumen =
                result[0];

            // ==============================================
            // IZIN AKSES
            // ==============================================
            //
            // Role 1 = Admin
            // Role 2 = Petugas
            // Pelanggan = hanya pemilik peminjaman
            //

            const isStaff =
                idRole === 1 ||
                idRole === 2;

            const isOwner =
                idUser ===
                Number(
                    dokumen.id_user
                );

            if (
                !isStaff &&
                !isOwner
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Anda tidak memiliki akses ke dokumen ini.",
                });
            }

            const absolutePath =
                path.resolve(
                    process.cwd(),
                    dokumen.path_file
                );

            if (
                !fs.existsSync(
                    absolutePath
                )
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "File dokumen tidak ditemukan di server.",
                });
            }

            res.setHeader(
                "Content-Type",
                dokumen.mime_type
            );

            res.setHeader(
                "Content-Disposition",
                `inline; filename="${dokumen.nama_file}"`
            );

            return res.sendFile(
                absolutePath
            );
        }
    );
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getDokumenJaminan,
    getDokumenJaminanById,
    getDokumenJaminanByPeminjaman,
    createDokumenJaminan,
    updateStatusDokumenJaminan,
    deleteDokumenJaminan,
    viewDokumenJaminan,
};