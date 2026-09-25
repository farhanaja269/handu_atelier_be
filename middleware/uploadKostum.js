const multer = require("multer");
const path = require("path");

const supabase = require("../config/supabase");

// ==================================================
// NAMA BUCKET SUPABASE
// ==================================================

const BUCKET_NAME = "kostum";


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
//
// File tidak disimpan ke laptop.
// File hanya disimpan sementara di memory
// sebelum dikirim ke Supabase Storage.
//

const storage = multer.memoryStorage();


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

const multerUpload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize:
            5 * 1024 * 1024
    }

});


// ==================================================
// UPLOAD KE SUPABASE
// ==================================================

const uploadToSupabase = async (
    req,
    file
) => {

    if (!file || !file.buffer) {
        return null;
    }


    // ==================================================
    // TENTUKAN NAMA FILE
    // ==================================================

    let namaKostum =
        req.body &&
        req.body.nama_kostum
            ? req.body.nama_kostum
            : null;


    let baseName;


    if (namaKostum) {

        baseName =
            sanitizeFileName(
                namaKostum
            );

    } else {

        const originalName =
            path.basename(
                file.originalname,
                path.extname(
                    file.originalname
                )
            );

        baseName =
            sanitizeFileName(
                originalName
            );
    }


    // ==================================================
    // EXTENSION
    // ==================================================

    const ext =
        path.extname(
            file.originalname
        ).toLowerCase();


    // ==================================================
    // PATH FILE SUPABASE
    // ==================================================
    //
    // Contoh:
    //
    // ageng-kanigaran.jpeg
    //
    // Jika nama yang sama di-upload lagi,
    // file akan diperbarui karena upsert = true.
    //

    const fileName =
        `${baseName}${ext}`;


    // ==================================================
    // UPLOAD
    // ==================================================

    const {
        error
    } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(
            fileName,
            file.buffer,
            {
                contentType:
                    file.mimetype,

                upsert: true
            }
        );


    // ==================================================
    // CEK ERROR
    // ==================================================

    if (error) {

        console.error(
            "ERROR UPLOAD SUPABASE:",
            error
        );

        throw new Error(
            `Gagal upload foto ke Supabase: ${error.message}`
        );
    }


    // ==================================================
    // AMBIL PUBLIC URL
    // ==================================================

    const {
        data: publicUrlData
    } =
        supabase
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(
                fileName
            );


    if (
        !publicUrlData ||
        !publicUrlData.publicUrl
    ) {

        throw new Error(
            "URL publik foto Supabase tidak berhasil dibuat."
        );
    }


    // ==================================================
    // SIMPAN INFORMASI KE req.file
    // ==================================================

    file.filename =
        fileName;

    file.path =
        publicUrlData.publicUrl;

    file.publicUrl =
        publicUrlData.publicUrl;


    return file;
};


// ==================================================
// MIDDLEWARE SINGLE
// ==================================================
//
// Router kamu sekarang menggunakan:
//
// uploadKostum.single("foto")
//
// Jadi kita pertahankan format tersebut
// supaya router tidak perlu diubah.
//

const uploadKostum = {

    single: (fieldName) => {

        const multerMiddleware =
            multerUpload.single(
                fieldName
            );


        return async (
            req,
            res,
            next
        ) => {

            multerMiddleware(
                req,
                res,
                async (err) => {

                    if (err) {
                        return next(err);
                    }


                    try {

                        if (req.file) {

                            await uploadToSupabase(
                                req,
                                req.file
                            );

                        }

                        next();

                    } catch (error) {

                        next(error);

                    }

                }
            );

        };
    }

};


// ==================================================
// EXPORT
// ==================================================

module.exports = uploadKostum;