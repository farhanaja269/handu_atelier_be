const express = require("express");
const router = express.Router();

const pembayaranController = require("../controllers/pembayaranController");
const uploadPembayaran = require("../middleware/uploadPembayaran");

// ======================================================
// GET SEMUA PEMBAYARAN
// ======================================================

router.get(
  "/",
  pembayaranController.getPembayaran
);

// ======================================================
// GET PEMBAYARAN BERDASARKAN ID
// ======================================================

router.get(
  "/:id",
  pembayaranController.getPembayaranById
);

// ======================================================
// POST PEMBAYARAN + UPLOAD BUKTI
// ======================================================

router.post(
  "/",
  uploadPembayaran.single("bukti_bayar"),
  pembayaranController.createPembayaran
);

// ======================================================
// UPDATE PEMBAYARAN + UPLOAD BUKTI
// ======================================================

router.put(
  "/:id",
  uploadPembayaran.single("bukti_bayar"),
  pembayaranController.updatePembayaran
);

// ======================================================
// UPDATE STATUS PEMBAYARAN
// ======================================================

router.put(
  "/:id/status",
  pembayaranController.updateStatusPembayaran
);

// ======================================================
// DELETE PEMBAYARAN
// ======================================================

router.delete(
  "/:id",
  pembayaranController.deletePembayaran
);

module.exports = router;