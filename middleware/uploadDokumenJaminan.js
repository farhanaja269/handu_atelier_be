const multer = require("multer");
const path = require("path");
const supabase = require("../config/supabase");

const storage = multer.memoryStorage();


// ======================================================
// GENERATE NAMA FILE
// ======================================================

const generateFileName = (originalName) => {
    const safeOriginalName = path.basename(originalName);

    const extension = path
        .extname(safeOriginalName)
        .toLowerCase();

    const baseName = path.basename(
        safeOriginalName,
        path.extname(safeOriginalName)
    );

    const cleanName = baseName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+/g, "")
        .replace(/-+$/g, "");

    return `jaminan-${cleanName || "dokumen"}-${Date.now()}${extension}`;
};


// ======================================================
// UPLOAD KE SUPABASE
// ======================================================

const uploadDokumenJaminanToSupabase = async (
    req,
    res,
    next
) => {
    try {
        if (!req.file) {
            return next();
        }

        const fileName = generateFileName(
            req.file.originalname
        );

        console.log("======================================");
        console.log("UPLOAD DOKUMEN JAMINAN");
        console.log("Original:", req.file.originalname);
        console.log("Final:", fileName);
        console.log("Bucket:", "dokumen-jaminan");
        console.log("======================================");

        const { error } = await supabase.storage
            .from("dokumen-jaminan")
            .upload(
                fileName,
                req.file.buffer,
                {
                    contentType: req.file.mimetype,
                    upsert: true
                }
            );

        if (error) {
            console.error(
                "SUPABASE UPLOAD DOKUMEN JAMINAN ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Gagal mengupload dokumen jaminan ke Supabase",
                error: error.message
            });
        }

        const { data: publicUrlData } =
            supabase.storage
                .from("dokumen-jaminan")
                .getPublicUrl(fileName);

        const publicUrl =
            publicUrlData.publicUrl;

        req.file.filename = fileName;

        req.file.path = publicUrl;

        req.file.publicUrl = publicUrl;

        console.log(
            "Public URL:",
            publicUrl
        );

        next();

    } catch (error) {

        console.error(
            "UPLOAD DOKUMEN JAMINAN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal memproses upload dokumen jaminan",
            error: error.message
        });
    }
};


// ======================================================
// FILE FILTER
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
        cb(null, true);
    } else {
        cb(
            new Error(
                "Format file tidak diperbolehkan. Gunakan JPG, JPEG, PNG, WEBP, atau PDF."
            ),
            false
        );
    }
};


// ======================================================
// MULTER
// ======================================================

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});


// ======================================================
// MIDDLEWARE UTAMA
// ======================================================

const uploadDokumenJaminan = {

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
                            "MULTER DOKUMEN JAMINAN ERROR:",
                            err
                        );

                        return res.status(400).json({
                            success: false,
                            message: err.message
                        });
                    }

                    uploadDokumenJaminanToSupabase(
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
    uploadDokumenJaminan;