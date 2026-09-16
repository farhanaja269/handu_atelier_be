// routers/detailPeminjamanRouter.js

const express = require("express");
const router = express.Router();

const detailPeminjamanController = require(
    "../controllers/detailPeminjamanController"
);

// ========================================
// GET DETAIL PEMINJAMAN
// GET /detail-peminjaman/:id/:userId
// ========================================

router.get(
    "/:id/:userId",
    detailPeminjamanController.getDetailPeminjamanById
);

// ========================================
// POST DETAIL PEMINJAMAN
// POST /detail-peminjaman
// ========================================

router.post(
    "/",
    detailPeminjamanController.createDetailPeminjaman
);

// ========================================
// EXPORT
// ========================================

module.exports = router;