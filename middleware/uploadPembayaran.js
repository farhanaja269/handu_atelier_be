const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// FOLDER UPLOAD
// ======================================================

const uploadDir = path.join(
    process.cwd(),
    "uploads",
    "pembayaran"
);

// ======================================================
// BUAT FOLDER OTOMATIS
// ======================================================

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

// ======================================================
// STORAGE
// ======================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const ext = path
            .extname(file.originalname)
            .toLowerCase();

        const originalName = path
            .basename(
                file.originalname,
                ext
            )
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            );

        const filename =
            `${Date.now()}-${Math.round(
                Math.random() * 1000000000
            )}-${originalName}${ext}`;

        cb(null, filename);
    }
});

// ======================================================
// VALIDASI FILE
// ======================================================

const fileFilter = (
    req,
    file,
    cb
) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf"
    ];

    const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".pdf"
    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (
        allowedMimeTypes.includes(
            file.mimetype
        ) &&
        allowedExtensions.includes(
            extension
        )
    ) {
        return cb(
            null,
            true
        );
    }

    return cb(
        new Error(
            "Bukti pembayaran harus berupa JPG, JPEG, PNG, WEBP, atau PDF."
        )
    );
};

// ======================================================
// MULTER
// ======================================================

const uploadPembayaran = multer({
    storage,
    fileFilter,

    limits: {
        fileSize:
            5 * 1024 * 1024
    }
});

module.exports =
    uploadPembayaran;