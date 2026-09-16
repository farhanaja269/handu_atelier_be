// routers/peminjamanRouter.js

const express = require("express");
const router = express.Router();

const peminjamanController =
    require("../controllers/peminjamanController");

// ======================================================
// GET SEMUA PEMINJAMAN
// ======================================================

router.get(
    "/",
    peminjamanController.getPeminjaman
);


// ======================================================
// GET DETAIL PEMINJAMAN USER
// GET /api/peminjaman/detail/:id/:id_user
// ======================================================

router.get(
    "/detail/:id/:id_user",
    peminjamanController.getPeminjamanDetailForUser
);


// ======================================================
// GET DETAIL PEMINJAMAN PETUGAS
// GET /api/peminjaman/detail/:id
// ======================================================

router.get(
    "/detail/:id",
    peminjamanController.getPeminjamanDetailForPetugas
);


// ======================================================
// CEK KETERSEDIAAN KOSTUM
// HARUS SEBELUM /:id
//
// GET /api/peminjaman/check-availability
// ======================================================

router.get(
    "/check-availability",
    peminjamanController.checkKostumAvailability
);


// ======================================================
// GET PEMINJAMAN BY ID
// ======================================================

router.get(
    "/:id",
    peminjamanController.getPeminjamanById
);


// ======================================================
// CREATE PEMINJAMAN
// ======================================================

router.post(
    "/",
    peminjamanController.createPeminjaman
);


// ======================================================
// UPDATE STATUS
// ======================================================

router.put(
    "/:id/status",
    peminjamanController.updateStatusPeminjaman
);


// ======================================================
// UPDATE LENGKAP
// ======================================================

router.put(
    "/:id",
    peminjamanController.updatePeminjaman
);


// ======================================================
// DELETE
// ======================================================

router.delete(
    "/:id",
    peminjamanController.deletePeminjaman
);


module.exports = router;