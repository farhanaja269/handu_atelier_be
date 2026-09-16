// models/usersModel.js

const db = require("../config/db");

// ========================================
// GET SEMUA USER
// ========================================

const getAllUsers = (callback) => {

    const query = `
        SELECT
            u.id_user,
            u.nama,
            u.email,
            u.no_hp,
            u.alamat,
            u.id_role,
            r.nama_role,
            u.created_at,
            u.updated_at
        FROM users u
        LEFT JOIN roles r
            ON u.id_role = r.id_role
        WHERE u.deleted_at IS NULL
        ORDER BY u.id_user DESC
    `;

    db.query(
        query,
        (err, result) => {

            if (err) {
                console.error(
                    "Error getAllUsers:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                result
            );
        }
    );
};

// ========================================
// GET USER BERDASARKAN ID
// ========================================

const getUserById = (
    id,
    callback
) => {

    if (!id || isNaN(id)) {
        return callback(
            new Error(
                "ID user tidak valid"
            ),
            null
        );
    }

    const query = `
        SELECT
            u.id_user,
            u.nama,
            u.email,
            u.no_hp,
            u.alamat,
            u.id_role,
            r.nama_role,
            u.created_at,
            u.updated_at
        FROM users u
        LEFT JOIN roles r
            ON u.id_role = r.id_role
        WHERE
            u.id_user = ?
            AND u.deleted_at IS NULL
    `;

    db.query(
        query,
        [id],
        (err, result) => {

            if (err) {
                console.error(
                    "Error getUserById:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                result
            );
        }
    );
};

// ========================================
// LOGIN USER / PETUGAS / ADMIN
// ========================================

const loginUser = (
    email,
    callback
) => {

    if (!email) {
        return callback(
            new Error(
                "Email wajib diisi"
            ),
            null
        );
    }

    const query = `
        SELECT
            u.id_user,
            u.nama,
            u.email,
            u.password,
            u.no_hp,
            u.alamat,
            u.id_role,
            r.nama_role,
            p.id_petugas
        FROM users u
        LEFT JOIN roles r
            ON u.id_role = r.id_role
        LEFT JOIN petugas p
            ON p.id_user = u.id_user
        WHERE
            u.email = ?
            AND u.deleted_at IS NULL
        LIMIT 1
    `;

    db.query(
        query,
        [email],
        (err, result) => {

            if (err) {
                console.error(
                    "Error loginUser:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                result
            );
        }
    );
};

// ========================================
// CREATE USER
// ========================================

const createUser = (
    data,
    callback
) => {

    if (
        !data.nama ||
        !data.email ||
        !data.password
    ) {
        return callback(
            new Error(
                "Nama, email, dan password wajib diisi"
            ),
            null
        );
    }

    const query = `
        INSERT INTO users (
            nama,
            email,
            password,
            no_hp,
            alamat,
            id_role,
            created_at,
            updated_at
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            NOW(),
            NOW()
        )
    `;

    const values = [
        data.nama,
        data.email.toLowerCase(),
        data.password,
        data.no_hp || null,
        data.alamat || null,
        data.id_role || 2
    ];

    db.query(
        query,
        values,
        (err, result) => {

            if (err) {
                console.error(
                    "Error createUser:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                result
            );
        }
    );
};

// ========================================
// UPDATE USER
// ========================================

const updateUser = (
    id,
    data,
    callback
) => {

    if (!id || isNaN(id)) {
        return callback(
            new Error(
                "ID user tidak valid"
            ),
            null
        );
    }

    const fields = [];
    const values = [];

    if (data.nama) {
        fields.push(
            "nama = ?"
        );

        values.push(
            data.nama
        );
    }

    if (data.email) {
        fields.push(
            "email = ?"
        );

        values.push(
            data.email.toLowerCase()
        );
    }

    if (
        data.no_hp !== undefined &&
        data.no_hp !== null
    ) {
        fields.push(
            "no_hp = ?"
        );

        values.push(
            data.no_hp
        );
    }

    if (
        data.alamat !== undefined &&
        data.alamat !== null
    ) {
        fields.push(
            "alamat = ?"
        );

        values.push(
            data.alamat
        );
    }

    if (data.id_role) {
        fields.push(
            "id_role = ?"
        );

        values.push(
            data.id_role
        );
    }

    if (data.password) {
        fields.push(
            "password = ?"
        );

        values.push(
            data.password
        );
    }

    if (fields.length === 0) {
        return callback(
            new Error(
                "Tidak ada field yang diupdate"
            ),
            null
        );
    }

    fields.push(
        "updated_at = NOW()"
    );

    values.push(id);

    const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE
            id_user = ?
            AND deleted_at IS NULL
    `;

    db.query(
        query,
        values,
        (err, result) => {

            if (err) {
                console.error(
                    "Error updateUser:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                result
            );
        }
    );
};

// ========================================
// DELETE USER (SOFT DELETE)
// ========================================

const deleteUser = (
    id,
    callback
) => {

    if (!id || isNaN(id)) {
        return callback(
            new Error(
                "ID user tidak valid"
            ),
            null
        );
    }

    const query = `
        UPDATE users
        SET
            deleted_at = NOW(),
            updated_at = NOW()
        WHERE
            id_user = ?
            AND deleted_at IS NULL
    `;

    db.query(
        query,
        [id],
        (err, result) => {

            if (err) {
                console.error(
                    "Error deleteUser:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                result
            );
        }
    );
};

// ========================================
// CEK EMAIL SUDAH TERDAFTAR
// ========================================

const checkEmailExists = (
    email,
    callback
) => {

    if (!email) {
        return callback(
            new Error(
                "Email wajib diisi"
            ),
            null
        );
    }

    const query = `
        SELECT
            COUNT(*) AS total
        FROM users
        WHERE
            email = ?
            AND deleted_at IS NULL
    `;

    db.query(
        query,
        [email.toLowerCase()],
        (err, result) => {

            if (err) {
                console.error(
                    "Error checkEmailExists:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                result[0].total > 0
            );
        }
    );
};

// ========================================
// SEARCH USER BY NAME OR EMAIL
// ========================================

const searchUsers = (
    keyword,
    callback
) => {

    if (!keyword) {
        return callback(
            new Error(
                "Kata kunci pencarian wajib diisi"
            ),
            null
        );
    }

    const query = `
        SELECT
            u.id_user,
            u.nama,
            u.email,
            u.no_hp,
            u.alamat,
            u.id_role,
            r.nama_role
        FROM users u
        LEFT JOIN roles r
            ON u.id_role = r.id_role
        WHERE
            u.deleted_at IS NULL
            AND (
                u.nama LIKE ?
                OR u.email LIKE ?
            )
        ORDER BY
            u.nama ASC
    `;

    const searchPattern =
        `%${keyword}%`;

    db.query(
        query,
        [
            searchPattern,
            searchPattern
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "Error searchUsers:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                result
            );
        }
    );
};

// ========================================
// GET TOTAL USER
// ========================================

const getTotalUsers = (
    callback
) => {

    const query = `
        SELECT
            COUNT(*) AS total
        FROM users
        WHERE
            deleted_at IS NULL
    `;

    db.query(
        query,
        (err, result) => {

            if (err) {
                console.error(
                    "Error getTotalUsers:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                result[0].total
            );
        }
    );
};

// ========================================
// GET USERS BY ROLE
// ========================================

const getUsersByRole = (
    roleId,
    callback
) => {

    if (
        !roleId ||
        isNaN(roleId)
    ) {
        return callback(
            new Error(
                "ID role tidak valid"
            ),
            null
        );
    }

    const query = `
        SELECT
            u.id_user,
            u.nama,
            u.email,
            u.no_hp,
            u.alamat,
            u.id_role,
            r.nama_role
        FROM users u
        LEFT JOIN roles r
            ON u.id_role = r.id_role
        WHERE
            u.id_role = ?
            AND u.deleted_at IS NULL
        ORDER BY
            u.nama ASC
    `;

    db.query(
        query,
        [roleId],
        (err, result) => {

            if (err) {
                console.error(
                    "Error getUsersByRole:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                result
            );
        }
    );
};

// ========================================
// GET PASSWORD USER
// ========================================

const getUserPassword = (
    id,
    callback
) => {

    const sql = `
        SELECT
            password
        FROM users
        WHERE
            id_user = ?
            AND deleted_at IS NULL
    `;

    db.query(
        sql,
        [id],
        callback
    );
};

// ========================================
// UPDATE PASSWORD
// ========================================

const updatePassword = (
    id,
    hashedPassword,
    callback
) => {

    const sql = `
        UPDATE users
        SET
            password = ?
        WHERE
            id_user = ?
            AND deleted_at IS NULL
    `;

    db.query(
        sql,
        [
            hashedPassword,
            id
        ],
        callback
    );
};

// ========================================
// GET DETAIL CUSTOMER + RIWAYAT
// ========================================

const getCustomerDetail = (
    idUser,
    callback
) => {

    const sql = `
        SELECT
            u.id_user,
            u.nama,
            u.email,
            u.no_hp,
            u.alamat,
            u.id_role,
            r.nama_role,
            u.created_at,

            p.id_peminjaman,
            p.tanggal_peminjaman,
            p.tanggal_kembali,
            p.total_harga,
            p.status,

            d.id_detail,
            d.id_kostum,
            d.jumlah,
            d.harga,
            d.subtotal,

            k.nama_kostum,
            k.kode_koleksi,
            k.nama_koleksi,
            k.ukuran,
            k.warna,

            pg.id_pengembalian,
            pg.tanggal_pengembalian,
            pg.kondisi_baju,
            pg.denda,
            pg.keterangan,

            pt.nama AS nama_petugas

        FROM users u

        LEFT JOIN roles r
            ON u.id_role = r.id_role

        LEFT JOIN peminjaman p
            ON u.id_user = p.id_user

        LEFT JOIN detail_peminjaman d
            ON p.id_peminjaman =
               d.id_peminjaman

        LEFT JOIN kostum k
            ON d.id_kostum =
               k.id_kostum

        LEFT JOIN pengembalian pg
            ON p.id_peminjaman =
               pg.id_peminjaman

        LEFT JOIN petugas pt
            ON pg.diterima_oleh =
               pt.id_petugas

        WHERE
            u.id_user = ?
            AND u.deleted_at IS NULL

        ORDER BY
            p.id_peminjaman DESC,
            d.id_detail ASC
    `;

    db.query(
        sql,
        [idUser],
        callback
    );
};

// ========================================
// GET SEMUA ADMIN
// ========================================

const getAdmins = (
    callback
) => {

    const query = `
        SELECT
            u.id_user,
            u.nama,
            u.email,
            u.no_hp,
            u.alamat,
            u.id_role,
            r.nama_role,
            u.created_at,
            u.updated_at
        FROM users u
        LEFT JOIN roles r
            ON u.id_role = r.id_role
        WHERE
            u.id_role = 1
            AND u.deleted_at IS NULL
        ORDER BY
            u.id_user DESC
    `;

    db.query(
        query,
        (err, result) => {

            if (err) {
                console.error(
                    "Error getAdmins:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                result
            );
        }
    );
};

// ========================================
// EXPORT
// ========================================

module.exports = {
    getAllUsers,
    getUserById,
    loginUser,
    createUser,
    updateUser,
    deleteUser,
    checkEmailExists,
    searchUsers,
    getTotalUsers,
    getUsersByRole,
    getAdmins,
    getUserPassword,
    updatePassword,
    getCustomerDetail
};