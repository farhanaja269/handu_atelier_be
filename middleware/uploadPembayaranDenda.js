// ======================================================
// middleware/uploadPembayaranDenda.js
// ======================================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// FOLDER UPLOAD
// ======================================================

const uploadDir =
    path.join(
        __dirname,
        "../uploads/pembayaran-denda"
    );

// Buat folder jika belum ada
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(
        uploadDir,
        {
            recursive: true
        }
    );
}

// ======================================================
// STORAGE
// ======================================================

const storage =
    multer.diskStorage({

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

        filename: (
            req,
            file,
            cb
        ) => {

            const ext =
                path.extname(
                    file.originalname
                ).toLowerCase();

            const name =
                `denda-${Date.now()}-${Math.round(
                    Math.random() * 1E9
                )}${ext}`;

            cb(
                null,
                name
            );
        }
    });

// ======================================================
// FILTER FILE
// ======================================================

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf"
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
                "Format bukti pembayaran tidak diperbolehkan. Gunakan JPG, JPEG, PNG, WEBP, atau PDF."
            ),
            false
        );
    }
};

// ======================================================
// MULTER
// ======================================================

const uploadPembayaranDenda =
    multer({

        storage,

        fileFilter,

        limits: {
            fileSize:
                5 * 1024 * 1024
        }

    });

// ======================================================
// EXPORT
// ======================================================

module.exports =
    uploadPembayaranDenda;