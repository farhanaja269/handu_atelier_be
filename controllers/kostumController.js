const kostumModel =
    require("../models/kostumModel");


// ======================================================
// GET SEMUA
// ======================================================

const getKostum = (
    req,
    res
) => {

    kostumModel.getAllKostum(
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR GET KOSTUM:",
                    err
                );

                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Gagal mengambil data kostum",

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
// GET BY ID
// ======================================================

const getKostumById = (
    req,
    res
) => {

    const id =
        Number(
            req.params.id
        );


    if (
        !id ||
        Number.isNaN(id)
    ) {

        return res
            .status(400)
            .json({

                success: false,

                message:
                    "ID kostum tidak valid"

            });
    }


    kostumModel.getKostumById(
        id,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR GET KOSTUM BY ID:",
                    err
                );

                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Gagal mengambil detail kostum",

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
                            "Kostum tidak ditemukan"

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
// CREATE
// ======================================================

const createKostum = (
    req,
    res
) => {

    const body =
        req.body || {};


    console.log(
        "========== CREATE KOSTUM =========="
    );

    console.log(
        "BODY:",
        body
    );

    console.log(
        "FILE:",
        req.file
            ? req.file.filename
            : "TIDAK ADA"
    );


    // ==================================================
    // VALIDASI KATEGORI
    // ==================================================

    if (
        !body.id_kategori
    ) {

        return res
            .status(400)
            .json({

                success: false,

                message:
                    "Kategori wajib dipilih"

            });
    }


    // ==================================================
    // VALIDASI KOLEKSI
    // ==================================================

    if (
        !body.id_koleksi
    ) {

        return res
            .status(400)
            .json({

                success: false,

                message:
                    "Koleksi wajib dipilih"

            });
    }


    // ==================================================
    // VALIDASI NAMA
    // ==================================================

    if (
        !body.nama_kostum ||
        !String(
            body.nama_kostum
        ).trim()
    ) {

        return res
            .status(400)
            .json({

                success: false,

                message:
                    "Nama kostum wajib diisi"

            });
    }


    // ==================================================
    // FOTO
    // ==================================================

    let foto = null;

    if (req.file) {
    
        /*
         * DATABASE MENYIMPAN
         * PUBLIC URL SUPABASE
         */
    
        foto =
            req.file.publicUrl;
    }

    // ==================================================
    // DATA
    // ==================================================

    const data = {

        id_kategori:
            Number(
                body.id_kategori
            ),

        id_koleksi:
            Number(
                body.id_koleksi
            ),

        kode_koleksi:
            body.kode_koleksi
                ? String(
                    body.kode_koleksi
                  ).trim()
                : null,

        nama_kostum:
            String(
                body.nama_kostum
            ).trim(),

        ukuran:
            body.ukuran || null,

        warna:
            body.warna
                ? String(
                    body.warna
                  ).trim()
                : null,

        stok:
            Number(
                body.stok
            ) || 0,

        harga_sewa:
            Number(
                body.harga_sewa
            ) || 0,

        status:
            body.status ||
            "Tersedia",

        foto:
            foto,

        deskripsi:
            body.deskripsi
                ? String(
                    body.deskripsi
                  ).trim()
                : null,

        featured:
            Number(
                body.featured
            ) === 1
                ? 1
                : 0
    };


    // ==================================================
    // INSERT
    // ==================================================

    kostumModel.createKostum(
        data,
        (err, result) => {

            if (err) {

                console.error(
                    "ERROR CREATE KOSTUM:",
                    err
                );

                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Gagal menambahkan kostum",

                        error:
                            err.message

                    });
            }


            return res
                .status(201)
                .json({

                    success: true,

                    message:
                        "Kostum berhasil ditambahkan",

                    data: {

                        id_kostum:
                            result.insertId,

                        id_kategori:
                            data.id_kategori,

                        id_koleksi:
                            data.id_koleksi,

                        kode_koleksi:
                            data.kode_koleksi,

                        nama_kostum:
                            data.nama_kostum,

                        foto:
                            data.foto

                    }

                });
        }
    );
};


// ======================================================
// UPDATE
// ======================================================

