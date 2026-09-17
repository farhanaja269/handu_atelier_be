const express = require("express");

const router = express.Router();

const dokumenJaminanController =
    require("../controllers/dokumenJaminanController");

const uploadDokumenJaminan =
    require("../middleware/uploadDokumenJaminan");


// ======================================================
// GET SEMUA
// ======================================================

router.get(
    "/",
    dokumenJaminanController.getDokumenJaminan
);


// ======================================================
// GET BERDASARKAN PEMINJAMAN
// ======================================================

router.get(
    "/peminjaman/:idPeminjaman",
    dokumenJaminanController.getDokumenJaminanByPeminjaman
);


// ======================================================
// LIHAT FILE
// ======================================================
//
// Contoh:
// /api/dokumen-jaminan/file/12?id_user=5&id_role=3
//

router.get(
    "/file/:id",
    dokumenJaminanController.viewDokumenJaminan
);


// ======================================================
// GET BERDASARKAN ID
// ======================================================

router.get(
    "/:id",
    dokumenJaminanController.getDokumenJaminanById
);


// ======================================================
// UPLOAD DOKUMEN
// ======================================================

router.post(
    "/",
    uploadDokumenJaminan.single("dokumen_jaminan"),
    dokumenJaminanController.createDokumenJaminan
);


// ======================================================
// UPDATE STATUS
// ======================================================

router.put(
    "/:id/status",
    dokumenJaminanController.updateStatusDokumenJaminan
);


// ======================================================
// DELETE
// ======================================================

router.delete(
    "/:id",
    dokumenJaminanController.deleteDokumenJaminan
);


module.exports = router;