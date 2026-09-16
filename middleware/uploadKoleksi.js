const multer = require("multer");
const path = require("path");
const fs = require("fs");


// ======================================================
// FOLDER UPLOAD KOLEKSI
// ======================================================

const uploadDir = path.join(
    __dirname,
    "../uploads/koleksi"
);


// ======================================================
// PASTIKAN FOLDER ADA
// ======================================================

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

const storage = multer.diskStorage({

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

        // ==============================================
        // AMBIL NAMA FILE ASLI
        // ==============================================

        const originalName =
            path.basename(
                file.originalname
            );


        // ==============================================
        // EXTENSION
        // ==============================================

        const extension =
            path.extname(
                originalName
            ).toLowerCase();


        // ==============================================
        // NAMA FILE TANPA EXTENSION
        // ==============================================

        const baseName =
            path.basename(
                originalName,
                path.extname(
                    originalName
                )
            );


        // ==============================================
        // NORMALISASI NAMA
        // ==============================================

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
                    /-+$/,
                    ""
                );


        // ==============================================
        // NAMA FINAL
        // ==============================================

        const finalName =
            `${cleanName}${extension}`;


        console.log(
            "======================================"
        );

        console.log(
            "UPLOAD FOTO KOLEKSI"
        );

        console.log(
            "Original:",
            file.originalname
        );

        console.log(
            "Final:",
            finalName
        );

        console.log(
            "Folder:",
            uploadDir
        );

        console.log(
            "======================================"
        );


        cb(
            null,
            finalName
        );

    }

});


// ======================================================
// FILTER FOTO
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
                "Format foto harus JPG, JPEG, PNG, atau WEBP."
            ),
            false
        );

    }

};


// ======================================================
// MULTER KOLEKSI
// ======================================================

const uploadKoleksi =
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
    uploadKoleksi;