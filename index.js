// ==================================================
// CONFIG
// ==================================================

require("dotenv").config();

const express = require("express");

const cors = require("cors");

const path = require("path");

const http = require("http");

const multer = require("multer");

const {
    Server
} = require("socket.io");


const app = express();


// ==================================================
// PORT
// ==================================================

const PORT =
    Number(process.env.PORT) || 3001;


// ==================================================
// HTTP SERVER
// ==================================================

const server =
    http.createServer(app);


// ==================================================
// SOCKET.IO
// ==================================================

const io =
    new Server(
        server,
        {
            cors: {

                origin: true,

                methods: [
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "OPTIONS"
                ],

                credentials: true

            },

            transports: [
                "websocket",
                "polling"
            ]
        }
    );


// ==================================================
// SOCKET.IO CONNECTION
// ==================================================

io.on(
    "connection",
    (socket) => {

        console.log(
            `Socket terhubung: ${socket.id}`
        );


        // ==============================================
        // JOIN CONVERSATION
        // ==============================================

        socket.on(
            "join_conversation",
            (id_percakapan) => {

                const id =
                    Number(
                        id_percakapan
                    );


                if (
                    !Number.isInteger(id) ||
                    id <= 0
                ) {

                    console.log(
                        "ID percakapan tidak valid:",
                        id_percakapan
                    );

                    return;

                }


                const room =
                    `conversation:${id}`;


                socket.join(
                    room
                );


                console.log(
                    `Socket ${socket.id} masuk ${room}`
                );

            }
        );


        // ==============================================
        // LEAVE CONVERSATION
        // ==============================================

        socket.on(
            "leave_conversation",
            (id_percakapan) => {

                const id =
                    Number(
                        id_percakapan
                    );


                if (
                    !Number.isInteger(id) ||
                    id <= 0
                ) {

                    return;

                }


                const room =
                    `conversation:${id}`;


                socket.leave(
                    room
                );


                console.log(
                    `Socket ${socket.id} keluar ${room}`
                );

            }
        );


        // ==============================================
        // DISCONNECT
        // ==============================================

        socket.on(
            "disconnect",
            (reason) => {

                console.log(
                    `Socket terputus: ${socket.id} - ${reason}`
                );

            }
        );

    }
);


// ==================================================
// STATIC UPLOADS
// ==================================================

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);


// ==================================================
// CORS
// ==================================================

app.use(
    cors(
        {
            origin: true,

            credentials: true
        }
    )
);


// ==================================================
// BODY PARSER
// ==================================================

app.use(
    express.json(
        {
            limit: "10mb"
        }
    )
);


app.use(
    express.urlencoded(
        {
            extended: true,

            limit: "10mb"
        }
    )
);


// ==================================================
// KONEKSI DATABASE
// ==================================================

require(
    "./config/db"
);


// ==================================================
// IMPORT ROUTER
// ==================================================

const usersRouter =
    require(
        "./routers/usersRouter"
    );


const adminRouter =
    require(
        "./routers/adminRouter"
    );


const petugasRouter =
    require(
        "./routers/petugasRouter"
    );


const kategoriRouter =
    require(
        "./routers/kategoriRouter"
    );


const kostumRouter =
    require(
        "./routers/kostumRouter"
    );


const koleksiRouter =
    require(
        "./routers/koleksiRouter"
    );


const registrasiRouter =
    require(
        "./routers/registrasiRouter"
    );


const peminjamanRouter =
    require(
        "./routers/peminjamanRouter"
    );


const detailPeminjamanRouter =
    require(
        "./routers/detailPeminjamanRouter"
    );


const pengembalianRouter =
    require(
        "./routers/pengembalianRouter"
    );


const pembayaranRouter =
    require(
        "./routers/pembayaranRouter"
    );


const notificationRouter =
    require(
        "./routers/notificationRouter"
    );


const pengaturanPembayaranRouter =
    require(
        "./routers/pengaturanPembayaranRouter"
    );


const chatRouter =
    require(
        "./routers/chatRouter"
    );


// ==================================================
// ROUTER DENDA
// ==================================================

const dendaRouter =
    require(
        "./routers/dendaRouter"
    );


