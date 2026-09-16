const notificationModel =
    require("../models/notificationModel");


// ======================================================
// GET SEMUA NOTIFIKASI
// ======================================================

const getAllNotifications = (
    req,
    res
) => {

    notificationModel.getAllNotifications(
        (
            err,
            results
        ) => {

            if (err) {

                console.error(
                    "Error get notifications:",
                    err
                );

                return res.status(
                    500
                ).json({

                    success: false,

                    message:
                        "Gagal mengambil notifikasi",

                    error:
                        err.message

                });

            }


            return res.status(
                200
            ).json({

                success: true,

                total:
                    results.length,

                notifications:
                    results

            });

        }
    );
};


// ======================================================
// GET NOTIFIKASI USER
// ======================================================

const getNotificationsByUser = (
    req,
    res
) => {

    const {
        id_user
    } = req.params;


    if (!id_user) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                "id_user wajib diisi"

        });

    }


    notificationModel.getNotificationsByUser(
        id_user,
        (
            err,
            results
        ) => {

            if (err) {

                console.error(
                    "Error get notifications by user:",
                    err
                );

                return res.status(
                    500
                ).json({

                    success: false,

                    message:
                        "Gagal mengambil notifikasi",

                    error:
                        err.message

                });

            }


            return res.status(
                200
            ).json({

                success: true,

                total:
                    results.length,

                notifications:
                    results

            });

        }
    );
};


// ======================================================
// JUMLAH UNREAD
// ======================================================

const getUnreadCount = (
    req,
    res
) => {

    const {
        id_user
    } = req.params;


    if (!id_user) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                "id_user wajib diisi"

        });

    }


    notificationModel.getUnreadCount(
        id_user,
        (
            err,
            results
        ) => {

            if (err) {

                console.error(
                    "Error get unread count:",
                    err
                );

                return res.status(
                    500
                ).json({

                    success: false,

                    message:
                        "Gagal menghitung notifikasi",

                    error:
                        err.message

                });

            }


            return res.status(
                200
            ).json({

                success: true,

                total:
                    results[0]?.total || 0

            });

        }
    );
};


// ======================================================
// CREATE NOTIFICATION
// ======================================================

const createNotification = (
    req,
    res
) => {

    const {
        id_user,
        pesan
    } = req.body;


    if (
        !id_user ||
        !pesan
    ) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                "id_user dan pesan wajib diisi"

        });

    }


    notificationModel.createNotification(
        id_user,
        pesan,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error create notification:",
                    err
                );

                return res.status(
                    500
                ).json({

                    success: false,

                    message:
                        "Gagal membuat notifikasi",

                    error:
                        err.message

                });

            }


            return res.status(
                201
            ).json({

                success: true,

                message:
                    "Notifikasi berhasil dibuat",

                id_notifikasi:
                    result.insertId

            });

        }
    );
};


// ======================================================
// MARK AS READ
// ======================================================

const markAsRead = (
    req,
    res
) => {

    const {
        id_notifikasi
    } = req.params;


    if (!id_notifikasi) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                "id_notifikasi wajib diisi"

        });

    }


    notificationModel.markAsRead(
        id_notifikasi,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error mark notification:",
                    err
                );

                return res.status(
                    500
                ).json({

                    success: false,

                    message:
                        "Gagal mengubah status notifikasi",

                    error:
                        err.message

                });

            }


            if (
                result.affectedRows ===
                0
            ) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "Notifikasi tidak ditemukan"

                });

            }


            return res.status(
                200
            ).json({

                success: true,

                message:
                    "Notifikasi sudah dibaca"

            });

        }
    );
};


// ======================================================
// MARK ALL AS READ
// ======================================================

const markAllAsRead = (
    req,
    res
) => {

    const {
        id_user
    } = req.params;


    if (!id_user) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                "id_user wajib diisi"

        });

    }


    notificationModel.markAllAsRead(
        id_user,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error mark all notifications:",
                    err
                );

                return res.status(
                    500
                ).json({

                    success: false,

                    message:
                        "Gagal mengubah status notifikasi",

                    error:
                        err.message

                });

            }


            return res.status(
                200
            ).json({

                success: true,

                message:
                    "Semua notifikasi sudah dibaca",

                updated:
                    result.affectedRows

            });

        }
    );
};


// ======================================================
// DELETE
// ======================================================

const deleteNotification = (
    req,
    res
) => {

    const {
        id_notifikasi
    } = req.params;


    if (!id_notifikasi) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                "id_notifikasi wajib diisi"

        });

    }


    notificationModel.deleteNotification(
        id_notifikasi,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error delete notification:",
                    err
                );

                return res.status(
                    500
                ).json({

                    success: false,

                    message:
                        "Gagal menghapus notifikasi",

                    error:
                        err.message

                });

            }


            if (
                result.affectedRows ===
                0
            ) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "Notifikasi tidak ditemukan"

                });

            }


            return res.status(
                200
            ).json({

                success: true,

                message:
                    "Notifikasi berhasil dihapus"

            });

        }
    );
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getAllNotifications,

    getNotificationsByUser,

    getUnreadCount,

    createNotification,

    markAsRead,

    markAllAsRead,

    deleteNotification

};