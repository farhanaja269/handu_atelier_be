// controllers/usersController.js

const usersModel = require("../models/usersModel");
const registrasiModel = require("../models/registrasiModel");
const bcrypt = require("bcryptjs");

// ========================================
// GET SEMUA USER
// ========================================

const getUsers = (req, res) => {
    usersModel.getAllUsers((err, result) => {
        if (err) {
            console.error("Error getUsers:", err);

            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data user",
                error: err.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "Data user berhasil diambil",
            total: result?.length || 0,
            data: result || []
        });
    });
};

// ========================================
// GET USER BERDASARKAN ID
// ========================================

const getUserById = (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "ID user tidak valid"
        });
    }

    usersModel.getUserById(id, (err, result) => {
        if (err) {
            console.error("Error getUserById:", err);

            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server",
                error: err.message
            });
        }

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User ditemukan",
            data: result[0]
        });
    });
};

// ========================================
// LOGIN USER
// ========================================

const loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email dan password wajib diisi"
        });
    }

    usersModel.loginUser(
        email,
        (err, result) => {
            if (err) {
                console.error("Error login:", err);

                return res.status(500).json({
                    success: false,
                    message: "Terjadi kesalahan saat login",
                    error: err.message
                });
            }

            if (!result || result.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Email atau password salah"
                });
            }

            const user = result[0];

            const isPasswordValid =
                bcrypt.compareSync(
                    password,
                    user.password
                );

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Email atau password salah"
                });
            }

            // Jangan kirim password ke frontend
            delete user.password;

            return res.status(200).json({
                success: true,
                message: "Login berhasil",
                data: user
            });
        }
    );
};

// ========================================
// CHANGE PASSWORD
// ========================================

const changePassword = (req, res) => {
    const {
        id_user,
        password_lama,
        password_baru
    } = req.body;

    if (!id_user || isNaN(id_user)) {
        return res.status(400).json({
            success: false,
            message: "ID user tidak valid"
        });
    }

    if (!password_lama || !password_baru) {
        return res.status(400).json({
            success: false,
            message:
                "Password lama dan password baru wajib diisi"
        });
    }

    if (password_baru.length < 6) {
        return res.status(400).json({
            success: false,
            message:
                "Password baru minimal 6 karakter"
        });
    }

    usersModel.getUserPassword(
        id_user,
        (err, result) => {

            if (err) {
                console.error(
                    "Error getUserPassword:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal memverifikasi password",
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
                        "User tidak ditemukan"
                });
            }

            const user = result[0];

            const passwordValid =
                bcrypt.compareSync(
                    password_lama,
                    user.password
                );

            if (!passwordValid) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Password lama salah"
                });
            }

            const hashedPassword =
                bcrypt.hashSync(
                    password_baru,
                    10
                );

            usersModel.updatePassword(
                id_user,
                hashedPassword,
                (
                    updateErr,
                    updateResult
                ) => {

                    if (updateErr) {
                        console.error(
                            "Error updatePassword:",
                            updateErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal mengubah password",
                            error:
                                updateErr.message
                        });
                    }

                    if (
                        updateResult.affectedRows === 0
                    ) {
                        return res.status(404).json({
                            success: false,
                            message:
                                "User tidak ditemukan"
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message:
                            "Password berhasil diubah"
                    });
                }
            );
        }
    );
};

// ========================================
// CREATE USER
// ========================================

