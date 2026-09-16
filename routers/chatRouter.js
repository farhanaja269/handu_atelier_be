// routers/chatRouter.js

const express = require("express");

const router =
    express.Router();

const chatController =
    require(
        "../controllers/chatController"
    );

// ======================================================
// CUSTOMER
// ======================================================

router.get(
    "/customer/:id_user",
    chatController.getCustomerChat
);

// ======================================================
// PETUGAS - DAFTAR CHAT
// ======================================================

router.get(
    "/petugas/:id_user",
    chatController.getPetugasChats
);

// ======================================================
// PETUGAS - DETAIL CHAT
// ======================================================

router.get(
    "/petugas/:id_user/conversation/:id_percakapan",
    chatController.getPetugasChatDetail
);

// ======================================================
// KIRIM PESAN
// ======================================================

router.post(
    "/message",
    chatController.sendMessage
);

// ======================================================
// MARK READ
// ======================================================

router.put(
    "/:id_percakapan/read",
    chatController.markAsRead
);

module.exports = router;