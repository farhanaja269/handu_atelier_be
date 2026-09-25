require("dotenv").config();

const fs = require("fs");
const path = require("path");
const supabase = require("../config/supabase");

const BUCKET_NAME = "kostum";
const FOLDER_FOTO = path.join(
    __dirname,
    "..",
    "uploads",
    "kostum"
);

const getContentType = (fileName) => {
    const ext = path.extname(fileName).toLowerCase();

    const types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp"
    };

    return types[ext] || "application/octet-stream";
};

const migrateFoto = async () => {
    try {
        console.log("=================================");
        console.log("MIGRASI FOTO LAMA KE SUPABASE");
        console.log("=================================");

        if (!fs.existsSync(FOLDER_FOTO)) {
            throw new Error(
                `Folder tidak ditemukan: ${FOLDER_FOTO}`
            );
        }

        const files = fs.readdirSync(FOLDER_FOTO);

        const imageFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase();

            return [
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            ].includes(ext);
        });

        console.log(
            `Jumlah foto ditemukan: ${imageFiles.length}`
        );

        if (imageFiles.length === 0) {
            console.log(
                "Tidak ada foto untuk dimigrasikan."
            );
            return;
        }

        let berhasil = 0;
        let gagal = 0;

        for (const fileName of imageFiles) {
            try {
                const filePath = path.join(
                    FOLDER_FOTO,
                    fileName
                );

                const fileBuffer =
                    fs.readFileSync(filePath);

                const contentType =
                    getContentType(fileName);

                console.log("");
                console.log(`Upload: ${fileName}`);

                const { error } = await supabase
                    .storage
                    .from(BUCKET_NAME)
                    .upload(
                        fileName,
                        fileBuffer,
                        {
                            contentType,
                            upsert: true
                        }
                    );

                if (error) {
                    throw error;
                }

                const { data } = supabase
                    .storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(fileName);

                console.log(
                    "BERHASIL:",
                    data.publicUrl
                );

                berhasil++;
            } catch (error) {
                console.error(
                    `GAGAL: ${fileName}`
                );

                console.error(
                    error.message
                );

                gagal++;
            }
        }

        console.log("");
        console.log("=================================");
        console.log("MIGRASI SELESAI");
        console.log("=================================");
        console.log(`Berhasil : ${berhasil}`);
        console.log(`Gagal    : ${gagal}`);
        console.log(`Total    : ${imageFiles.length}`);
        console.log("=================================");

    } catch (error) {
        console.error("");
        console.error("MIGRASI GAGAL:");
        console.error(error.message);
    }
};

migrateFoto();