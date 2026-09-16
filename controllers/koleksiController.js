const koleksiModel =
    require("../models/koleksiModel");


// ==================================================
// GET SEMUA KOLEKSI
// ==================================================

const getAllKoleksi = (
    req,
    res
) => {

    koleksiModel.getAllKoleksi(
        (err, data) => {

            if (err) {

                console.error(
                    "GET KOLEKSI ERROR:",
                    err
                );

                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Gagal mengambil data koleksi",

                        error:
                            err.message
                    });
            }


            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Data koleksi berhasil diambil",

                    total:
                        Array.isArray(data)
                            ? data.length
                            : 0,

                    data:
                        data || []

                });
        }
    );
};


// ==================================================
// GET KOLEKSI BERDASARKAN ID
// ==================================================

const getKoleksiById = (
    req,
    res
) => {

    const id =
        req.params.id;


    if (
        !id ||
        isNaN(
            Number(id)
        )
    ) {

        return res
            .status(400)
            .json({

                success: false,

                message:
                    "ID koleksi tidak valid"

            });
    }


    koleksiModel.getKoleksiById(
        Number(id),
        (err, data) => {

            if (err) {

                console.error(
                    "GET KOLEKSI BY ID ERROR:",
                    err
                );

                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Gagal mengambil detail koleksi",

                        error:
                            err.message
                    });
            }


            if (!data) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Koleksi tidak ditemukan"

                    });
            }


            return res
                .status(200)
                .json({

                    success: true,

                    data:
                        data

                });
        }
    );
};


// ==================================================
// CREATE KOLEKSI
// ==================================================

const createKoleksi = (
    req,
    res
) => {

    const {
        nama_koleksi,
        deskripsi,
        status
    } = req.body || {};


    // =================================================
    // VALIDASI NAMA
    // =================================================

    if (
        !nama_koleksi ||
        !String(
            nama_koleksi
        ).trim()
    ) {

        return res
            .status(400)
            .json({

                success: false,

                message:
                    "Nama koleksi wajib diisi"

            });
    }


    // =================================================
    // FOTO
    // =================================================

    let foto =
        null;


    if (
        req.file
    ) {

        /*
         * FOTO DISIMPAN DENGAN
         * PATH RELATIF
         *
         * Contoh:
         *
         * /uploads/koleksi/tradisional.jpg
         */

        foto =
            `/uploads/koleksi/${req.file.filename}`;

    }


    const data = {

        nama_koleksi:
            String(
                nama_koleksi
            ).trim(),

        foto:
            foto,

        deskripsi:
            deskripsi
                ? String(
                    deskripsi
                  ).trim()
                : null,

        status:
            status ||
            "Aktif"

    };


    console.log(
        "========================================"
    );

    console.log(
        "CREATE KOLEKSI"
    );

    console.log(
        "DATA:",
        data
    );

    console.log(
        "========================================"
    );


    koleksiModel.createKoleksi(
        data,
        (err, result) => {

            if (err) {

                console.error(
                    "CREATE KOLEKSI ERROR:",
                    err
                );


                if (
                    err.code ===
                    "ER_DUP_ENTRY"
                ) {

                    return res
                        .status(400)
                        .json({

                            success: false,

                            message:
                                "Nama koleksi sudah digunakan"

                        });
                }


                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Gagal menambahkan koleksi",

                        error:
                            err.message

                    });
            }


            return res
                .status(201)
                .json({

                    success: true,

                    message:
                        "Koleksi berhasil ditambahkan",

                    id_koleksi:
                        result.insertId,

                    foto:
                        foto

                });
        }
    );
};


// ==================================================
// UPDATE KOLEKSI
// ==================================================

const updateKoleksi = (
    req,
    res
) => {

    const id =
        req.params.id;


    if (
        !id ||
        isNaN(
            Number(id)
        )
    ) {

        return res
            .status(400)
            .json({

                success: false,

                message:
                    "ID koleksi tidak valid"

            });
    }


    const numericId =
        Number(id);


    const {
        nama_koleksi,
        deskripsi,
        status
    } = req.body || {};


    // =================================================
    // VALIDASI
    // =================================================

    if (
        !nama_koleksi ||
        !String(
            nama_koleksi
        ).trim()
    ) {

        return res
            .status(400)
            .json({

                success: false,

                message:
                    "Nama koleksi wajib diisi"

            });
    }


    // =================================================
    // AMBIL DATA LAMA
    // =================================================

    koleksiModel.getKoleksiById(
        numericId,
        (getErr, oldData) => {

            if (getErr) {

                console.error(
                    "GET DATA KOLEKSI LAMA ERROR:",
                    getErr
                );

                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Gagal mengambil data koleksi",

                        error:
                            getErr.message

                    });
            }


            if (!oldData) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Koleksi tidak ditemukan"

                    });
            }


            // =================================================
            // FOTO
            // =================================================

            let foto;


            if (
                req.file
            ) {

                // Foto baru
                foto =
                    `/uploads/koleksi/${req.file.filename}`;

            } else {

                // Pertahankan foto lama
                foto =
                    oldData.foto ||
                    null;

            }


            const data = {

                nama_koleksi:
                    String(
                        nama_koleksi
                    ).trim(),

                foto:
                    foto,

                deskripsi:
                    deskripsi
                        ? String(
                            deskripsi
                          ).trim()
                        : null,

                status:
                    status ||
                    oldData.status ||
                    "Aktif"

            };


            console.log(
                "========================================"
            );

            console.log(
                "UPDATE KOLEKSI:",
                numericId
            );

            console.log(
                "FOTO LAMA:",
                oldData.foto
            );

            console.log(
                "FOTO BARU:",
                req.file
                    ? req.file.filename
                    : "Tidak ada"
            );

            console.log(
                "FOTO FINAL:",
                foto
            );

            console.log(
                "========================================"
            );


            // =================================================
            // UPDATE DATABASE
            // =================================================

            koleksiModel.updateKoleksi(
                numericId,
                data,
                (err, result) => {

                    if (err) {

                        console.error(
                            "UPDATE KOLEKSI ERROR:",
                            err
                        );


                        if (
                            err.code ===
                            "ER_DUP_ENTRY"
                        ) {

                            return res
                                .status(400)
                                .json({

                                    success: false,

                                    message:
                                        "Nama koleksi sudah digunakan"

                                });
                        }


                        return res
                            .status(500)
                            .json({

                                success: false,

                                message:
                                    "Gagal memperbarui koleksi",

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
                                    "Koleksi tidak ditemukan"

                            });
                    }


                    return res
                        .status(200)
                        .json({

                            success: true,

                            message:
                                "Koleksi berhasil diperbarui",

                            foto:
                                foto

                        });
                }
            );
        }
    );
};


// ==================================================
// DELETE KOLEKSI
// ==================================================

const deleteKoleksi = (
    req,
    res
) => {

    const id =
        req.params.id;


    if (
        !id ||
        isNaN(
            Number(id)
        )
    ) {

        return res
            .status(400)
            .json({

                success: false,

                message:
                    "ID koleksi tidak valid"

            });
    }


    koleksiModel.deleteKoleksi(
        Number(id),
        (err, result) => {

            if (err) {

                console.error(
                    "DELETE KOLEKSI ERROR:",
                    err
                );


                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Gagal menghapus koleksi",

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
                            "Koleksi tidak ditemukan"

                    });
            }


            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Koleksi berhasil dihapus"

                });
        }
    );
};


// ==================================================
// EXPORT
// ==================================================

module.exports = {

    getAllKoleksi,

    getKoleksiById,

    createKoleksi,

    updateKoleksi,

    deleteKoleksi

};