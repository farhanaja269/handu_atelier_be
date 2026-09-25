const fs = require("fs");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "..", ".env")
});

const db = require("../config/db");
const supabase = require("../config/supabase");

const bucketName = "dokumen-jaminan";

const uploadDir = path.join(
    process.cwd(),
    "uploads",
    "dokumen-jaminan"
);

const getContentType = (extension) => {
    const ext = extension.toLowerCase();

    if (ext === ".jpg" || ext === ".jpeg") {
        return "image/jpeg";
    }

    if (ext === ".png") {
        return "image/png";
    }

    if (ext === ".webp") {
        return "image/webp";
    }

    if (ext === ".pdf") {
        return "application/pdf";
    }

    return "application/octet-stream";
};

const getFileName = (value) => {
    if (!value) {
        return null;
    }

    return path.basename(
        String(value).replace(/\\/g, "/")
    );
};

async function migrateDokumenJaminan() {

    console.log("");
    console.log("======================================");
    console.log("MIGRASI DOKUMEN JAMINAN");
    console.log("======================================");
    console.log("");

    db.query(
        `
        SELECT
            id_dokumen_jaminan,
            id_peminjaman,
            nama_file,
            path_file
        FROM dokumen_jaminan
        WHERE
            path_file IS NOT NULL
            AND path_file <> ''
        ORDER BY id_dokumen_jaminan
        `,
        async (err, rows) => {

            if (err) {
                console.error(
                    "Gagal mengambil data dokumen jaminan:"
                );
                console.error(err);
                process.exit(1);
            }

            if (!rows || rows.length === 0) {
                console.log(
                    "Tidak ada dokumen jaminan yang perlu dimigrasikan."
                );
                process.exit(0);
            }

            console.log(
                `Ditemukan ${rows.length} dokumen jaminan.`
            );
            console.log("");

            let berhasil = 0;
            let dilewati = 0;
            let gagal = 0;

            for (const dokumen of rows) {

                console.log(
                    "--------------------------------------"
                );

                console.log(
                    `ID Dokumen    : ${dokumen.id_dokumen_jaminan}`
                );

                console.log(
                    `ID Peminjaman : ${dokumen.id_peminjaman}`
                );

                console.log(
                    `Nama File     : ${dokumen.nama_file}`
                );

                console.log(
                    `Path Lama     : ${dokumen.path_file}`
                );

                const oldPath = dokumen.path_file;

                // Sudah Supabase
                if (
                    String(oldPath).startsWith(
                        "https://tritssgohxmvqrakggiq.supabase.co/"
                    )
                ) {
                    console.log(
                        "DILEWATI: sudah menggunakan Supabase."
                    );

                    dilewati++;
                    continue;
                }

                const fileName =
                    getFileName(
                        dokumen.nama_file ||
                        oldPath
                    );

                if (!fileName) {
                    console.log(
                        "DILEWATI: nama file tidak tersedia."
                    );

                    dilewati++;
                    continue;
                }

                const localFile =
                    path.join(
                        uploadDir,
                        fileName
                    );

                if (!fs.existsSync(localFile)) {
                    console.log(
                        `GAGAL: file tidak ditemukan: ${localFile}`
                    );

                    gagal++;
                    continue;
                }

                try {

                    const fileBuffer =
                        fs.readFileSync(
                            localFile
                        );

                    const extension =
                        path.extname(
                            fileName
                        );

                    const contentType =
                        getContentType(
                            extension
                        );

                    console.log(
                        `Upload ke Supabase: ${fileName}`
                    );

                    const {
                        error: uploadError
                    } =
                        await supabase.storage
                            .from(bucketName)
                            .upload(
                                fileName,
                                fileBuffer,
                                {
                                    contentType,
                                    upsert: true
                                }
                            );

                    if (uploadError) {
                        throw uploadError;
                    }

                    const {
                        data
                    } =
                        supabase.storage
                            .from(bucketName)
                            .getPublicUrl(
                                fileName
                            );

                    const publicUrl =
                        data.publicUrl;

                    console.log(
                        "URL Supabase:"
                    );

                    console.log(
                        publicUrl
                    );

                    await new Promise(
                        (
                            resolve,
                            reject
                        ) => {

                            db.query(
                                `
                                UPDATE dokumen_jaminan
                                SET path_file = ?
                                WHERE id_dokumen_jaminan = ?
                                `,
                                [
                                    publicUrl,
                                    dokumen.id_dokumen_jaminan
                                ],
                                (updateErr) => {

                                    if (updateErr) {
                                        reject(updateErr);
                                        return;
                                    }

                                    resolve();
                                }
                            );

                        }
                    );

                    console.log(
                        "DATABASE: berhasil diperbarui."
                    );

                    berhasil++;

                } catch (error) {

                    console.error(
                        "GAGAL MIGRASI:"
                    );

                    console.error(error);

                    gagal++;
                }
            }

            console.log("");
            console.log("======================================");
            console.log("HASIL MIGRASI");
            console.log("======================================");
            console.log(
                `Berhasil : ${berhasil}`
            );
            console.log(
                `Dilewati : ${dilewati}`
            );
            console.log(
                `Gagal    : ${gagal}`
            );
            console.log("======================================");
            console.log("");
            
            process.exit(
                gagal > 0 ? 1 : 0
            );
        }
    );
}

migrateDokumenJaminan();