// controllers/registrasiController.js

const registrasiModel =
    require("../models/registrasiModel");


// ======================================================
// GET SEMUA REGISTRASI
// ======================================================

const getRegistrasi = (
    req,
    res
) => {

    registrasiModel.getAllRegistrasi(
        (err, result) => {

            if (err) {

                console.error(
                    "Error get registrasi:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data registrasi",
                    error:
                        err.message
                });
            }


            return res.status(200).json({

                success: true,

                message:
                    "Data registrasi berhasil diambil",

                total:
                    result?.length || 0,

                data:
                    result || []

            });
        }
    );
};



// ======================================================
// GET REGISTRASI BERDASARKAN ID USER
// ======================================================

const getRegistrasiById = (
    req,
    res
) => {

    const id =
        req.params.id;


    if (
        !id ||
        isNaN(id)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "ID user tidak valid"

        });
    }


    registrasiModel.getRegistrasiById(
        id,
        (err, result) => {

            if (err) {

                console.error(
                    "Error get registrasi berdasarkan ID:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Terjadi kesalahan saat mengambil data registrasi",

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
                        "Registrasi tidak ditemukan"

                });
            }


            return res.status(200).json({

                success: true,

                message:
                    "Data registrasi berhasil diambil",

                data:
                    result[0]

            });
        }
    );
};



// ======================================================
// CREATE REGISTRASI
// ======================================================

const createRegistrasi = (
    req,
    res
) => {

    const data =
        req.body || {};


    // ==========================================
    // VALIDASI USER
    // ==========================================

    if (
        !data.id_user
    ) {

        return res.status(400).json({

            success: false,

            message:
                "id_user wajib diisi"

        });
    }


    // ==========================================
    // DEFAULT STATUS
    // ==========================================

    data.status =
        data.status ||
        "Menunggu";


    // ==========================================
    // ADMIN BOLEH NULL
    // ==========================================

    data.id_admin =
        data.id_admin ||
        null;


    registrasiModel.createRegistrasi(
        data,
        (err, result) => {

            if (err) {

                console.error(
                    "Error create registrasi:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Registrasi gagal",

                    error:
                        err.message

                });
            }


            return res.status(201).json({

                success: true,

                message:
                    "Registrasi berhasil",

                id_registrasi:
                    result.insertId

            });
        }
    );
};



// ======================================================
// UPDATE REGISTRASI
// ======================================================

const updateRegistrasi = (
    req,
    res
) => {

    const id =
        req.params.id;

    const data =
        req.body || {};


    // ==========================================
    // VALIDASI ID
    // ==========================================

    if (
        !id ||
        isNaN(id)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "ID registrasi tidak valid"

        });
    }


    // ==========================================
    // VALIDASI USER
    // ==========================================

    if (
        !data.id_user
    ) {

        return res.status(400).json({

            success: false,

            message:
                "id_user wajib diisi"

        });
    }


    data.status =
        data.status ||
        "Menunggu";


    data.id_admin =
        data.id_admin ||
        null;


    registrasiModel.updateRegistrasi(
        id,
        data,
        (err, result) => {

            if (err) {

                console.error(
                    "Error update registrasi:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Update gagal",

                    error:
                        err.message

                });
            }


            if (
                !result ||
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Registrasi tidak ditemukan"

                });
            }


            return res.status(200).json({

                success: true,

                message:
                    "Registrasi berhasil diperbarui"

            });
        }
    );
};



// ======================================================
// DELETE REGISTRASI
// ======================================================

const deleteRegistrasi = (
    req,
    res
) => {

    const id =
        req.params.id;


    if (
        !id ||
        isNaN(id)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "ID registrasi tidak valid"

        });
    }


    registrasiModel.deleteRegistrasi(
        id,
        (err, result) => {

            if (err) {

                console.error(
                    "Error delete registrasi:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Hapus gagal",

                    error:
                        err.message

                });
            }


            if (
                !result ||
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Registrasi tidak ditemukan"

                });
            }


            return res.status(200).json({

                success: true,

                message:
                    "Registrasi berhasil dihapus"

            });
        }
    );
};



// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getRegistrasi,

    getRegistrasiById,

    createRegistrasi,

    updateRegistrasi,

    deleteRegistrasi

};