const createUser = (req, res) => {
    const {
        nama,
        email,
        password,
        no_hp,
        alamat,
        id_role
    } = req.body;

    // ========================================
    // VALIDASI
    // ========================================

    if (!nama || !email || !password) {
        return res.status(400).json({
            success: false,
            message:
                "Nama, email, dan password wajib diisi"
        });
    }

    // ========================================
    // VALIDASI EMAIL
    // ========================================

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message:
                "Format email tidak valid"
        });
    }

    // ========================================
    // TENTUKAN ROLE
    // ========================================

    /*
     * Role:
     * 1 = Admin
     * 2 = Petugas
     * 3 = Pelanggan
     *
     * Register.jsx mengirim id_role = 3
     * untuk akun pelanggan baru.
     */

    const finalRole =
        Number(id_role || 2);

    // ========================================
    // HASH PASSWORD
    // ========================================

    const saltRounds = 10;

    const hashedPassword =
        bcrypt.hashSync(
            password,
            saltRounds
        );

    // ========================================
    // DATA USER
    // ========================================

    const data = {
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        no_hp:
            no_hp
                ? no_hp.trim()
                : null,
        alamat:
            alamat
                ? alamat.trim()
                : null,
        id_role: finalRole
    };

    // ========================================
    // LOG USER BARU
    // ========================================

    console.log("");
    console.log(
        "========================================"
    );
    console.log(
        "          CREATE USER BARU"
    );
    console.log(
        "========================================"
    );
    console.log(
        "Nama    :",
        data.nama
    );
    console.log(
        "Email   :",
        data.email
    );
    console.log(
        "No HP   :",
        data.no_hp
    );
    console.log(
        "Alamat  :",
        data.alamat
    );
    console.log(
        "ID Role :",
        data.id_role
    );
    console.log(
        "========================================"
    );

    // ========================================
    // INSERT USER
    // ========================================

    usersModel.createUser(
        data,
        (err, result) => {

            // ========================================
            // ERROR CREATE USER
            // ========================================

            if (err) {
                console.error(
                    "Error createUser:",
                    err
                );

                if (
                    err.code ===
                    "ER_DUP_ENTRY"
                ) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "Email sudah terdaftar"
                    });
                }

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal menambahkan user",
                    error:
                        err.message
                });
            }

            // ========================================
            // ID USER BARU
            // ========================================

            const idUser =
                result.insertId;

            console.log("");
            console.log(
                "User berhasil dibuat."
            );
            console.log(
                "ID User baru :",
                idUser
            );

            // ========================================
            // JIKA ROLE = 3
            // BUAT REGISTRASI OTOMATIS
            // ========================================

            if (finalRole === 3) {

                console.log("");
                console.log(
                    "========================================"
                );
                console.log(
                    "     MEMBUAT DATA REGISTRASI"
                );
                console.log(
                    "========================================"
                );
                console.log(
                    "ID User :",
                    idUser
                );
                console.log(
                    "Nama    :",
                    data.nama
                );
                console.log(
                    "Status  :",
                    "Menunggu"
                );
                console.log(
                    "========================================"
                );

                const registrationData = {
                    id_user: idUser,
                    id_admin: null,
                    status: "Menunggu"
                };

                // ========================================
                // INSERT REGISTRASI
                // ========================================

                registrasiModel.createRegistrasi(
                    registrationData,
                    (
                        registrationErr,
                        registrationResult
                    ) => {

                        // ========================================
                        // ERROR REGISTRASI
                        // ========================================

                        if (registrationErr) {

                            console.error("");
                            console.error(
                                "========================================"
                            );
                            console.error(
                                "ERROR CREATE REGISTRASI"
                            );
                            console.error(
                                "========================================"
                            );
                            console.error(
                                registrationErr
                            );
                            console.error(
                                "========================================"
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "User berhasil dibuat, tetapi data registrasi gagal dibuat",
                                error:
                                    registrationErr.message,
                                data: {
                                    id_user:
                                        idUser
                                }
                            });
                        }

                        // ========================================
                        // REGISTRASI BERHASIL
                        // ========================================

                        console.log("");
                        console.log(
                            "========================================"
                        );
                        console.log(
                            "   REGISTRASI PELANGGAN BERHASIL"
                        );
                        console.log(
                            "========================================"
                        );
                        console.log(
                            "ID User       :",
                            idUser
                        );
                        console.log(
                            "ID Registrasi :",
                            registrationResult.insertId
                        );
                        console.log(
                            "Nama          :",
                            data.nama
                        );
                        console.log(
                            "Status        :",
                            "Menunggu"
                        );
                        console.log(
                            "========================================"
                        );
                        console.log("");

                        return res.status(201).json({
                            success: true,
                            message:
                                "User dan registrasi berhasil dibuat",
                            data: {
                                id_user:
                                    idUser,
                                id_registrasi:
                                    registrationResult.insertId,
                                nama:
                                    data.nama,
                                email:
                                    data.email,
                                id_role:
                                    finalRole,
                                status:
                                    "Menunggu"
                            }
                        });
                    }
                );

                return;
            }

            // ========================================
            // BUKAN ROLE 3
            // TIDAK BUAT REGISTRASI
            // ========================================

            console.log(
                "Role bukan pelanggan."
            );

            console.log(
                "Data registrasi pelanggan tidak dibuat."
            );

            console.log("");

            return res.status(201).json({
                success: true,
                message:
                    "User berhasil ditambahkan",
                data: {
                    id_user:
                        idUser,
                    nama:
                        data.nama,
                    email:
                        data.email,
                    id_role:
                        finalRole
                }
            });
        }
    );
};

