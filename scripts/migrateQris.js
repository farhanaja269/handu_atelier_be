require("dotenv").config();
const fs = require("fs");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "..", ".env")
});

const supabase = require("../config/supabase");

const filePath = path.join(
    process.cwd(),
    "uploads",
    "pembayaran",
    "qris-qris-1788333138827.png"
);

const bucketName = "qris";
const fileName = "qris-qris-178833138827.png";

async function migrateQris() {
    try {
        console.log("======================================");
        console.log("MIGRASI QRIS KE SUPABASE");
        console.log("======================================");

        if (!fs.existsSync(filePath)) {
            throw new Error(
                `File tidak ditemukan: ${filePath}`
            );
        }

        console.log("File ditemukan:");
        console.log(filePath);

        const fileBuffer = fs.readFileSync(filePath);

        console.log(
            `Ukuran file: ${fileBuffer.length} bytes`
        );

        const { error: uploadError } =
            await supabase.storage
                .from(bucketName)
                .upload(
                    fileName,
                    fileBuffer,
                    {
                        contentType: "image/png",
                        upsert: true
                    }
                );

        if (uploadError) {
            throw uploadError;
        }

        console.log("");
        console.log("UPLOAD SUPABASE BERHASIL");

        const { data } =
            supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

        console.log("");
        console.log("URL QRIS SUPABASE:");
        console.log(data.publicUrl);

        console.log("");
        console.log("======================================");
        console.log("MIGRASI SELESAI");
        console.log("======================================");

    } catch (error) {
        console.error("");
        console.error("MIGRASI QRIS GAGAL:");
        console.error(error);
        process.exit(1);
    }
}

migrateQris();