const db = require("../config/db");
const bcrypt = require("bcryptjs");


// ========================================
// MENAMPILKAN SEMUA ADMIN
// ========================================

const getAllAdmin = (callback) => {

    db.query(
        "SELECT * FROM admin",
        callback
    );

};


// ========================================
// MENAMPILKAN ADMIN BERDASARKAN ID
// ========================================

const getAdminById = (id, callback) => {

    db.query(
        "SELECT * FROM admin WHERE id_admin = ?",
        [id],
        callback
    );

};


// ========================================
// MENAMBAH ADMIN
// ========================================

const createAdmin = (data, callback) => {

    const sql = `
        INSERT INTO admin
        (
            nama,
            no_whatsapp
        )
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [
            data.nama,
            data.no_whatsapp
        ],
        callback
    );

};


// ========================================
// MENGUBAH ADMIN
// ========================================

const updateAdmin = (id, data, callback) => {

    const sql = `
        UPDATE admin
        SET
            nama = ?,
            no_whatsapp = ?
        WHERE id_admin = ?
    `;

    db.query(
        sql,
        [
            data.nama,
            data.no_whatsapp,
            id
        ],
        callback
    );

};


// ========================================
// MENGHAPUS ADMIN
// ========================================

const deleteAdmin = (id, callback) => {

    db.query(
        "DELETE FROM admin WHERE id_admin = ?",
        [id],
        callback
    );

};

const loginAdmin = (email, password, callback) => {

    const sql = `
        SELECT
            id_user,
            nama,
            email,
            no_hp,
            alamat,
            id_role,
            password
        FROM users
        WHERE LOWER(TRIM(email)) = ?
          AND id_role = 1
          AND deleted_at IS NULL
        LIMIT 1
    `;

    db.query(
        sql,
        [email],
        async (err, result) => {

            if (err) {
                console.error("DATABASE LOGIN ERROR:", err);
                return callback(err);
            }

            if (!result || result.length === 0) {

                console.log(
                    "LOGIN GAGAL - USER TIDAK DITEMUKAN:",
                    email
                );

                return callback(null, []);
            }

            const user = result[0];

            console.log("================================");
            console.log("LOGIN CHECK");
            console.log("EMAIL:", email);
            console.log("ID USER:", user.id_user);
            console.log("ID ROLE:", user.id_role);
            console.log("PASSWORD INPUT LENGTH:", password.length);
            console.log("HASH LENGTH:", user.password?.length);
            console.log(
                "HASH PREFIX:",
                user.password?.substring(0, 7)
            );
            console.log("================================");

            try {

                const passwordBenar = await bcrypt.compare(
                    password,
                    user.password
                );

                console.log(
                    "HASIL BCRYPT:",
                    passwordBenar
                );

                if (!passwordBenar) {

                    console.log(
                        "LOGIN: PASSWORD SALAH UNTUK:",
                        email
                    );

                    return callback(null, []);
                }

                delete user.password;

                console.log(
                    "LOGIN BERHASIL:",
                    email
                );

                return callback(null, [user]);

            } catch (error) {

                console.error(
                    "BCRYPT LOGIN ERROR:",
                    error
                );

                return callback(error);
            }
        }
    );
};

// ========================================
// EXPORT
// ========================================

module.exports = {

    getAllAdmin,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    loginAdmin

}