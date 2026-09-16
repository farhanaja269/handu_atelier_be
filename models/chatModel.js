// models/chatModel.js

const db = require("../config/db");

// ======================================================
// CUSTOMER - AMBIL / BUAT PERCAKAPAN
// ======================================================

const getOrCreateCustomerConversation = (
    id_pelanggan,
    callback
) => {

    if (!id_pelanggan) {
        return callback(
            new Error("ID pelanggan tidak valid.")
        );
    }

    const findSql = `
        SELECT
            p.id_percakapan,
            p.id_pelanggan,
            p.id_petugas,
            p.status,
            p.created_at,
            p.updated_at
        FROM percakapan p
        WHERE p.id_pelanggan = ?
        AND p.status = 'Aktif'
        ORDER BY p.updated_at DESC
        LIMIT 1
    `;

    db.query(
        findSql,
        [id_pelanggan],
        (err, rows) => {

            if (err) {
                console.error(
                    "CHAT getOrCreate find error:",
                    err
                );

                return callback(err);
            }

            // ==========================================
            // SUDAH ADA
            // ==========================================

            if (
                rows &&
                rows.length > 0
            ) {
                return callback(
                    null,
                    rows[0]
                );
            }

            // ==========================================
            // BELUM ADA → BUAT
            // ==========================================

            const insertSql = `
                INSERT INTO percakapan
                (
                    id_pelanggan,
                    id_petugas,
                    status,
                    created_at,
                    updated_at
                )
                VALUES
                (
                    ?,
                    NULL,
                    'Aktif',
                    NOW(),
                    NOW()
                )
            `;

            db.query(
                insertSql,
                [id_pelanggan],
                (insertErr, result) => {

                    if (insertErr) {
                        console.error(
                            "CHAT create conversation error:",
                            insertErr
                        );

                        return callback(
                            insertErr
                        );
                    }

                    callback(
                        null,
                        {
                            id_percakapan:
                                result.insertId,

                            id_pelanggan:
                                Number(id_pelanggan),

                            id_petugas:
                                null,

                            status:
                                "Aktif"
                        }
                    );
                }
            );
        }
    );
};


// ======================================================
// CUSTOMER - AMBIL CHAT
// ======================================================

const getCustomerChat = (
    id_pelanggan,
    callback
) => {

    getOrCreateCustomerConversation(
        id_pelanggan,
        (err, conversation) => {

            if (err) {
                return callback(err);
            }

            if (!conversation) {
                return callback(
                    new Error(
                        "Percakapan pelanggan tidak ditemukan."
                    )
                );
            }

            const sql = `
                SELECT
                    m.id_pesan,
                    m.id_percakapan,
                    m.id_pengirim,
                    m.pesan,
                    m.status,
                    m.created_at,
                    u.nama AS nama_pengirim
                FROM pesan_chat m
                LEFT JOIN users u
                    ON u.id_user = m.id_pengirim
                WHERE m.id_percakapan = ?
                ORDER BY
                    m.created_at ASC,
                    m.id_pesan ASC
            `;

            db.query(
                sql,
                [
                    conversation.id_percakapan
                ],
                (messageErr, messages) => {

                    if (messageErr) {
                        console.error(
                            "CHAT customer messages error:",
                            messageErr
                        );

                        return callback(
                            messageErr
                        );
                    }

                    callback(
                        null,
                        {
                            conversation,
                            messages:
                                messages || []
                        }
                    );
                }
            );
        }
    );
};


// ======================================================
// PETUGAS - DAFTAR CHAT
// ======================================================

const getPetugasChats = (
    id_petugas,
    callback
) => {

    if (!id_petugas) {
        return callback(
            new Error(
                "ID petugas tidak valid."
            )
        );
    }

    const sql = `
        SELECT
            p.id_percakapan,
            p.id_pelanggan,
            p.id_petugas,
            p.status,
            p.created_at,
            p.updated_at,

            u.nama AS nama_pelanggan,
            u.email AS email_pelanggan,

            (
                SELECT pc.pesan
                FROM pesan_chat pc
                WHERE pc.id_percakapan =
                    p.id_percakapan
                ORDER BY
                    pc.created_at DESC,
                    pc.id_pesan DESC
                LIMIT 1
            ) AS pesan_terakhir,

            (
                SELECT pc.created_at
                FROM pesan_chat pc
                WHERE pc.id_percakapan =
                    p.id_percakapan
                ORDER BY
                    pc.created_at DESC,
                    pc.id_pesan DESC
                LIMIT 1
            ) AS waktu_terakhir,

            (
                SELECT COUNT(*)
                FROM pesan_chat pc
                WHERE pc.id_percakapan =
                    p.id_percakapan
                AND pc.id_pengirim != ?
                AND pc.status = 'Terkirim'
            ) AS unread_count

        FROM percakapan p

        LEFT JOIN users u
            ON u.id_user = p.id_pelanggan

        WHERE
            p.status = 'Aktif'
            AND (
                p.id_petugas = ?
                OR p.id_petugas IS NULL
            )

        ORDER BY
            COALESCE(
                (
                    SELECT pc.created_at
                    FROM pesan_chat pc
                    WHERE pc.id_percakapan =
                        p.id_percakapan
                    ORDER BY
                        pc.created_at DESC,
                        pc.id_pesan DESC
                    LIMIT 1
                ),
                p.updated_at
            ) DESC
    `;

    db.query(
        sql,
        [
            id_petugas,
            id_petugas
        ],
        (err, rows) => {

            if (err) {
                console.error(
                    "CHAT petugas list error:",
                    err
                );

                return callback(err);
            }

            callback(
                null,
                rows || []
            );
        }
    );
};


