// ======================================================
// routers/pengembalianDanaRouter.js
// ======================================================

const express = require("express");

const router = express.Router();

const pengembalianDanaController =
    require("../controllers/pengembalianDanaController");


// ======================================================
// GET SEMUA PENGEMBALIAN DANA
// ======================================================

router.get(
    "/",
    pengembalianDanaController.getPengembalianDana
);


// ======================================================
// GET PENGEMBALIAN DANA BERDASARKAN ID PEMINJAMAN
// ======================================================

router.get(
    "/peminjaman/:idPeminjaman",
    pengembalianDanaController.getPengembalianDanaByPeminjaman
);


// ======================================================
// GET PENGEMBALIAN DANA BERDASARKAN ID
// ======================================================

router.get(
    "/:id",
    pengembalianDanaController.getPengembalianDanaById
);


// ======================================================
// CREATE PENGEMBALIAN DANA
// ======================================================

router.post(
    "/",
    pengembalianDanaController.createPengembalianDana
);


// ======================================================
// UPDATE DATA PENGEMBALIAN DANA
// ======================================================

router.put(
    "/:id",
    pengembalianDanaController.updatePengembalianDana
);


// ======================================================
// UPDATE STATUS PENGEMBALIAN DANA
// ======================================================

router.put(
    "/:id/status",
    pengembalianDanaController.updateStatusPengembalianDana
);


// ======================================================
// DELETE PENGEMBALIAN DANA
// ======================================================

router.delete(
    "/:id",
    pengembalianDanaController.deletePengembalianDana
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;