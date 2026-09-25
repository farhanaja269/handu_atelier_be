require("dotenv").config();

const db = require("../config/db");

const SUPABASE_URL =
    process.env.SUPABASE_URL;

const BUCKET_NAME = "kostum";

const migrateDatabaseFoto = async () => {
    try {
        console.log("=================================");
        console.log("MIGRASI FOTO DATABASE");
        console.log("=================================");

        const [rows] = await db.promise().query(`
            SELECT
                id_kostum,
                nama_kostum,
                foto
            FROM kostum
            WHERE foto IS NOT NULL
              AND foto <> ''
        `);

        console.log(
            `Data foto ditemukan: ${rows.length}`
        );

        let berhasil = 0;
        let dilewati = 0;
        let gagal = 0;

        for (const row of rows) {
            try {
                const fotoLama =
                    String(row.foto).trim();

                // Sudah URL Supabase
                if (
                    fotoLama.startsWith(
                        SUPABASE_URL
                    )
                ) {
                    console.log(
                        `LEWATI: ${row.nama_kostum}`
                    );

                    dilewati++;
                    continue;
                }

                // Ambil nama file dari path lama
                const fileName =
                    fotoLama
                        .split("/")
                        .pop();

                if (!fileName) {
                    console.log(
                        `GAGAL: ID ${row.id_kostum} - nama file tidak ditemukan`
                    );

                    gagal++;
                    continue;
                }

                const newUrl =
                    `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${encodeURIComponent(fileName)}`;

                console.log("");
                console.log(
                    `ID ${row.id_kostum}: ${row.nama_kostum}`
                );

                console.log(
                    "LAMA:",
                    fotoLama
                );

                console.log(
                    "BARU:",
                    newUrl
                );

                await db.promise().query(
                    `
                    UPDATE kostum
                    SET foto = ?
                    WHERE id_kostum = ?
                    `,
                    [
                        newUrl,
                        row.id_kostum
                    ]
                );

                berhasil++;

            } catch (error) {
                console.error(
                    `GAGAL ID ${row.id_kostum}:`,
                    error.message
                );

                gagal++;
            }
        }

        console.log("");
        console.log("=================================");
        console.log("MIGRASI DATABASE SELESAI");
        console.log("=================================");
        console.log(
            `Berhasil : ${berhasil}`
        );
        console.log(
            `Dilewati : ${dilewati}`
        );
        console.log(
            `Gagal    : ${gagal}`
        );
        console.log(
            `Total    : ${rows.length}`
        );
        console.log("=================================");

    } catch (error) {
        console.error("");
        console.error(
            "MIGRASI DATABASE GAGAL:"
        );
        console.error(
            error.message
        );
    } finally {
        db.end();
    }
};

migrateDatabaseFoto();