// ======================================================
// PETUGAS - DETAIL CHAT
// ======================================================

const getPetugasChatDetail = (
    id_petugas,
    id_percakapan,
    callback
) => {

    if (!id_petugas) {
        return callback(
            new Error(
                "ID petugas tidak valid."
            )
        );
    }

    if (!id_percakapan) {
        return callback(
            new Error(
                "ID percakapan tidak valid."
            )
        );
    }

    const sql = `
        SELECT
            p.id_percakapan,
            p.id_pelanggan,
            p.id_petugas,
            p.status,
            p.created_at,
            p.updated_at,

            u.nama AS nama_pelanggan,
            u.email AS email_pelanggan

        FROM percakapan p

        LEFT JOIN users u
            ON u.id_user = p.id_pelanggan

        WHERE
            p.id_percakapan = ?

            AND (
                p.id_petugas = ?
                OR p.id_petugas IS NULL
            )

        LIMIT 1
    `;

    db.query(
        sql,
        [
            id_percakapan,
            id_petugas
        ],
        (err, conversations) => {

            if (err) {
                console.error(
                    "CHAT petugas detail error:",
                    err
                );

                return callback(err);
            }

            if (
                !conversations ||
                conversations.length === 0
            ) {
                return callback(
                    null,
                    null
                );
            }

            const conversation =
                conversations[0];

            const messageSql = `
                SELECT
                    m.id_pesan,
                    m.id_percakapan,
                    m.id_pengirim,
                    m.pesan,
                    m.status,
                    m.created_at,
                    u.nama AS nama_pengirim
                FROM pesan_chat m
                LEFT JOIN users u
                    ON u.id_user =
                        m.id_pengirim
                WHERE
                    m.id_percakapan = ?
                ORDER BY
                    m.created_at ASC,
                    m.id_pesan ASC
            `;

            db.query(
                messageSql,
                [
                    id_percakapan
                ],
                (
                    messageErr,
                    messages
                ) => {

                    if (messageErr) {
                        console.error(
                            "CHAT detail messages error:",
                            messageErr
                        );

                        return callback(
                            messageErr
                        );
                    }

                    callback(
                        null,
                        {
                            conversation,
                            messages:
                                messages || []
                        }
                    );
                }
            );
        }
    );
};


// ======================================================
// KIRIM PESAN
// ======================================================

const createMessage = (
    id_pengirim,
    id_percakapan,
    pesan,
    callback
) => {

    if (!id_pengirim) {
        return callback(
            new Error(
                "ID pengirim tidak valid."
            )
        );
    }

    if (!id_percakapan) {
        return callback(
            new Error(
                "ID percakapan tidak valid."
            )
        );
    }

    if (!pesan || !String(pesan).trim()) {
        return callback(
            new Error(
                "Pesan tidak boleh kosong."
            )
        );
    }

    const insertSql = `
        INSERT INTO pesan_chat
        (
            id_percakapan,
            id_pengirim,
            pesan,
            status,
            created_at
        )
        VALUES
        (
            ?,
            ?,
            ?,
            'Terkirim',
            NOW()
        )
    `;

    db.query(
        insertSql,
        [
            id_percakapan,
            id_pengirim,
            String(pesan).trim()
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "CHAT create message error:",
                    err
                );

                return callback(err);
            }

            const getSql = `
                SELECT
                    m.id_pesan,
                    m.id_percakapan,
                    m.id_pengirim,
                    m.pesan,
                    m.status,
                    m.created_at,
                    u.nama AS nama_pengirim
                FROM pesan_chat m
                LEFT JOIN users u
                    ON u.id_user =
                        m.id_pengirim
                WHERE
                    m.id_pesan = ?
                LIMIT 1
            `;

            db.query(
                getSql,
                [
                    result.insertId
                ],
                callback
            );
        }
    );
};


// ======================================================
// UPDATE WAKTU PERCAKAPAN
// ======================================================

const updateConversationTime = (
    id_percakapan,
    callback
) => {

    const sql = `
        UPDATE percakapan
        SET updated_at = NOW()
        WHERE id_percakapan = ?
    `;

    db.query(
        sql,
        [
            id_percakapan
        ],
        callback
    );
};


// ======================================================
// PETUGAS MENGAMBIL CHAT
// ======================================================

const assignPetugas = (
    id_percakapan,
    id_petugas,
    callback
) => {

    const sql = `
        UPDATE percakapan
        SET id_petugas = ?
        WHERE id_percakapan = ?
    `;

    db.query(
        sql,
        [
            id_petugas,
            id_percakapan
        ],
        callback
    );
};


// ======================================================
// MARK AS READ
// ======================================================

const markAsRead = (
    id_percakapan,
    id_user,
    callback
) => {

    const sql = `
        UPDATE pesan_chat
        SET status = 'Dibaca'
        WHERE
            id_percakapan = ?
        AND
            id_pengirim != ?
        AND
            status = 'Terkirim'
    `;

    db.query(
        sql,
        [
            id_percakapan,
            id_user
        ],
        callback
    );
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getOrCreateCustomerConversation,
    getCustomerChat,
    getPetugasChats,
    getPetugasChatDetail,
    createMessage,
    updateConversationTime,
    assignPetugas,
    markAsRead
};