// routers/kostumRouter.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const kostumController = require(
    "../controllers/kostumController"
);

// ==================================================
// FOLDER UPLOAD
// ==================================================

const uploadDir = path.join(
    __dirname,
    "../uploads/kostum"
);

// Buat folder otomatis jika belum ada
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(
        uploadDir,
        {
            recursive: true
        }
    );
}

// ==================================================
// KONFIGURASI STORAGE
// ==================================================

const storage = multer.diskStorage({

    // ==================================================
    // DESTINATION
    // ==================================================

    destination: (
        req,
        file,
        cb
    ) => {

        cb(
            null,
            uploadDir
        );

    },

    // ==================================================
    // FILENAME
    // ==================================================

    filename: (
        req,
        file,
        cb
    ) => {

        // Ambil ekstensi file
        const ext =
            path
                .extname(
                    file.originalname
                )
                .toLowerCase();

        // Ambil nama file tanpa ekstensi
        const originalName =
            path
                .basename(
                    file.originalname,
                    ext
                )

                // Ganti spasi / karakter aneh
                // menjadi tanda -
                .replace(
                    /[^a-zA-Z0-9]/g,
                    "-"
                )

                // Ubah menjadi huruf kecil
                .toLowerCase()

                // Hindari tanda - berulang
                .replace(
                    /-+/g,
                    "-"
                )

                // Hilangkan - di awal
                .replace(
                    /^-+/,
                    ""
                )

                // Hilangkan - di akhir
                .replace(
                    /-+$/,
                    ""
                );

        // ==================================================
        // NAMA FILE TANPA TIMESTAMP
        // ==================================================

        const filename =
            `${originalName}${ext}`;

        console.log(
            "NAMA FILE UPLOAD:",
            filename
        );

        cb(
            null,
            filename
        );
    }
});

// ==================================================
// FILTER FILE
// ==================================================

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {

        cb(
            null,
            true
        );

    } else {

        cb(
            new Error(
                "Format foto harus JPG, JPEG, PNG, atau WEBP."
            ),
            false
        );

    }
};

// ==================================================
// MULTER
// ==================================================

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize:
            5 * 1024 * 1024
    }

});

// ==================================================
// MIDDLEWARE UPLOAD
// Supaya error multer tetap JSON
// ==================================================

const uploadFoto = (
    req,
    res,
    next
) => {

    upload.single("foto")(
        req,
        res,
        (err) => {

            if (err) {

                console.error(
                    "ERROR UPLOAD FOTO:",
                    err
                );

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            err.message ||
                            "Gagal mengupload foto."
                    });

            }

            next();

        }
    );

};

// ==================================================
// GET SEMUA KOSTUM
// GET /api/kostum
// ==================================================

router.get(
    "/",
    kostumController.getKostum
);

// ==================================================
// GET KOSTUM BY ID
// GET /api/kostum/:id
// ==================================================

router.get(
    "/:id",
    kostumController.getKostumById
);

// ==================================================
// CREATE KOSTUM
// POST /api/kostum
// ==================================================

router.post(
    "/",
    uploadFoto,
    kostumController.createKostum
);

// ==================================================
// UPDATE KOSTUM
// PUT /api/kostum/:id
// ==================================================

router.put(
    "/:id",
    uploadFoto,
    kostumController.updateKostum
);

// ==================================================
// DELETE KOSTUM
// DELETE /api/kostum/:id
// ==================================================

router.delete(
    "/:id",
    kostumController.deleteKostum
);

// ==================================================
// EXPORT
// ==================================================

module.exports = router;