// ==================================================
// ROUTER PEMBAYARAN DENDA
// ==================================================

const pembayaranDendaRouter =
    require(
        "./routers/pembayaranDendaRouter"
    );


// ==================================================
// ROUTER PENGEMBALIAN DANA
// ==================================================

const pengembalianDanaRouter =
    require(
        "./routers/pengembalianDanaRouter"
    );


// ==================================================
// CHAT CONTROLLER
// ==================================================

const chatController =
    require(
        "./controllers/chatController"
    );


// ==================================================
// HUBUNGKAN CHAT CONTROLLER
// DENGAN SOCKET.IO
// ==================================================

chatController.setSocketIO(
    io
);


// ==================================================
// API ROUTER
// ==================================================

app.use(
    "/api/users",
    usersRouter
);


app.use(
    "/api/admin",
    adminRouter
);


app.use(
    "/api/petugas",
    petugasRouter
);


app.use(
    "/api/kategori",
    kategoriRouter
);


app.use(
    "/api/kostum",
    kostumRouter
);


app.use(
    "/api/koleksi",
    koleksiRouter
);


app.use(
    "/api/registrasi",
    registrasiRouter
);


app.use(
    "/api/peminjaman",
    peminjamanRouter
);


app.use(
    "/api/detail-peminjaman",
    detailPeminjamanRouter
);


app.use(
    "/api/pengembalian",
    pengembalianRouter
);


app.use(
    "/api/pembayaran",
    pembayaranRouter
);


app.use(
    "/api/notifications",
    notificationRouter
);


app.use(
    "/api/pengaturan-pembayaran",
    pengaturanPembayaranRouter
);


// ==================================================
// ROUTER DENDA
// ==================================================

app.use(
    "/api/denda",
    dendaRouter
);


// ==================================================
// ROUTER PEMBAYARAN DENDA
// ==================================================

app.use(
    "/api/pembayaran-denda",
    pembayaranDendaRouter
);


// ==================================================
// ROUTER PENGEMBALIAN DANA
// ==================================================

app.use(
    "/api/pengembalian-dana",
    pengembalianDanaRouter
);


// ==================================================
// CHAT ROUTER
// ==================================================

app.use(
    "/api/chat",
    chatRouter
);


// ==================================================
// ROUTE UTAMA BACKEND
// ==================================================

app.get(
    "/",
    (req, res) => {

        res.status(200).json(
            {

                success: true,

                message:
                    "Backend Handu Atelier Berjalan",

                version:
                    "1.0.0",

                endpoints: {

                    users:
                        "/api/users",

                    admin:
                        "/api/admin",

                    petugas:
                        "/api/petugas",

                    kategori:
                        "/api/kategori",

                    kostum:
                        "/api/kostum",

                    koleksi:
                        "/api/koleksi",

                    registrasi:
                        "/api/registrasi",

                    peminjaman:
                        "/api/peminjaman",

                    detailPeminjaman:
                        "/api/detail-peminjaman",

                    pengembalian:
                        "/api/pengembalian",

                    pembayaran:
                        "/api/pembayaran",

                    denda:
                        "/api/denda",

                    pembayaranDenda:
                        "/api/pembayaran-denda",

                    pengembalianDana:
                        "/api/pengembalian-dana",

                    notifications:
                        "/api/notifications",

                    pengaturanPembayaran:
                        "/api/pengaturan-pembayaran",

                    chat:
                        "/api/chat"

                },

                socket:
                    true,

                timestamp:
                    new Date().toISOString()

            }
        );

    }
);


// ==================================================
// FRONTEND REACT DIST
// ==================================================

const buildPath =
    path.join(
        __dirname,
        "dist"
    );


app.use(
    express.static(
        buildPath
    )
);


// ==================================================
// FRONTEND FALLBACK
// ==================================================

app.use(
    (req, res, next) => {

        // ==========================================
        // JANGAN GANGGU API
        // ==========================================

        if (
            req.path.startsWith(
                "/api/"
            )
        ) {

            return next();

        }


        // ==========================================
        // JANGAN GANGGU SOCKET.IO
        // ==========================================

        if (
            req.path.startsWith(
                "/socket.io/"
            )
        ) {

            return next();

        }


        const indexPath =
            path.join(
                buildPath,
                "index.html"
            );


        res.sendFile(
            indexPath,
            (err) => {

                if (err) {

                    next(err);

                }

            }
        );

    }
);