const updateKostum = (
    req,
    res
) => {

    const id =
        Number(
            req.params.id
        );


    if (
        !id ||
        Number.isNaN(id)
    ) {

        return res
            .status(400)
            .json({

                success: false,

                message:
                    "ID kostum tidak valid"

            });
    }


    const body =
        req.body || {};


    // ==================================================
    // AMBIL DATA LAMA
    // ==================================================

    kostumModel.getKostumById(
        id,
        (getErr, rows) => {

            if (getErr) {

                console.error(
                    "ERROR DATA LAMA:",
                    getErr
                );

                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Gagal mengambil data kostum",

                        error:
                            getErr.message

                    });
            }


            if (
                !rows ||
                rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Kostum tidak ditemukan"

                    });
            }


            const oldData =
                rows[0];


            // ==================================================
            // ID KATEGORI
            // ==================================================

            const idKategori =
                body.id_kategori
                    ? Number(
                        body.id_kategori
                      )
                    : oldData.id_kategori;


            // ==================================================
            // ID KOLEKSI
            // ==================================================

            const idKoleksi =
                body.id_koleksi
                    ? Number(
                        body.id_koleksi
                      )
                    : oldData.id_koleksi;


            // ==================================================
            // KODE KOLEKSI
            // ==================================================

            const kodeKoleksi =
                body.kode_koleksi !==
                    undefined &&
                String(
                    body.kode_koleksi
                ).trim() !== ""
                    ? String(
                        body.kode_koleksi
                      ).trim()
                    : oldData.kode_koleksi;


            // ==================================================
            // NAMA KOSTUM
            // ==================================================

            const namaKostum =
                body.nama_kostum !==
                    undefined &&
                String(
                    body.nama_kostum
                ).trim() !== ""
                    ? String(
                        body.nama_kostum
                      ).trim()
                    : oldData.nama_kostum;


            // ==================================================
            // UKURAN
            // ==================================================

            const ukuran =
                body.ukuran ||
                oldData.ukuran ||
                null;


            // ==================================================
            // WARNA
            // ==================================================

            const warna =
                body.warna !==
                    undefined &&
                body.warna !== null
                    ? String(
                        body.warna
                      ).trim()
                    : oldData.warna;


            // ==================================================
            // STOK
            // ==================================================

            const stok =
                body.stok !==
                    undefined &&
                body.stok !== ""
                    ? Number(
                        body.stok
                      ) || 0
                    : Number(
                        oldData.stok
                      ) || 0;


            // ==================================================
            // HARGA
            // ==================================================

            const hargaSewa =
                body.harga_sewa !==
                    undefined &&
                body.harga_sewa !== ""
                    ? Number(
                        body.harga_sewa
                      ) || 0
                    : Number(
                        oldData.harga_sewa
                      ) || 0;


            // ==================================================
            // STATUS
            // ==================================================

            const status =
                body.status ||
                oldData.status ||
                "Tersedia";


            // ==================================================
            // DESKRIPSI
            // ==================================================

            const deskripsi =
                body.deskripsi !==
                    undefined
                    ? String(
                        body.deskripsi
                      ).trim()
                    : oldData.deskripsi;


            // ==================================================
            // FEATURED
            // ==================================================

            const featured =
                body.featured !==
                    undefined
                    ? (
                        Number(
                            body.featured
                        ) === 1
                            ? 1
                            : 0
                    )
                    : (
                        Number(
                            oldData.featured
                        ) === 1
                            ? 1
                            : 0
                    );


            // ==================================================
            // FOTO
            // ==================================================

            let foto;

if (req.file) {

    /*
     * FOTO BARU
     *
     * Simpan URL Supabase ke database.
     */

    foto =
        req.file.publicUrl;

} else {

    /*
     * Tidak ganti foto:
     * pertahankan foto lama.
     */

    foto =
        oldData.foto ||
        null;
}

            // ==================================================
            // DATA FINAL
            // ==================================================

            const data = {

                id_kategori:
                    idKategori,

                id_koleksi:
                    idKoleksi,

                kode_koleksi:
                    kodeKoleksi,

                nama_kostum:
                    namaKostum,

                ukuran:
                    ukuran,

                warna:
                    warna,

                stok:
                    stok,

                harga_sewa:
                    hargaSewa,

                status:
                    status,

                foto:
                    foto,

                deskripsi:
                    deskripsi,

                featured:
                    featured

            };


            console.log(
                "DATA UPDATE:",
                data
            );


            // ==================================================
            // UPDATE
            // ==================================================

            kostumModel.updateKostum(
                id,
                data,
                (err, result) => {

                    if (err) {

                        console.error(
                            "ERROR UPDATE KOSTUM:",
                            err
                        );

                        return res
                            .status(500)
                            .json({

                                success: false,

                                message:
                                    "Gagal mengubah kostum",

                                error:
                                    err.message

                            });
                    }


                    return res
                        .status(200)
                        .json({

                            success: true,

                            message:
                                "Kostum berhasil diperbarui",

                            data: {

                                id_kostum:
                                    id,

                                id_kategori:
                                    data.id_kategori,

                                id_koleksi:
                                    data.id_koleksi,

                                foto:
                                    data.foto

                            }

                        });
                }
            );
        }
    );
};


// ======================================================
// DELETE
// ======================================================

const deleteKostum = (
    req,
    res
) => {

    const id =
        Number(
            req.params.id
        );


    if (
        !id ||
        Number.isNaN(id)
    ) {

        return res
            .status(400)
            .json({

                success: false,

                message:
                    "ID kostum tidak valid"

            });
    }


    kostumModel.deleteKostum(
        id,
        (err, result) => {

            if (err) {

                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Gagal menghapus kostum",

                        error:
                            err.message

                    });
            }


            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Kostum berhasil dihapus"

                });
        }
    );
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getKostum,

    getKostumById,

    createKostum,

    updateKostum,

    deleteKostum

};