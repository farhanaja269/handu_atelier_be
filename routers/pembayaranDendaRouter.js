// ======================================================
// routers/pembayaranDendaRouter.js
// ======================================================

const express = require("express");

const router = express.Router();

const pembayaranDendaController =
    require("../controllers/pembayaranDendaController");

const uploadPembayaranDenda =
    require("../middleware/uploadPembayaranDenda");

// ======================================================
// GET SEMUA PEMBAYARAN DENDA
// ======================================================

router.get(
    "/",
    pembayaranDendaController.getPembayaranDenda
);

// ======================================================
// GET PEMBAYARAN DENDA BERDASARKAN ID DENDA
// ======================================================

router.get(
    "/denda/:idDenda",
    pembayaranDendaController.getPembayaranDendaByDenda
);

// ======================================================
// GET PEMBAYARAN DENDA BERDASARKAN ID
// ======================================================

router.get(
    "/:id",
    pembayaranDendaController.getPembayaranDendaById
);

// ======================================================
// CREATE PEMBAYARAN DENDA
// ======================================================

router.post(
    "/",
    uploadPembayaranDenda.single("bukti_bayar"),
    pembayaranDendaController.createPembayaranDenda
);

// ======================================================
// UPDATE PEMBAYARAN DENDA
// ======================================================

router.put(
    "/:id",
    uploadPembayaranDenda.single("bukti_bayar"),
    pembayaranDendaController.updatePembayaranDenda
);

// ======================================================
// VERIFIKASI / UPDATE STATUS
// ======================================================

router.put(
    "/:id/status",
    pembayaranDendaController.updateStatusPembayaranDenda
);

// ======================================================
// DELETE
// ======================================================

router.delete(
    "/:id",
    pembayaranDendaController.deletePembayaranDenda
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;