// ==================================================
// 404 HANDLER
// ==================================================

app.use(
    (req, res) => {

        res.status(404).json(
            {

                success: false,

                message:
                    "Endpoint tidak ditemukan",

                path:
                    req.originalUrl

            }
        );

    }
);


// ==================================================
// ERROR HANDLER
// ==================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "================================="
        );

        console.error(
            "ERROR BACKEND:"
        );

        console.error(
            err
        );

        console.error(
            "MESSAGE:",
            err.message
        );

        console.error(
            "STACK:",
            err.stack
        );

        console.error(
            "================================="
        );


        // ==========================================
        // JIKA RESPONSE SUDAH TERKIRIM
        // ==========================================

        if (
            res.headersSent
        ) {

            return next(err);

        }


        // ==========================================
        // MULTER ERROR
        // ==========================================

        if (
            err instanceof
            multer.MulterError
        ) {

            if (
                err.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res
                    .status(400)
                    .json(
                        {

                            success: false,

                            message:
                                "Ukuran bukti pembayaran maksimal 5 MB."

                        }
                    );

            }


            return res
                .status(400)
                .json(
                    {

                        success: false,

                        message:
                            `Upload file gagal: ${err.message}`

                    }
                );

        }


        // ==========================================
        // ERROR FORMAT FILE
        // ==========================================

        if (
            err.message &&
            err.message.includes(
                "Format bukti pembayaran"
            )
        ) {

            return res
                .status(400)
                .json(
                    {

                        success: false,

                        message:
                            err.message

                    }
                );

        }


        // ==========================================
        // ERROR VALIDASI UMUM
        // ==========================================

        const statusCode =
            err.status ||
            err.statusCode ||
            500;


        return res
            .status(statusCode)
            .json(
                {

                    success: false,

                    message:
                        err.message ||
                        "Terjadi kesalahan pada server",

                    error:
                        process.env.NODE_ENV ===
                        "development"
                            ? err.stack
                            : undefined

                }
            );

    }
);


// ==================================================
// ERROR SERVER
// ==================================================

server.on(
    "error",
    (error) => {

        console.error(
            "================================="
        );

        console.error(
            "SERVER ERROR:"
        );

        console.error(
            error
        );

        console.error(
            "================================="
        );

    }
);


// ==================================================
// START SERVER
// ==================================================

server.listen(
    PORT,
    () => {

        console.log(
            "================================="
        );

        console.log(
            "Backend Handu Atelier"
        );

        console.log(
            `Server berjalan di http://localhost:${PORT}`
        );

        console.log(
            `Environment: ${
                process.env.NODE_ENV ||
                "development"
            }`
        );

        console.log(
            "Socket.IO aktif"
        );

        console.log(
            `Socket.IO URL: http://localhost:${PORT}`
        );

        console.log(
            "================================="
        );


        console.log(
            "Available endpoints:"
        );

        console.log(
            "GET  /"
        );

        console.log(
            "/api/users"
        );

        console.log(
            "/api/admin"
        );

        console.log(
            "/api/petugas"
        );

        console.log(
            "/api/kategori"
        );

        console.log(
            "/api/kostum"
        );

        console.log(
            "/api/koleksi"
        );

        console.log(
            "/api/registrasi"
        );

        console.log(
            "/api/peminjaman"
        );

        console.log(
            "/api/detail-peminjaman"
        );

        console.log(
            "/api/pengembalian"
        );

        console.log(
            "/api/pembayaran"
        );

        console.log(
            "/api/denda"
        );

        console.log(
            "/api/pembayaran-denda"
        );

        console.log(
            "/api/pengembalian-dana"
        );

        console.log(
            "/api/notifications"
        );

        console.log(
            "/api/pengaturan-pembayaran"
        );

        console.log(
            "/api/chat"
        );

        console.log(
            "================================="
        );

    }
);