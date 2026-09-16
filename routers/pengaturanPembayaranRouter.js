const express = require("express");

const router = express.Router();

const pengaturanPembayaranController =
    require("../controllers/pengaturanPembayaranController");

const uploadQris =
    require("../middleware/uploadQris");


// ======================================================
// GET SEMUA PENGATURAN PEMBAYARAN
// ======================================================

router.get(
    "/",
    pengaturanPembayaranController
        .getAllPengaturanPembayaran
);


// ======================================================
// GET QRIS AKTIF
// ======================================================
// Harus diletakkan sebelum /:id
// supaya "qris-aktif" tidak dianggap sebagai ID.

router.get(
    "/qris-aktif",
    pengaturanPembayaranController
        .getQrisAktif
);


// ======================================================
// GET BY ID
// ======================================================

router.get(
    "/:id",
    pengaturanPembayaranController
        .getPengaturanPembayaranById
);


// ======================================================
// CREATE
// ======================================================

router.post(
    "/",
    uploadQris.single("qris"),
    pengaturanPembayaranController
        .createPengaturanPembayaran
);


// ======================================================
// UPDATE SEMUA DATA
// ======================================================

router.put(
    "/:id",
    uploadQris.single("qris"),
    pengaturanPembayaranController
        .updatePengaturanPembayaran
);


// ======================================================
// UPDATE QRIS SAJA
// ======================================================

router.put(
    "/:id/qris",
    uploadQris.single("qris"),
    pengaturanPembayaranController
        .updateQris
);


// ======================================================
// UPDATE DATA REKENING BANK
// ======================================================

router.put(
    "/:id/bank",
    pengaturanPembayaranController
        .updateBank
);


// ======================================================
// UPDATE STATUS
// ======================================================

router.put(
    "/:id/status",
    pengaturanPembayaranController
        .updateStatusPengaturanPembayaran
);


// ======================================================
// DELETE
// ======================================================

router.delete(
    "/:id",
    pengaturanPembayaranController
        .deletePengaturanPembayaran
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;