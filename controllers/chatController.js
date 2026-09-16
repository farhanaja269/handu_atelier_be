// controllers/chatController.js

const chatModel =
    require("../models/chatModel");

let io = null;

const setSocketIO = (
    socketIO
) => {
    io = socketIO;
};

// ======================================================
// CUSTOMER CHAT
// ======================================================

const getCustomerChat = (
    req,
    res
) => {
    const id_user =
        Number(req.params.id_user);

    if (!id_user) {
        return res.status(400).json({
            success: false,
            message:
                "ID user tidak valid"
        });
    }

    chatModel.getCustomerChat(
        id_user,
        (err, data) => {
            if (err) {
                console.error(
                    "GET CUSTOMER CHAT ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil chat",
                    error: err.message
                });
            }

            res.json({
                success: true,
                ...data
            });
        }
    );
};

// ======================================================
// PETUGAS - DAFTAR CHAT
// ======================================================

const getPetugasChats = (
    req,
    res
) => {
    const id_user =
        Number(req.params.id_user);

    if (!id_user) {
        return res.status(400).json({
            success: false,
            message:
                "ID petugas tidak valid"
        });
    }

    chatModel.getPetugasChats(
        id_user,
        (err, data) => {
            if (err) {
                console.error(
                    "GET PETUGAS CHATS ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil daftar chat",
                    error: err.message
                });
            }

            res.json({
                success: true,
                data: data || []
            });
        }
    );
};

// ======================================================
// PETUGAS - DETAIL CHAT
// ======================================================

const getPetugasChatDetail = (
    req,
    res
) => {
    const id_user =
        Number(req.params.id_user);

    const id_percakapan =
        Number(
            req.params.id_percakapan
        );

    if (
        !id_user ||
        !id_percakapan
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Parameter chat tidak valid"
        });
    }

    chatModel.getPetugasChatDetail(
        id_user,
        id_percakapan,
        (err, data) => {
            if (err) {
                console.error(
                    "GET PETUGAS CHAT DETAIL ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil detail chat",
                    error: err.message
                });
            }

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Percakapan tidak ditemukan"
                });
            }

            res.json({
                success: true,
                ...data
            });
        }
    );
};

// ======================================================
// SEND MESSAGE
// ======================================================

const sendMessage = (
    req,
    res
) => {
    const id_user =
        Number(req.body.id_user);

    const id_percakapan =
        Number(
            req.body.id_percakapan
        );

    const pesan =
        String(
            req.body.pesan || ""
        ).trim();

    if (!id_user) {
        return res.status(400).json({
            success: false,
            message:
                "ID user wajib diisi"
        });
    }

    if (!id_percakapan) {
        return res.status(400).json({
            success: false,
            message:
                "ID percakapan wajib diisi"
        });
    }

    if (!pesan) {
        return res.status(400).json({
            success: false,
            message:
                "Pesan tidak boleh kosong"
        });
    }

    if (pesan.length > 5000) {
        return res.status(400).json({
            success: false,
            message:
                "Pesan terlalu panjang"
        });
    }

    chatModel.createMessage(
        id_user,
        id_percakapan,
        pesan,
        (err, rows) => {
            if (err) {
                console.error(
                    "SEND CHAT MESSAGE ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengirim pesan",
                    error: err.message
                });
            }

            const message =
                Array.isArray(rows)
                    ? rows[0]
                    : null;

                    if (
    io &&
    message
) {
    io
        .to(
            `conversation:${id_percakapan}`
        )
        .emit(
            "new_message",
            message
        );
}

            chatModel.updateConversationTime(
                id_percakapan,
                () => {
                    res.json({
                        success: true,
                        data: message
                    });
                }
            );
        }
    );
};

// ======================================================
// MARK READ
// ======================================================

const markAsRead = (
    req,
    res
) => {
    const id_percakapan =
        Number(
            req.params.id_percakapan
        );

    const id_user =
        Number(req.body.id_user);

    if (
        !id_percakapan ||
        !id_user
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Parameter tidak valid"
        });
    }

    chatModel.markAsRead(
        id_percakapan,
        id_user,
        (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal menandai pesan",
                    error: err.message
                });
            }

            res.json({
                success: true,
                message:
                    "Pesan ditandai sudah dibaca"
            });
        }
    );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getCustomerChat,
    getPetugasChats,
    getPetugasChatDetail,
    sendMessage,
    markAsRead,
    setSocketIO
};