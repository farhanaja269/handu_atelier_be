const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'dokumen-jaminan');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '-')
            .toLowerCase();

        cb(null, `${Date.now()}-${name}${ext}`);
    }
});

const fileFilter = function (req, file, cb) {
    const allowedExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.pdf'
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak diperbolehkan. Gunakan JPG, JPEG, PNG, atau PDF.'));
    }
};

const uploadDokumenJaminan = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = uploadDokumenJaminan;