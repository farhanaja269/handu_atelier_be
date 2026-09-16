// ======================================================
// routers/dendaRouter.js
// ======================================================

const express = require("express");

const router = express.Router();

const dendaController =
    require("../controllers/dendaController");

// ======================================================
// GET SEMUA DENDA
// GET /denda
// ======================================================

router.get(
    "/",
    dendaController.getDenda
);

// ======================================================
// GET DENDA BERDASARKAN PENGEMBALIAN
// GET /denda/pengembalian/:idPengembalian
// ======================================================

router.get(
    "/pengembalian/:idPengembalian",
    dendaController.getDendaByPengembalian
);

// ======================================================
// GET DENDA BERDASARKAN ID
// GET /denda/:id
// ======================================================

router.get(
    "/:id",
    dendaController.getDendaById
);

// ======================================================
// CREATE DENDA
// POST /denda
// ======================================================

router.post(
    "/",
    dendaController.createDenda
);

// ======================================================
// UPDATE DENDA
// PUT /denda/:id
// ======================================================

router.put(
    "/:id",
    dendaController.updateDenda
);

// ======================================================
// UPDATE STATUS DENDA
// PUT /denda/:id/status
// ======================================================

router.put(
    "/:id/status",
    dendaController.updateStatusDenda
);

// ======================================================
// DELETE DENDA
// DELETE /denda/:id
// ======================================================

router.delete(
    "/:id",
    dendaController.deleteDenda
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;