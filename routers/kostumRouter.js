const express = require("express");

const router =
    express.Router();

const kostumController =
    require(
        "../controllers/kostumController"
    );

const uploadKostum =
    require(
        "../middleware/uploadKostum"
    );


// ======================================================
// GET SEMUA
// ======================================================

router.get(
    "/",
    kostumController.getKostum
);


// ======================================================
// GET BY ID
// ======================================================

router.get(
    "/:id",
    kostumController.getKostumById
);


// ======================================================
// CREATE
// ======================================================
//
// Field file dari frontend harus bernama:
// "foto"
//

router.post(
    "/",
    uploadKostum.single("foto"),
    kostumController.createKostum
);


// ======================================================
// UPDATE
// ======================================================

router.put(
    "/:id",
    uploadKostum.single("foto"),
    kostumController.updateKostum
);


// ======================================================
// DELETE
// ======================================================

router.delete(
    "/:id",
    kostumController.deleteKostum
);


module.exports = router;