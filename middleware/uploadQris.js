const multer = require("multer");
const path = require("path");
const supabase = require("../config/supabase");


// ======================================================
// STORAGE
// ======================================================

const storage =
    multer.memoryStorage();


// ======================================================
// NAMA FILE
// ======================================================

const generateFileName = (
    originalName
) => {

    const safeOriginalName =
        path.basename(
            originalName
        );

    const extension =
        path.extname(
            safeOriginalName
        ).toLowerCase();

    const baseName =
        path.basename(
            safeOriginalName,
            path.extname(
                safeOriginalName
            )
        );

    const cleanName =
        baseName
            .trim()
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+/,
                ""
            )
            .replace(
                /-+$/g,
                ""
            );

    return `qris-${cleanName || "payment"}-${Date.now()}${extension}`;
};


// ======================================================
// UPLOAD KE SUPABASE
// ======================================================

const uploadQrisToSupabase =
    async (
        req,
        res,
        next
    ) => {

        try {

            // Tidak ada file
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
                "UPLOAD QRIS"
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
                "qris"
            );

            console.log(
                "======================================"
            );


            // ==================================================
            // UPLOAD KE SUPABASE STORAGE
            // ==================================================

            const {
                error
            } =
                await supabase.storage
                    .from("qris")
                    .upload(
                        fileName,
                        req.file.buffer,
                        {
                            contentType:
                                req.file.mimetype,

                            upsert:
                                true
                        }
                    );


            if (error) {

                console.error(
                    "SUPABASE UPLOAD QRIS ERROR:",
                    error
                );

                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            "Gagal mengupload QRIS ke Supabase",

                        error:
                            error.message

                    });

            }


            // ==================================================
            // PUBLIC URL
            // ==================================================

            const {
                data:
                    publicUrlData
            } =
                supabase.storage
                    .from("qris")
                    .getPublicUrl(
                        fileName
                    );


            const publicUrl =
                publicUrlData
                    .publicUrl;


            // ==================================================
            // TAMBAHKAN DATA KE req.file
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

        } catch (
            error
        ) {

            console.error(
                "UPLOAD QRIS ERROR:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Gagal memproses upload QRIS",

                    error:
                        error.message

                });

        }

    };


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
                "Format QRIS harus JPG, JPEG, PNG, atau WEBP."
            ),
            false
        );

    }

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
// MIDDLEWARE UTAMA
// ======================================================

const uploadQris = {

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
                            "MULTER QRIS ERROR:",
                            err
                        );

                        return res
                            .status(400)
                            .json({

                                success:
                                    false,

                                message:
                                    err.message

                            });

                    }


                    uploadQrisToSupabase(
                        req,
                        res,
                        next
                    );

                }
            );

        };

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports =
    uploadQris;