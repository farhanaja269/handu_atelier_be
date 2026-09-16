const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==================================================
// FOLDER UPLOAD
// ==================================================

const uploadDir = path.join(
    __dirname,
    "../uploads/kostum"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

// ==================================================
// FUNGSI BERSIHKAN NAMA FILE
// ==================================================

const sanitizeFileName = (name) => {
    return name
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

// ==================================================
// STORAGE MULTER
// ==================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {

        let namaKostum = req.body.nama_kostum;

        // Jika nama kostum tersedia
        if (namaKostum) {

            const cleanName =
                sanitizeFileName(namaKostum);

            const ext =
                path.extname(file.originalname)
                    .toLowerCase();

            cb(
                null,
                `${cleanName}${ext}`
            );

            return;
        }

        // ==================================================
        // FALLBACK
        // Jika nama_kostum belum terbaca
        // ==================================================

        const originalName =
            path.basename(
                file.originalname,
                path.extname(file.originalname)
            );

        const cleanName =
            sanitizeFileName(originalName);

        const ext =
            path.extname(file.originalname)
                .toLowerCase();

        cb(
            null,
            `${cleanName}${ext}`
        );
    }
});

// ==================================================
// FILTER FILE
// ==================================================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {
        cb(null, true);
    } else {

        cb(
            new Error(
                "Format foto harus JPG, JPEG, PNG, atau WEBP"
            ),
            false
        );
    }
};

// ==================================================
// MULTER
// ==================================================

const uploadKostum = multer({

    storage,

    fileFilter,

    limits: {
        fileSize:
            5 * 1024 * 1024
    }

});

// ==================================================
// EXPORT
// ==================================================

module.exports = uploadKostum;