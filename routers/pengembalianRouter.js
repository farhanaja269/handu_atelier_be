const express = require("express");

const router = express.Router();

const pengembalianController = require(
    "../controllers/pengembalianController"
);

// ========================================
// GET SEMUA PENGEMBALIAN
// ========================================

router.get(
    "/",
    pengembalianController.getPengembalian
);

// ========================================
// GET PEMINJAMAN YANG BELUM DIKEMBALIKAN
// HARUS DILETAKKAN SEBELUM /:id
// ========================================

router.get(
    "/peminjaman-belum-dikembalikan",
    pengembalianController.getPeminjamanBelumDikembalikan
);

// ========================================
// GET PENGEMBALIAN BY ID
// ========================================

router.get(
    "/:id",
    pengembalianController.getPengembalianById
);

// ========================================
// CREATE PENGEMBALIAN
// ========================================

router.post(
    "/",
    pengembalianController.createPengembalian
);

// ========================================
// UPDATE PENGEMBALIAN
// ========================================

router.put(
    "/:id",
    pengembalianController.updatePengembalian
);

// ========================================
// DELETE PENGEMBALIAN
// ========================================

router.delete(
    "/:id",
    pengembalianController.deletePengembalian
);

module.exports = router;