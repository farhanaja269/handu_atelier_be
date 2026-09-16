const express = require("express");

const router = express.Router();

const notificationController = require(
    "../controllers/notificationController"
);


// ========================================
// GET SEMUA NOTIFIKASI
// GET /api/notifications
// ========================================

router.get(
    "/",
    notificationController.getAllNotifications
);


// ========================================
// GET NOTIFIKASI USER
// GET /api/notifications/user/:id_user
// ========================================

router.get(
    "/user/:id_user",
    notificationController.getNotificationsByUser
);


// ========================================
// JUMLAH BELUM DIBACA
// GET /api/notifications/unread/:id_user
// ========================================

router.get(
    "/unread/:id_user",
    notificationController.getUnreadCount
);


// ========================================
// TAMBAH NOTIFIKASI
// POST /api/notifications
// ========================================

router.post(
    "/",
    notificationController.createNotification
);


// ========================================
// TANDAI SATU SUDAH DIBACA
// PUT /api/notifications/read/:id_notifikasi
// ========================================

router.put(
    "/read/:id_notifikasi",
    notificationController.markAsRead
);


// ========================================
// TANDAI SEMUA SUDAH DIBACA
// PUT /api/notifications/read-all/:id_user
// ========================================

router.put(
    "/read-all/:id_user",
    notificationController.markAllAsRead
);


// ========================================
// HAPUS NOTIFIKASI
// DELETE /api/notifications/:id_notifikasi
// ========================================

router.delete(
    "/:id_notifikasi",
    notificationController.deleteNotification
);


module.exports = router;