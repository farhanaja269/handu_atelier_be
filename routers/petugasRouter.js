const express = require("express");

const router = express.Router();

const petugasController =
    require("../controllers/petugasController");


router.get(
    "/",
    petugasController.getPetugas
);


router.get(
    "/:id",
    petugasController.getPetugasById
);


router.post(
    "/",
    petugasController.createPetugas
);


router.put(
    "/:id",
    petugasController.updatePetugas
);


router.delete(
    "/:id",
    petugasController.deletePetugas
);


module.exports = router;