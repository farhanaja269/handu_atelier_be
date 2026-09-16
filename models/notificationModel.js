// models/notificationModel.js

const db = require("../config/db");


// ========================================
// GET SEMUA NOTIFIKASI
// ========================================

const getAllNotifications = (
    callback
) => {

    const sql = `
        SELECT
            id_notifikasi,
            id_user,
            pesan,
            status,
            created_at
        FROM notifikasi
        ORDER BY created_at DESC
    `;

    db.query(
        sql,
        callback
    );
};


// ========================================
// GET NOTIFIKASI BERDASARKAN USER
// ========================================

const getNotificationsByUser = (
    id_user,
    callback
) => {

    const sql = `
        SELECT
            id_notifikasi,
            id_user,
            pesan,
            status,
            created_at
        FROM notifikasi
        WHERE id_user = ?
        ORDER BY created_at DESC
    `;

    db.query(
        sql,
        [id_user],
        callback
    );
};


// ========================================
// JUMLAH NOTIFIKASI BELUM DIBACA
// ========================================

const getUnreadCount = (
    id_user,
    callback
) => {

    const sql = `
        SELECT COUNT(*) AS total
        FROM notifikasi
        WHERE id_user = ?
        AND status = 'Belum Dibaca'
    `;

    db.query(
        sql,
        [id_user],
        callback
    );
};


// ========================================
// TAMBAH NOTIFIKASI
// ========================================

const createNotification = (
    id_user,
    pesan,
    callback
) => {

    const sql = `
        INSERT INTO notifikasi
        (
            id_user,
            pesan,
            status,
            created_at
        )
        VALUES
        (
            ?,
            ?,
            'Belum Dibaca',
            NOW()
        )
    `;

    db.query(
        sql,
        [
            id_user,
            pesan
        ],
        callback
    );
};


// ========================================
// TAMBAH NOTIFIKASI UNTUK USER
// ========================================
//
// Alias khusus yang digunakan oleh
// controller pembayaran dan controller lain.
//

const createNotificationForUser = (
    id_user,
    pesan,
    callback
) => {

    createNotification(
        id_user,
        pesan,
        callback
    );
};


// ========================================
// TAMBAH NOTIFIKASI UNTUK SEMUA ADMIN
// ========================================
//
// Admin menggunakan id_role = 1.
//

const createNotificationForAdmins = (
    pesan,
    callback
) => {

    const sql = `
        SELECT
            id_user
        FROM users
        WHERE id_role = 1
        AND deleted_at IS NULL
    `;

    db.query(
        sql,
        (
            err,
            admins
        ) => {

            if (err) {
                return callback(
                    err
                );
            }

            if (
                !admins ||
                admins.length === 0
            ) {
                return callback(
                    null,
                    {
                        affectedRows: 0
                    }
                );
            }

            let selesai = 0;
            let errorPertama = null;
            let affectedRows = 0;

            admins.forEach(
                (admin) => {

                    createNotification(
                        admin.id_user,
                        pesan,
                        (
                            notificationError,
                            result
                        ) => {

                            selesai++;

                            if (
                                notificationError &&
                                !errorPertama
                            ) {
                                errorPertama =
                                    notificationError;
                            }

                            if (
                                result &&
                                result.affectedRows
                            ) {
                                affectedRows +=
                                    result.affectedRows;
                            }

                            if (
                                selesai ===
                                admins.length
                            ) {

                                callback(
                                    errorPertama,
                                    {
                                        affectedRows
                                    }
                                );
                            }
                        }
                    );
                }
            );
        }
    );
};


// ========================================
// UBAH SATU NOTIFIKASI MENJADI
// SUDAH DIBACA
// ========================================

const markAsRead = (
    id_notifikasi,
    callback
) => {

    const sql = `
        UPDATE notifikasi
        SET status = 'Sudah Dibaca'
        WHERE id_notifikasi = ?
    `;

    db.query(
        sql,
        [id_notifikasi],
        callback
    );
};


// ========================================
// UBAH SEMUA NOTIFIKASI MENJADI
// SUDAH DIBACA
// ========================================

const markAllAsRead = (
    id_user,
    callback
) => {

    const sql = `
        UPDATE notifikasi
        SET status = 'Sudah Dibaca'
        WHERE id_user = ?
        AND status = 'Belum Dibaca'
    `;

    db.query(
        sql,
        [id_user],
        callback
    );
};


// ========================================
// HAPUS NOTIFIKASI
// ========================================

const deleteNotification = (
    id_notifikasi,
    callback
) => {

    const sql = `
        DELETE FROM notifikasi
        WHERE id_notifikasi = ?
    `;

    db.query(
        sql,
        [id_notifikasi],
        callback
    );
};


// ========================================
// EXPORT
// ========================================

module.exports = {
    getAllNotifications,
    getNotificationsByUser,
    getUnreadCount,
    createNotification,
    createNotificationForUser,
    createNotificationForAdmins,
    markAsRead,
    markAllAsRead,
    deleteNotification
}; 