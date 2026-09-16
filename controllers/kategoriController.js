const kategoriModel = require("../models/kategoriModel");

const getKategori = (req, res) => {

    kategoriModel.getAllKategori((err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

};

const getKategoriById = (req, res) => {

    const id = req.params.id;

    kategoriModel.getKategoriById(id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Kategori tidak ditemukan"
            });
        }

        res.json(result[0]);

    });

}

const createKategori = (req, res) => {

    const data = req.body;

    kategoriModel.createKategori(data, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.status(201).json({
            message: "Kategori berhasil ditambahkan",
            id: result.insertId
        });

    });

};

const updateKategori = (req, res) => {

    const id = req.params.id;
    const data = req.body;

    kategoriModel.updateKategori(id, data, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Kategori tidak ditemukan"
            });
        }

        res.json({
            message: "Kategori berhasil diupdate"
        });

    });

};

const deleteKategori = (req, res) => {

    const id = req.params.id;

    kategoriModel.deleteKategori(id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Kategori tidak ditemukan"
            });
        }

        res.json({
            message: "Kategori berhasil dihapus"
        });

    });

};

module.exports = {
    getKategori,
    getKategoriById,
    createKategori,
    updateKategori,
    deleteKategori
};