const multer = require("multer");
const path = require("path");
const supabase = require("../config/supabase");

// ======================================================
// STORAGE
// ======================================================

const storage = multer.memoryStorage();

// ======================================================
// GENERATE FILE NAME
// ======================================================

const generateFileName = (originalName) => {
    const safeOriginalName =
        path.basename(originalName);

    const extension =
        path.extname(safeOriginalName)
            .toLowerCase();

    const baseName =
        path.basename(
            safeOriginalName,
            path.extname(safeOriginalName)
        );

    const cleanName =
        baseName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+/g, "")
            .replace(/-+$/g, "");

    return `bukti-${cleanName || "pembayaran"}-${Date.now()}-${Math.round(
        Math.random() * 1000000000
    )}${extension}`;
};

// ======================================================
// UPLOAD KE SUPABASE
// ======================================================

const uploadPembayaranToSupabase = async (
    req,
    res,
    next
) => {
    try {
        if (!req.file) {
            return next();
        }

        const fileName =
            generateFileName(
                req.file.originalname
            );

        console.log(
            "======================================"
        );

        console.log(
            "UPLOAD BUKTI PEMBAYARAN"
        );

        console.log(
            "Original:",
            req.file.originalname
        );

        console.log(
            "Final:",
            fileName
        );

        console.log(
            "Bucket:",
            "bukti-pembayaran"
        );

        console.log(
            "======================================"
        );

        const { error } =
            await supabase.storage
                .from("bukti-pembayaran")
                .upload(
                    fileName,
                    req.file.buffer,
                    {
                        contentType:
                            req.file.mimetype,

                        upsert: true,
                    }
                );

        if (error) {
            console.error(
                "SUPABASE UPLOAD BUKTI PEMBAYARAN ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Gagal mengupload bukti pembayaran ke Supabase",
                error:
                    error.message,
            });
        }

        const {
            data: publicUrlData,
        } =
            supabase.storage
                .from("bukti-pembayaran")
                .getPublicUrl(fileName);

        const publicUrl =
            publicUrlData.publicUrl;

        // ==================================================
        // SIMPAN INFORMASI FILE
        // ==================================================

        req.file.filename =
            fileName;

        req.file.path =
            publicUrl;

        req.file.publicUrl =
            publicUrl;

        console.log(
            "Public URL:",
            publicUrl
        );

        next();

    } catch (error) {

        console.error(
            "UPLOAD BUKTI PEMBAYARAN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal memproses upload bukti pembayaran",
            error:
                error.message,
        });
    }
};

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

    const extension =
        path
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
        ),
        false
    );
};

// ======================================================
// MULTER
// ======================================================

const upload = multer({
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

const uploadPembayaran = {

    single: (fieldName) => {

        return (
            req,
            res,
            next
        ) => {

            upload.single(fieldName)(
                req,
                res,
                (err) => {

                    if (err) {

                        console.error(
                            "MULTER PEMBAYARAN ERROR:",
                            err
                        );

                        return res.status(400).json({
                            success: false,
                            message:
                                err.message
                        });
                    }

                    uploadPembayaranToSupabase(
                        req,
                        res,
                        next
                    );
                }
            );
        };
    }
};

module.exports =
    uploadPembayaran;