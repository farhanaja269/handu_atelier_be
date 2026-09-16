const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// FOLDER UPLOAD
// ======================================================

const uploadDir = path.join(__dirname, "../uploads/pembayaran");

// Buat folder jika belum ada
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
        const originalName = path.basename(file.originalname);

        const extension = path
            .extname(originalName)
            .toLowerCase();

        const baseName = path.basename(
            originalName,
            path.extname(originalName)
        );

        const cleanName = baseName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+/g, "")
            .replace(/-+$/g, "");

        // Tambahkan timestamp agar nama file tidak bentrok
        const finalName =
            `${Date.now()}-${cleanName}${extension}`;

        console.log("======================================");
        console.log("UPLOAD BUKTI PEMBAYARAN");
        console.log("Original:", file.originalname);
        console.log("Final:", finalName);
        console.log("Folder:", uploadDir);
        console.log("======================================");

        cb(null, finalName);
    }
});

// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Format bukti pembayaran harus JPG, JPEG, PNG, atau WEBP."
            ),
            false
        );
    }
};

// ======================================================
// MULTER
// ======================================================

const uploadPembayaran = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// ======================================================
// EXPORT
// ======================================================

module.exports = uploadPembayaran;