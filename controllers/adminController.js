const adminModel = require("../models/adminModel");
const usersModel = require("../models/usersModel");
const bcrypt = require("bcryptjs");

// ========================================
// GET SEMUA ADMIN
// ========================================
const getAdmin = (req, res) => {

    adminModel.getAllAdmin((err, result) => {

        if (err) {

            console.error(
                "GET ADMIN ERROR:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data admin",
                error: err.message
            });

        }

        return res.json({
            success: true,
            message: "Data admin berhasil diambil",
            total: result.length,
            data: result
        });

    });

};


// ========================================
// GET ADMIN BERDASARKAN ID
// ========================================
const getAdminById = (req, res) => {

    const id = req.params.id;

    adminModel.getAdminById(
        id,
        (err, result) => {

            if (err) {

                console.error(
                    "GET ADMIN BY ID ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Gagal mengambil data admin",
                    error: err.message
                });

            }


            if (result.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Admin tidak ditemukan"
                });

            }


            return res.json({
                success: true,
                message: "Data admin berhasil ditemukan",
                data: result[0]
            });

        }
    );

};


// ========================================
// CREATE ADMIN
// ========================================
const createAdmin = (req, res) => {

    const {
        nama,
        no_whatsapp
    } = req.body;


    if (!nama || !nama.trim()) {

        return res.status(400).json({
            success: false,
            message: "Nama admin wajib diisi"
        });

    }


    if (!no_whatsapp || !no_whatsapp.trim()) {

        return res.status(400).json({
            success: false,
            message: "Nomor WhatsApp wajib diisi"
        });

    }


    const data = {

        nama: nama.trim(),

        no_whatsapp:
            no_whatsapp.trim()

    };


    adminModel.createAdmin(
        data,
        (err, result) => {

            if (err) {

                console.error(
                    "CREATE ADMIN ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Gagal menambahkan admin",
                    error: err.message
                });

            }


            return res.status(201).json({
                success: true,
                message: "Admin berhasil ditambahkan",
                id_admin: result.insertId
            });

        }
    );

};


// ========================================
// UPDATE ADMIN
// ========================================
const updateAdmin = (req, res) => {

    const id = req.params.id;

    const {
        nama,
        no_whatsapp
    } = req.body;


    if (!nama || !nama.trim()) {

        return res.status(400).json({
            success: false,
            message: "Nama admin wajib diisi"
        });

    }


    if (!no_whatsapp || !no_whatsapp.trim()) {

        return res.status(400).json({
            success: false,
            message: "Nomor WhatsApp wajib diisi"
        });

    }


    const data = {

        nama: nama.trim(),

        no_whatsapp:
            no_whatsapp.trim()

    };


    adminModel.updateAdmin(
        id,
        data,
        (err, result) => {

            if (err) {

                console.error(
                    "UPDATE ADMIN ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Gagal memperbarui admin",
                    error: err.message
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Admin tidak ditemukan"
                });

            }


            return res.json({
                success: true,
                message: "Admin berhasil diperbarui"
            });

        }
    );

};


// ========================================
// DELETE ADMIN
// ========================================
const deleteAdmin = (req, res) => {

    const id = req.params.id;


    adminModel.deleteAdmin(
        id,
        (err, result) => {

            if (err) {

                console.error(
                    "DELETE ADMIN ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Gagal menghapus admin",
                    error: err.message
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Admin tidak ditemukan"
                });

            }


            return res.json({
                success: true,
                message: "Admin berhasil dihapus"
            });

        }
    );

};


// ========================================
// LOGIN ADMIN
// DATA DIAMBIL DARI TABLE users
// ========================================

const login = (req, res) => {

    const {
        email,
        password
    } = req.body;


    // ========================================
    // VALIDASI EMAIL
    // ========================================

    if (
        typeof email !== "string" ||
        !email.trim()
    ) {

        return res.status(400).json({
            success: false,
            message: "Email admin wajib diisi"
        });

    }


    // ========================================
    // VALIDASI PASSWORD
    // ========================================

    if (
        typeof password !== "string" ||
        !password
    ) {

        return res.status(400).json({
            success: false,
            message: "Password wajib diisi"
        });

    }


    const emailLogin =
        email.trim().toLowerCase();


    // ========================================
    // LOGIN KE MODEL
    // ========================================

    adminModel.loginAdmin(
        emailLogin,
        password,
        (err, result) => {

            if (err) {

                console.error(
                    "LOGIN ADMIN ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Gagal melakukan login"
                });

            }


            // ========================================
            // LOGIN GAGAL
            // ========================================

            if (
                !result ||
                result.length === 0
            ) {

                return res.status(401).json({
                    success: false,
                    message: "Email atau password salah."
                });

            }


            // ========================================
            // LOGIN BERHASIL
            // ========================================

            return res.status(200).json({

                success: true,

                message:
                    "Login admin berhasil",

                data: result[0]

            });

        }
    );

};

// ========================================
// EXPORT
// ========================================
module.exports = {

    getAdmin,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    login

};