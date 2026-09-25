require("dotenv").config();
const fs = require("fs");
const path = require("path");
const supabase = require("../config/supabase");

const folder = path.join(
    __dirname,
    "..",
    "uploads",
    "koleksi"
);

const BUCKET = "koleksi";

async function migrate() {
    console.log("=================================");
    console.log("MIGRASI FOTO KOLEKSI");
    console.log("=================================");

    if (!fs.existsSync(folder)) {
        console.error(
            "Folder uploads/koleksi tidak ditemukan."
        );
        return;
    }

    const files = fs.readdirSync(folder);

    console.log(
        `Ditemukan ${files.length} file.`
    );

    let berhasil = 0;
    let gagal = 0;

    for (const fileName of files) {

        const filePath = path.join(
            folder,
            fileName
        );

        if (!fs.statSync(filePath).isFile()) {
            continue;
        }

        try {

            const fileBuffer =
                fs.readFileSync(filePath);

            const ext =
                path.extname(fileName)
                    .toLowerCase();

            let contentType =
                "application/octet-stream";

            if (ext === ".jpg" || ext === ".jpeg") {
                contentType = "image/jpeg";
            } else if (ext === ".png") {
                contentType = "image/png";
            } else if (ext === ".webp") {
                contentType = "image/webp";
            }

            const {
                error
            } = await supabase.storage
                .from(BUCKET)
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

            const {
                data
            } = supabase.storage
                .from(BUCKET)
                .getPublicUrl(fileName);

            console.log(
                "BERHASIL:",
                fileName
            );

            console.log(
                data.publicUrl
            );

            berhasil++;

        } catch (error) {

            console.error(
                "GAGAL:",
                fileName
            );

            console.error(
                error.message
            );

            gagal++;
        }
    }

    console.log("");
    console.log("=================================");
    console.log("HASIL MIGRASI");
    console.log("=================================");
    console.log(
        "Berhasil :",
        berhasil
    );
    console.log(
        "Gagal    :",
        gagal
    );
    console.log(
        "Total    :",
        files.length
    );
    console.log("=================================");
}

migrate();