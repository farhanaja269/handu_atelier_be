// ======================================================
// middleware/uploadPembayaranDenda.js
// ======================================================

const multer = require("multer");
const path = require("path");
const supabase = require("../config/supabase");

// ======================================================
// STORAGE
// ======================================================

const storage =
    multer.memoryStorage();

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

    const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".pdf"
    ];

    const extension =
        path.extname(
            file.originalname
        ).toLowerCase();

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
            "Format bukti pembayaran tidak diperbolehkan. Gunakan JPG, JPEG, PNG, WEBP, atau PDF."
        ),
        false
    );
};

// ======================================================
// MULTER
// ======================================================

const upload =
    multer({

        storage,

        fileFilter,

        limits: {
            fileSize:
                5 * 1024 * 1024
        }

    });

// ======================================================
// UPLOAD KE SUPABASE
// ======================================================

const uploadPembayaranDendaToSupabase = async (
    req,
    res,
    next
) => {

    try {

        if (!req.file) {

            return next();

        }

        const extension =
            path.extname(
                req.file.originalname
            ).toLowerCase();

        const originalName =
            path
                .basename(
                    req.file.originalname,
                    extension
                )
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "_"
                );

        const fileName =
            `denda-${Date.now()}-${Math.round(
                Math.random() * 1000000000
            )}-${originalName}${extension}`;

        const bucketName =
            "pembayaran-denda";

        // ==================================================
        // UPLOAD FILE
        // ==================================================

        const {
            error: uploadError
        } = await supabase
            .storage
            .from(bucketName)
            .upload(
                fileName,
                req.file.buffer,
                {
                    contentType:
                        req.file.mimetype,

                    upsert: false
                }
            );

        if (uploadError) {

            console.error(
                "SUPABASE UPLOAD PEMBAYARAN DENDA ERROR:",
                uploadError
            );

            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Gagal mengupload bukti pembayaran denda.",
                    error:
                        uploadError.message
                });

        }

        // ==================================================
        // PUBLIC URL
        // ==================================================

        const {
            data: publicUrlData
        } =
            supabase
                .storage
                .from(bucketName)
                .getPublicUrl(
                    fileName
                );

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

        // Lanjut ke controller
        next();

    } catch (error) {

        console.error(
            "UPLOAD PEMBAYARAN DENDA ERROR:",
            error
        );

        return res
            .status(500)
            .json({
                success: false,
                message:
                    "Gagal memproses upload bukti pembayaran denda.",
                error:
                    error.message
            });
    }
};

// ======================================================
// EXPORT
// ======================================================

const uploadPembayaranDenda = {

    single: (
        fieldName
    ) => {

        return (
            req,
            res,
            next
        ) => {

            upload.single(
                fieldName
            )(
                req,
                res,
                (err) => {

                    if (err) {

                        console.error(
                            "MULTER PEMBAYARAN DENDA ERROR:",
                            err
                        );

                        return res
                            .status(400)
                            .json({
                                success: false,
                                message:
                                    err.message
                            });
                    }

                    uploadPembayaranDendaToSupabase(
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
    uploadPembayaranDenda;