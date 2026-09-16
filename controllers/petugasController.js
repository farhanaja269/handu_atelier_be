const petugasModel = require("../models/petugasModel");

// ==========================================
// GET SEMUA PETUGAS
// ==========================================
const getPetugas = (req, res) => {

    petugasModel.getAllPetugas((err, result) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Gagal mengambil data petugas",
                error: err.message
            });
        }

        res.status(200).json(result);
    });
};


// ==========================================
// GET PETUGAS BY ID
// ==========================================
const getPetugasById = (req, res) => {

    const id = req.params.id;

    petugasModel.getPetugasById(id, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Gagal mengambil data petugas",
                error: err.message
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Petugas tidak ditemukan"
            });
        }

        res.status(200).json(result[0]);
    });
};


// ==========================================
// TAMBAH PETUGAS
// ==========================================
const createPetugas = (req, res) => {

    const data = req.body;

    if (
        !data.nama ||
        !data.email ||
        !data.password
    ) {
        return res.status(400).json({
            message: "Nama, email, dan password wajib diisi"
        });
    }

    petugasModel.createPetugas(data, (err, result) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Gagal menambahkan petugas",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Petugas berhasil ditambahkan",
            id_user: result.insertId
        });
    });
};


// ==========================================
// UPDATE PETUGAS
// ==========================================
const updatePetugas = (req, res) => {

    const id = req.params.id;
    const data = req.body;

    if (!data.nama || !data.email) {
        return res.status(400).json({
            message: "Nama dan email wajib diisi"
        });
    }

    petugasModel.updatePetugas(
        id,
        data,
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Gagal mengubah data petugas",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Petugas tidak ditemukan"
                });
            }

            res.status(200).json({
                message: "Data petugas berhasil diperbarui"
            });
        }
    );
};


// ==========================================
// DELETE PETUGAS
// ==========================================
const deletePetugas = (req, res) => {

    const id = req.params.id;

    petugasModel.deletePetugas(
        id,
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Gagal menghapus petugas",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Petugas tidak ditemukan"
                });
            }

            res.status(200).json({
                message: "Petugas berhasil dihapus"
            });
        }
    );
};


module.exports = {
    getPetugas,
    getPetugasById,
    createPetugas,
    updatePetugas,
    deletePetugas
};