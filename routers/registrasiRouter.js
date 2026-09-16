// routers/registrasiRouter.js

const express = require("express");

const router =
    express.Router();

const registrasiController =
    require("../controllers/registrasiController");


// ======================================================
// GET SEMUA REGISTRASI
// ======================================================

router.get(
    "/",
    registrasiController.getRegistrasi
);


// ======================================================
// GET BERDASARKAN ID USER
// ======================================================

router.get(
    "/:id",
    registrasiController.getRegistrasiById
);


// ======================================================
// CREATE
// ======================================================

router.post(
    "/",
    registrasiController.createRegistrasi
);


// ======================================================
// UPDATE
// ======================================================

router.put(
    "/:id",
    registrasiController.updateRegistrasi
);


// ======================================================
// DELETE
// ======================================================

router.delete(
    "/:id",
    registrasiController.deleteRegistrasi
);


module.exports = router;