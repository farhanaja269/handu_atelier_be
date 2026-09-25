require("dotenv").config();

const db = require("../config/db");

const SUPABASE_URL =
    process.env.SUPABASE_URL;

const BUCKET = "koleksi";

const getPublicUrl = (fileName) => {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(fileName)}`;
};

const migrate = () => {

    console.log("=================================");
    console.log("MIGRASI DATABASE FOTO KOLEKSI");
    console.log("=================================");

    const sql = `
        SELECT
            id_koleksi,
            foto
        FROM koleksi
        WHERE foto IS NOT NULL
          AND TRIM(foto) <> ''
    `;

    db.query(sql, (err, rows) => {

        if (err) {

            console.error(
                "Gagal mengambil data koleksi:"
            );

            console.error(
                err.message
            );

            process.exit(1);
        }

        console.log(
            `Ditemukan ${rows.length} data koleksi dengan foto.`
        );

        if (rows.length === 0) {

            console.log(
                "Tidak ada data yang perlu dimigrasikan."
            );

            process.exit(0);
        }

        let berhasil = 0;
        let dilewati = 0;
        let gagal = 0;

        let selesai = 0;

        rows.forEach((row) => {

            const id =
                row.id_koleksi;

            const fotoLama =
                String(row.foto).trim();

            /*
             * Jika sudah merupakan URL Supabase,
             * tidak perlu diubah lagi.
             */
            if (
                fotoLama.startsWith(
                    "https://"
                ) &&
                fotoLama.includes(
                    "supabase.co/storage/v1/object/"
                )
            ) {

                console.log(
                    `DILEWATI ID ${id}: sudah menggunakan Supabase`
                );

                dilewati++;
                selesai++;

                if (
                    selesai === rows.length
                ) {
                    selesaiMigrasi(
                        berhasil,
                        dilewati,
                        gagal,
                        rows.length
                    );
                }

                return;
            }

            /*
             * Ambil hanya nama file.
             *
             * Contoh:
             * /uploads/koleksi/classic.jpg
             * menjadi:
             * classic.jpg
             */
            const fileName =
                fotoLama
                    .replace(/\\/g, "/")
                    .split("/")
                    .pop();

            if (!fileName) {

                console.error(
                    `GAGAL ID ${id}: nama file tidak ditemukan`
                );

                gagal++;
                selesai++;

                if (
                    selesai === rows.length
                ) {
                    selesaiMigrasi(
                        berhasil,
                        dilewati,
                        gagal,
                        rows.length
                    );
                }

                return;
            }

            const publicUrl =
                getPublicUrl(fileName);

            const updateSql = `
                UPDATE koleksi
                SET foto = ?
                WHERE id_koleksi = ?
            `;

            db.query(
                updateSql,
                [
                    publicUrl,
                    id
                ],
                (updateErr) => {

                    if (updateErr) {

                        console.error(
                            `GAGAL ID ${id}: ${fileName}`
                        );

                        console.error(
                            updateErr.message
                        );

                        gagal++;

                    } else {

                        console.log(
                            `BERHASIL ID ${id}: ${fileName}`
                        );

                        console.log(
                            publicUrl
                        );

                        berhasil++;
                    }

                    selesai++;

                    if (
                        selesai === rows.length
                    ) {

                        selesaiMigrasi(
                            berhasil,
                            dilewati,
                            gagal,
                            rows.length
                        );
                    }
                }
            );
        });
    });
};

const selesaiMigrasi = (
    berhasil,
    dilewati,
    gagal,
    total
) => {

    console.log("");
    console.log("=================================");
    console.log("HASIL MIGRASI DATABASE KOLEKSI");
    console.log("=================================");

    console.log(
        "Berhasil :",
        berhasil
    );

    console.log(
        "Dilewati :",
        dilewati
    );

    console.log(
        "Gagal    :",
        gagal
    );

    console.log(
        "Total    :",
        total
    );

    console.log(
        "================================="
    );

    process.exit(0);
};

migrate();