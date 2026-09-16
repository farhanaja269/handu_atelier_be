const db = require("../config/db");

// ==========================================
// GET SEMUA PETUGAS DARI USERS + ROLES
// ==========================================
const getAllPetugas = (callback) => {
    const sql = `
        SELECT
            u.id_user,
            u.nama,
            u.email,
            u.no_hp AS no_whatsapp,
            u.alamat,
            u.id_role,
            r.nama_role
        FROM users u
        INNER JOIN roles r
            ON u.id_role = r.id_role
        WHERE r.nama_role = 'Petugas'
        AND u.deleted_at IS NULL
        ORDER BY u.id_user ASC
    `;

    db.query(sql, callback);
};


// ==========================================
// GET PETUGAS BERDASARKAN ID USER
// ==========================================
const getPetugasById = (id, callback) => {
    const sql = `
        SELECT
            u.id_user,
            u.nama,
            u.email,
            u.no_hp AS no_whatsapp,
            u.alamat,
            u.id_role,
            r.nama_role
        FROM users u
        INNER JOIN roles r
            ON u.id_role = r.id_role
        WHERE u.id_user = ?
        AND r.nama_role = 'Petugas'
        AND u.deleted_at IS NULL
    `;

    db.query(sql, [id], callback);
};


// ==========================================
// TAMBAH PETUGAS
// id_role = 2 = Petugas
// ==========================================
const createPetugas = (data, callback) => {
    const sql = `
        INSERT INTO users
        (
            nama,
            email,
            password,
            no_hp,
            id_role
        )
        VALUES (?, ?, ?, ?, 2)
    `;

    db.query(
        sql,
        [
            data.nama,
            data.email,
            data.password,
            data.no_whatsapp
        ],
        callback
    );
};


// ==========================================
// UPDATE PETUGAS
// ==========================================
const updatePetugas = (id, data, callback) => {

    let sql;
    let params;

    if (data.password) {
        sql = `
            UPDATE users
            SET
                nama = ?,
                email = ?,
                password = ?,
                no_hp = ?
            WHERE id_user = ?
            AND id_role = 2
        `;

        params = [
            data.nama,
            data.email,
            data.password,
            data.no_whatsapp,
            id
        ];
    } else {
        sql = `
            UPDATE users
            SET
                nama = ?,
                email = ?,
                no_hp = ?
            WHERE id_user = ?
            AND id_role = 2
        `;

        params = [
            data.nama,
            data.email,
            data.no_whatsapp,
            id
        ];
    }

    db.query(sql, params, callback);
};


// ==========================================
// DELETE PETUGAS
// ==========================================
const deletePetugas = (id, callback) => {
    const sql = `
        DELETE FROM users
        WHERE id_user = ?
        AND id_role = 2
    `;

    db.query(sql, [id], callback);
};


module.exports = {
    getAllPetugas,
    getPetugasById,
    createPetugas,
    updatePetugas,
    deletePetugas
};