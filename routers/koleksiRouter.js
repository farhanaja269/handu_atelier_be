const express = require("express");

const router =
    express.Router();


const koleksiController =
    require(
        "../controllers/koleksiController"
    );


const uploadKoleksi =
    require(
        "../middleware/uploadKoleksi"
    );


// ==================================================
// GET SEMUA
// ==================================================

router.get(
    "/",
    koleksiController.getAllKoleksi
);


// ==================================================
// GET BY ID
// ==================================================

router.get(
    "/:id",
    koleksiController.getKoleksiById
);


// ==================================================
// CREATE
// ==================================================

router.post(
    "/",
    uploadKoleksi.single("foto"),
    koleksiController.createKoleksi
);


// ==================================================
// UPDATE
// ==================================================

router.put(
    "/:id",
    uploadKoleksi.single("foto"),
    koleksiController.updateKoleksi
);


// ==================================================
// DELETE
// ==================================================

router.delete(
    "/:id",
    koleksiController.deleteKoleksi
);


module.exports = router;