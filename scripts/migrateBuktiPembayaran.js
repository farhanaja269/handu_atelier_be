require("dotenv").config();
const fs = require("fs");
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "..", ".env")
});

const db = require("../config/db");
const supabase = require("../config/supabase");

const bucketName = "bukti-pembayaran";

const uploadDir = path.join(
    process.cwd(),
    "uploads",
    "pembayaran"
);


// ======================================================
// TENTUKAN CONTENT TYPE
// ======================================================

const getContentType = (extension) => {

    const ext =
        extension.toLowerCase();

    if (
        ext === ".jpg" ||
        ext === ".jpeg"
    ) {
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


// ======================================================
// AMBIL NAMA FILE DARI DATABASE
// ======================================================

const getFileName = (value) => {

    if (!value) {
        return null;
    }

    const normalized =
        String(value)
            .replace(/\\/g, "/");

    return path.basename(
        normalized
    );
};


// ======================================================
// CEK APAKAH SUDAH URL SUPABASE
// ======================================================

const isSupabaseUrl = (value) => {

    if (!value) {
        return false;
    }

    return String(value).startsWith(
        "https://tritssgohxmvqrakggiq.supabase.co/"
    );
};


// ======================================================
// MIGRASI
// ======================================================

async function migrateBuktiPembayaran() {

    console.log("");
    console.log("======================================");
    console.log("MIGRASI BUKTI PEMBAYARAN");
    console.log("======================================");
    console.log("");

    db.query(
        `
        SELECT
            id_pembayaran,
            id_peminjaman,
            metode,
            bukti_bayar
        FROM pembayaran
        WHERE
            bukti_bayar IS NOT NULL
            AND bukti_bayar <> ''
        ORDER BY id_pembayaran
        `,
        async (err, rows) => {

            if (err) {

                console.error(
                    "Gagal mengambil data pembayaran:"
                );

                console.error(err);

                process.exit(1);
            }


            if (
                !rows ||
                rows.length === 0
            ) {

                console.log(
                    "Tidak ada bukti pembayaran yang perlu dimigrasikan."
                );

                process.exit(0);
            }


            console.log(
                `Ditemukan ${rows.length} data pembayaran.`
            );

            console.log("");


            let berhasil = 0;
            let dilewati = 0;
            let gagal = 0;


            for (const payment of rows) {

                const id =
                    payment.id_pembayaran;

                const oldValue =
                    payment.bukti_bayar;


                console.log(
                    "--------------------------------------"
                );

                console.log(
                    `ID Pembayaran : ${id}`
                );

                console.log(
                    `ID Peminjaman : ${payment.id_peminjaman}`
                );

                console.log(
                    `Metode        : ${payment.metode}`
                );

                console.log(
                    `Bukti lama    : ${oldValue}`
                );


                // ==================================================
                // SUDAH SUPABASE
                // ==================================================

                if (
                    isSupabaseUrl(
                        oldValue
                    )
                ) {

                    console.log(
                        "DILEWATI: sudah menggunakan Supabase."
                    );

                    dilewati++;

                    continue;
                }


                // ==================================================
                // AMBIL NAMA FILE
                // ==================================================

                const fileName =
                    getFileName(
                        oldValue
                    );


                if (!fileName) {

                    console.log(
                        "DILEWATI: nama file tidak tersedia."
                    );

                    dilewati++;

                    continue;
                }


                // ==================================================
                // JANGAN SENTUH QRIS
                // ==================================================

                if (
                    fileName
                        .toLowerCase()
                        .startsWith("qris-")
                ) {

                    console.log(
                        "DILEWATI: file QRIS."
                    );

                    dilewati++;

                    continue;
                }


                // ==================================================
                // LOKASI FILE LOKAL
                // ==================================================

                const localFile =
                    path.join(
                        uploadDir,
                        fileName
                    );


                if (
                    !fs.existsSync(
                        localFile
                    )
                ) {

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


                    // ==================================================
                    // UPLOAD
                    // ==================================================

                    const {
                        error: uploadError
                    } =
                        await supabase.storage
                            .from(
                                bucketName
                            )
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


                    // ==================================================
                    // PUBLIC URL
                    // ==================================================

                    const {
                        data
                    } =
                        supabase.storage
                            .from(
                                bucketName
                            )
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


                    // ==================================================
                    // UPDATE DATABASE
                    // ==================================================

                    await new Promise(
                        (
                            resolve,
                            reject
                        ) => {

                            db.query(
                                `
                                UPDATE pembayaran
                                SET bukti_bayar = ?
                                WHERE id_pembayaran = ?
                                `,
                                [
                                    publicUrl,
                                    id
                                ],
                                (
                                    updateErr
                                ) => {

                                    if (
                                        updateErr
                                    ) {

                                        reject(
                                            updateErr
                                        );

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

                    console.error(
                        error
                    );

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
                gagal > 0
                    ? 1
                    : 0
            );
        }
    );
}


migrateBuktiPembayaran();
