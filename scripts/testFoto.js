require("dotenv").config();

const fs = require("fs");
const path = require("path");
const supabase = require("../config/supabase");

const fileName = "jas-pria-hitam-putih.jpeg";
const filePath = path.join(
    __dirname,
    "..",
    "uploads",
    "kostum",
    fileName
);

const upload = async () => {
    try {
        console.log("Upload:", fileName);

        const fileBuffer = fs.readFileSync(filePath);

        const { data, error } = await supabase
            .storage
            .from("kostum")
            .upload(
                fileName,
                fileBuffer,
                {
                    contentType: "image/jpeg",
                    upsert: true
                }
            );

        if (error) {
            console.error("GAGAL:");
            console.error(error);
            return;
        }

        console.log("BERHASIL:");
        console.log(data);

        const { data: publicUrl } = supabase
            .storage
            .from("kostum")
            .getPublicUrl(fileName);

        console.log("PUBLIC URL:");
        console.log(publicUrl.publicUrl);

    } catch (error) {
        console.error("ERROR:");
        console.error(error);
    }
};

upload();