// ========================================
// UPDATE USER
// ========================================

const updateUser = (req, res) => {
    const id = req.params.id;

    const {
        nama,
        email,
        no_hp,
        alamat,
        id_role,
        password
    } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message:
                "ID user tidak valid"
        });
    }

    if (
        !nama &&
        !email &&
        !no_hp &&
        !alamat &&
        !id_role &&
        !password
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Minimal satu field harus diisi untuk update"
        });
    }

    let hashedPassword = null;

    if (password) {
        hashedPassword =
            bcrypt.hashSync(
                password,
                10
            );
    }

    const data = {
        nama,
        email:
            email
                ? email.toLowerCase()
                : undefined,
        no_hp,
        alamat,
        id_role,
        password:
            hashedPassword
    };

    usersModel.updateUser(
        id,
        data,
        (err, result) => {

            if (err) {
                console.error(
                    "Error updateUser:",
                    err
                );

                if (
                    err.code ===
                    "ER_DUP_ENTRY"
                ) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "Email sudah digunakan oleh user lain"
                    });
                }

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengubah user",
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
                        "User tidak ditemukan"
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "User berhasil diperbarui"
            });
        }
    );
};

// ========================================
// DELETE USER
// ========================================

const deleteUser = (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message:
                "ID user tidak valid"
        });
    }

    usersModel.deleteUser(
        id,
        (err, result) => {

            if (err) {
                console.error(
                    "Error deleteUser:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal menghapus user",
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
                        "User tidak ditemukan"
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "User berhasil dihapus"
            });
        }
    );
};

// ========================================
// SEARCH USER
// ========================================

const searchUsers = (req, res) => {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({
            success: false,
            message:
                "Kata kunci pencarian wajib diisi"
        });
    }

    usersModel.searchUsers(
        keyword,
        (err, result) => {

            if (err) {
                console.error(
                    "Error searchUsers:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mencari user",
                    error:
                        err.message
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Hasil pencarian",
                total:
                    result?.length || 0,
                data:
                    result || []
            });
        }
    );
};

// ========================================
// GET USERS BY ROLE
// ========================================

const getUsersByRole = (req, res) => {
    const { roleId } = req.params;

    if (
        !roleId ||
        isNaN(roleId)
    ) {
        return res.status(400).json({
            success: false,
            message:
                "ID role tidak valid"
        });
    }

    usersModel.getUsersByRole(
        roleId,
        (err, result) => {

            if (err) {
                console.error(
                    "Error getUsersByRole:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data user",
                    error:
                        err.message
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Data user berdasarkan role",
                total:
                    result?.length || 0,
                data:
                    result || []
            });
        }
    );
};

// ========================================
// GET TOTAL USER
// ========================================

const getTotalUsers = (req, res) => {
    usersModel.getTotalUsers(
        (err, total) => {

            if (err) {
                console.error(
                    "Error getTotalUsers:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil total user",
                    error:
                        err.message
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Total user",
                total:
                    total || 0
            });
        }
    );
};

// ========================================
// GET DETAIL CUSTOMER + RIWAYAT
// ========================================

const getCustomerDetail = (
    req,
    res
) => {

    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message:
                "ID user tidak valid"
        });
    }

    usersModel.getCustomerDetail(
        id,
        (err, result) => {

            if (err) {
                console.error(
                    "Error getCustomerDetail:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil detail customer",
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
                        "Customer tidak ditemukan"
                });
            }

            return res.status(200).json({
                success: true,
                data: result
            });
        }
    );
};

// ========================================
// GET SEMUA ADMIN
// ========================================

const getAdmins = (req, res) => {

    usersModel.getAdmins(
        (err, result) => {

            if (err) {
                console.error(
                    "Error getAdmins:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data admin",
                    error:
                        err.message
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Data admin berhasil diambil",
                total:
                    result?.length || 0,
                data:
                    result || []
            });
        }
    );
};

// ========================================
// EXPORT
// ========================================

module.exports = {
    getUsers,
    getUserById,
    getCustomerDetail,
    loginUser,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    getUsersByRole,
    getAdmins,
    getTotalUsers,
    changePassword
};