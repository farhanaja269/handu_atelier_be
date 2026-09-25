// ======================================================
// controllers/pembayaranController.js
// ======================================================

const supabase =
    require("../config/supabase");

const pembayaranModel =
    require("../models/pembayaranModel");

const peminjamanModel =
    require("../models/peminjamanModel");

const notificationModel =
    require("../models/notificationModel");


// ======================================================
// HELPER SUPABASE
// ======================================================

const deleteSupabaseFile = async (
    fileValue
) => {
    if (!fileValue) {
        return;
    }

    try {
        let fileName = fileValue;

        // Jika yang tersimpan adalah URL Supabase,
        // ambil nama file setelah /bukti-pembayaran/
        if (
            typeof fileValue === "string" &&
            fileValue.includes(
                "/storage/v1/object/public/bukti-pembayaran/"
            )
        ) {
            fileName =
                fileValue.split(
                    "/storage/v1/object/public/bukti-pembayaran/"
                )[1];
        }

        if (!fileName) {
            return;
        }

        const {
            error
        } =
            await supabase.storage
                .from("bukti-pembayaran")
                .remove([
                    fileName
                ]);

        if (error) {
            console.error(
                "Gagal menghapus file bukti pembayaran dari Supabase:",
                error
            );
        }

    } catch (error) {

        console.error(
            "Error delete file Supabase:",
            error
        );
    }
};


// ======================================================
// HELPER
// ======================================================

const isValidId = (value) => {
    return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        Number.isInteger(
            Number(value)
        ) &&
        Number(value) > 0
    );
};


const isValidPositiveNumber = (
    value
) => {
    return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        Number.isFinite(
            Number(value)
        ) &&
        Number(value) > 0
    );
};


const roundMoney = (value) => {
    return (
        Math.round(
            (Number(value) +
                Number.EPSILON) *
                100
        ) / 100
    );
};


// ======================================================
// KONSTANTA
// ======================================================

const allowedMetodePembayaran = [
    "QRIS",
    "Transfer Bank",
    "Cash"
];


const allowedStatusPembayaran = [
    "Belum Bayar",
    "Lunas"
];


const allowedLoanStatusUntukPembayaran = [
    "Menunggu",
    "Disetujui",
    "Diproses"
];


// ======================================================
// VALIDASI NOMINAL PEMBAYARAN
// HANYA BOLEH DP 50% ATAU 100%
// ======================================================

const validateNominalPembayaran = (
    totalPeminjaman,
    jumlahBayar
) => {

    const total =
        roundMoney(
            totalPeminjaman
        );

    const bayar =
        roundMoney(
            jumlahBayar
        );


    if (
        !isValidPositiveNumber(
            bayar
        )
    ) {

        return {
            valid: false,
            message:
                "Nominal pembayaran harus lebih dari 0"
        };
    }


    if (
        !isValidPositiveNumber(
            total
        )
    ) {

        return {
            valid: false,
            message:
                "Total harga peminjaman tidak valid"
        };
    }


    const pembayaranDP =
        roundMoney(
            total * 0.5
        );

    const pembayaranLunas =
        total;


    const isDP =
        bayar === pembayaranDP;

    const isLunas =
        bayar === pembayaranLunas;


    if (
        !isDP &&
        !isLunas
    ) {

        return {
            valid: false,
            message:
                `Nominal pembayaran harus DP 50% sebesar Rp${pembayaranDP.toLocaleString(
                    "id-ID"
                )} atau pembayaran penuh sebesar Rp${pembayaranLunas.toLocaleString(
                    "id-ID"
                )}.`
        };
    }


    return {
        valid: true,
        isDP,
        isLunas,
        pembayaranDP,
        pembayaranLunas,
        jumlahBayar: bayar
    };
};


// ======================================================
// GET SEMUA PEMBAYARAN
// ======================================================

const getPembayaran = (
    req,
    res
) => {

    pembayaranModel.getAllPembayaran(
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error get pembayaran:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil data pembayaran",
                    error:
                        err.message
                });
            }


            return res.status(200).json({
                success: true,
                data:
                    result
            });
        }
    );
};


// ======================================================
// GET PEMBAYARAN BY ID
// ======================================================

const getPembayaranById = (
    req,
    res
) => {

    const id =
        req.params.id;


    if (
        !isValidId(id)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID pembayaran tidak valid"
        });
    }


    pembayaranModel.getPembayaranById(
        id,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error get pembayaran by id:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil pembayaran",
                    error:
                        err.message
                });
            }


            if (
                !result ||
                result.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Pembayaran tidak ditemukan"
                });
            }


            return res.status(200).json({
                success: true,
                data:
                    result[0]
            });
        }
    );
};


// ======================================================
// GET PEMBAYARAN BY PEMINJAMAN
// ======================================================

const getPembayaranByPeminjaman = (
    req,
    res
) => {

    const idPeminjaman =
        req.params.idPeminjaman;


    if (
        !isValidId(
            idPeminjaman
        )
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman tidak valid"
        });
    }


    pembayaranModel.getPembayaranByPeminjaman(
        idPeminjaman,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "Error get pembayaran peminjaman:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil pembayaran",
                    error:
                        err.message
                });
            }


            return res.status(200).json({
                success: true,
                data:
                    result
            });
        }
    );
};


// ======================================================
// CREATE PEMBAYARAN
// ======================================================

const createPembayaran = (
    req,
    res
) => {

    const data =
        req.body || {};


    const idPeminjaman =
        Number(
            data.id_peminjaman
        );


    // ==================================================
    // VALIDASI ID PEMINJAMAN
    // ==================================================

    if (
        !isValidId(
            idPeminjaman
        )
    ) {

        if (req.file) {
            deleteSupabaseFile(
                req.file.filename
            );
        }

        return res.status(400).json({
            success: false,
            message:
                "ID peminjaman wajib diisi"
        });
    }


    // ==================================================
    // DEBUG FILE
    // ==================================================

    console.log(
        "========== CREATE PEMBAYARAN =========="
    );

    console.log(
        "BODY PEMBAYARAN:",
        data
    );

    console.log(
        "FILE PEMBAYARAN:",
        req.file
            ? {
                fieldname:
                    req.file.fieldname,
                originalname:
                    req.file.originalname,
                filename:
                    req.file.filename,
                publicUrl:
                    req.file.publicUrl,
                mimetype:
                    req.file.mimetype,
                size:
                    req.file.size
            }
            : null
    );

    console.log(
        "========================================"
    );


    // ==================================================
    // AMBIL DATA PEMINJAMAN
    // ==================================================

    peminjamanModel.getPeminjamanById(
        idPeminjaman,
        async (
            loanErr,
            loanResult
        ) => {

            if (loanErr) {

                console.error(
                    "Error cek peminjaman:",
                    loanErr
                );

                if (req.file) {
                    await deleteSupabaseFile(
                        req.file.filename
                    );
                }

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal memeriksa peminjaman",
                    error:
                        loanErr.message
                });
            }


            if (
                !loanResult ||
                loanResult.length === 0
            ) {

                if (req.file) {
                    await deleteSupabaseFile(
                        req.file.filename
                    );
                }

                return res.status(404).json({
                    success: false,
                    message:
                        "Peminjaman tidak ditemukan"
                });
            }


            const loan =
                loanResult[0];


            // ==================================================
            // VALIDASI STATUS PEMINJAMAN
            // ==================================================

            if (
                !allowedLoanStatusUntukPembayaran.includes(
                    loan.status
                )
            ) {

                if (req.file) {
                    await deleteSupabaseFile(
                        req.file.filename
                    );
                }

                return res.status(400).json({
                    success: false,
                    message:
                        `Pembayaran tidak dapat dibuat untuk peminjaman dengan status "${loan.status}"`
                });
            }


            // ==================================================
            // CEK PEMBAYARAN LAMA
            // ==================================================

            pembayaranModel.checkExistingPembayaran(
                idPeminjaman,
                async (
                    checkErr,
                    existing
                ) => {

                    if (checkErr) {

                        console.error(
                            "Error cek pembayaran:",
                            checkErr
                        );

                        if (req.file) {
                            await deleteSupabaseFile(
                                req.file.filename
                            );
                        }

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal mengecek pembayaran",
                            error:
                                checkErr.message
                        });
                    }


                    if (
                        existing &&
                        existing.length > 0
                    ) {

                        if (req.file) {
                            await deleteSupabaseFile(
                                req.file.filename
                            );
                        }

                        return res.status(409).json({
                            success: false,
                            message:
                                "Peminjaman ini sudah memiliki data pembayaran"
                        });
                    }


                    // ==================================================
                    // VALIDASI METODE PEMBAYARAN
                    // ==================================================

                    const metode =
                        data.metode;


                    if (
                        !allowedMetodePembayaran.includes(
                            metode
                        )
                    ) {

                        if (req.file) {
                            await deleteSupabaseFile(
                                req.file.filename
                            );
                        }

                        return res.status(400).json({
                            success: false,
                            message:
                                "Metode pembayaran tidak valid"
                        });
                    }


                    // ==================================================
                    // VALIDASI TOTAL PEMINJAMAN
                    // ==================================================

                    const totalPeminjaman =
                        roundMoney(
                            loan.total_harga
                        );


                    if (
                        !isValidPositiveNumber(
                            totalPeminjaman
                        )
                    ) {

                        if (req.file) {
                            await deleteSupabaseFile(
                                req.file.filename
                            );
                        }

                        return res.status(400).json({
                            success: false,
                            message:
                                "Total harga peminjaman tidak valid"
                        });
                    }


                    // ==================================================
                    // VALIDASI NOMINAL
                    // ==================================================

                    const jumlahBayar =
                        roundMoney(
                            data.total
                        );


                    const validasiNominal =
                        validateNominalPembayaran(
                            totalPeminjaman,
                            jumlahBayar
                        );


                    if (
                        !validasiNominal.valid
                    ) {

                        if (req.file) {
                            await deleteSupabaseFile(
                                req.file.filename
                            );
                        }

                        return res.status(400).json({
                            success: false,
                            message:
                                validasiNominal.message
                        });
                    }


                    // ==================================================
                    // BUKTI PEMBAYARAN
                    // ==================================================

                    const buktiBayar =
                        req.file
                            ? req.file.publicUrl
                            : null;


                    if (
                        (
                            metode === "QRIS" ||
                            metode === "Transfer Bank"
                        ) &&
                        !buktiBayar
                    ) {

                        return res.status(400).json({
                            success: false,
                            message:
                                "Bukti pembayaran wajib diunggah"
                        });
                    }


                    // ==================================================
                    // STATUS SELALU BELUM BAYAR
                    // ==================================================

                    const statusPembayaran =
                        "Belum Bayar";


                    // ==================================================
                    // DATA PEMBAYARAN
                    // ==================================================

                    const paymentData = {

                        id_peminjaman:
                            idPeminjaman,

                        tanggal_bayar:
                            data.tanggal_bayar ||
                            new Date(),

                        total:
                            validasiNominal.jumlahBayar,

                        metode:
                            metode,

                        status:
                            statusPembayaran,

                        bukti_bayar:
                            buktiBayar
                    };


                    console.log(
                        "DATA PEMBAYARAN YANG AKAN DISIMPAN:",
                        paymentData
                    );


                    // ==================================================
                    // SIMPAN PEMBAYARAN
                    // ==================================================

                    pembayaranModel.createPembayaran(
                        paymentData,
                        async (
                            err,
                            result
                        ) => {

                            if (err) {

                                console.error(
                                    "Error create pembayaran:",
                                    err
                                );

                                if (req.file) {
                                    await deleteSupabaseFile(
                                        req.file.filename
                                    );
                                }

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Gagal menambahkan pembayaran",
                                    error:
                                        err.message
                                });
                            }


                            const idPembayaran =
                                result.insertId;


                            const tipePembayaran =
                                validasiNominal.isDP
                                    ? "DP 50%"
                                    : "Pembayaran penuh";


                            // ==================================================
                            // NOTIFIKASI ADMIN
                            // ==================================================

                            const pesanAdmin =
                                `Pembayaran baru untuk peminjaman #${idPeminjaman}. ` +
                                `${tipePembayaran} sebesar Rp${validasiNominal.jumlahBayar.toLocaleString(
                                    "id-ID"
                                )}. ` +
                                `Menunggu verifikasi petugas.`;


                            notificationModel.createNotificationForAdmins(
                                pesanAdmin,
                                (
                                    notificationError
                                ) => {

                                    if (
                                        notificationError
                                    ) {

                                        console.error(
                                            "Gagal membuat notifikasi admin pembayaran:",
                                            notificationError
                                        );
                                    }


                                    // ==================================================
                                    // NOTIFIKASI USER
                                    // ==================================================

                                    const pesanUser =
                                        `Pembayaran untuk peminjaman #${idPeminjaman} sebesar Rp${validasiNominal.jumlahBayar.toLocaleString(
                                            "id-ID"
                                        )} berhasil dikirim dan sedang menunggu verifikasi petugas.`;


                                    notificationModel.createNotificationForUser(
                                        loan.id_user,
                                        pesanUser,
                                        (
                                            userNotificationError
                                        ) => {

                                            if (
                                                userNotificationError
                                            ) {

                                                console.error(
                                                    "Gagal membuat notifikasi pembayaran ke user:",
                                                    userNotificationError
                                                );
                                            }


                                            return res.status(201).json({
                                                success: true,

                                                message:
                                                    "Pembayaran berhasil dikirim dan menunggu verifikasi petugas",

                                                id_pembayaran:
                                                    idPembayaran,

                                                id_peminjaman:
                                                    idPeminjaman,

                                                jenis_pembayaran:
                                                    validasiNominal.isDP
                                                        ? "DP 50%"
                                                        : "Lunas 100%",

                                                total:
                                                    validasiNominal.jumlahBayar,

                                                status:
                                                    statusPembayaran,

                                                bukti_bayar:
                                                    buktiBayar
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};


// ======================================================
// UPDATE PEMBAYARAN
// ======================================================

const updatePembayaran = (
    req,
    res
) => {

    const id =
        req.params.id;


    if (
        !isValidId(id)
    ) {

        if (req.file) {
            deleteSupabaseFile(
                req.file.filename
            );
        }

        return res.status(400).json({
            success: false,
            message:
                "ID pembayaran tidak valid"
        });
    }


    pembayaranModel.getPembayaranById(
        id,
        (
            getErr,
            result
        ) => {

            if (getErr) {

                if (req.file) {
                    deleteSupabaseFile(
                        req.file.filename
                    );
                }

                console.error(
                    "Error get pembayaran untuk update:",
                    getErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil pembayaran",
                    error:
                        getErr.message
                });
            }


            if (
                !result ||
                result.length === 0
            ) {

                if (req.file) {
                    deleteSupabaseFile(
                        req.file.filename
                    );
                }

                return res.status(404).json({
                    success: false,
                    message:
                        "Pembayaran tidak ditemukan"
                });
            }


            const payment =
                result[0];


            // ==================================================
            // PEMBAYARAN LUNAS TIDAK BOLEH DIUBAH
            // ==================================================

            if (
                payment.status ===
                "Lunas"
            ) {

                if (req.file) {
                    deleteSupabaseFile(
                        req.file.filename
                    );
                }

                return res.status(400).json({
                    success: false,
                    message:
                        "Pembayaran yang sudah Lunas tidak dapat diubah"
                });
            }


            const data =
                req.body || {};


            // ==================================================
            // AMBIL DATA PEMINJAMAN
            // ==================================================

            peminjamanModel.getPeminjamanById(
                payment.id_peminjaman,
                (
                    loanErr,
                    loanResult
                ) => {

                    if (loanErr) {

                        if (req.file) {
                            deleteSupabaseFile(
                                req.file.filename
                            );
                        }

                        console.error(
                            "Error mengambil peminjaman saat update pembayaran:",
                            loanErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal mengambil data peminjaman",
                            error:
                                loanErr.message
                        });
                    }


                    if (
                        !loanResult ||
                        loanResult.length === 0
                    ) {

                        if (req.file) {
                            deleteSupabaseFile(
                                req.file.filename
                            );
                        }

                        return res.status(404).json({
                            success: false,
                            message:
                                "Peminjaman tidak ditemukan"
                        });
                    }


                    const loan =
                        loanResult[0];


                    // ==================================================
                    // VALIDASI STATUS PEMINJAMAN
                    // ==================================================

                    if (
                        !allowedLoanStatusUntukPembayaran.includes(
                            loan.status
                        )
                    ) {

                        if (req.file) {
                            deleteSupabaseFile(
                                req.file.filename
                            );
                        }

                        return res.status(400).json({
                            success: false,
                            message:
                                `Pembayaran tidak dapat diperbarui untuk peminjaman dengan status "${loan.status}"`
                        });
                    }


                    // ==================================================
                    // VALIDASI METODE
                    // ==================================================

                    const metode =
                        data.metode ||
                        payment.metode;


                    if (
                        !allowedMetodePembayaran.includes(
                            metode
                        )
                    ) {

                        if (req.file) {
                            deleteSupabaseFile(
                                req.file.filename
                            );
                        }

                        return res.status(400).json({
                            success: false,
                            message:
                                "Metode pembayaran tidak valid"
                        });
                    }


                    // ==================================================
                    // VALIDASI TOTAL PEMINJAMAN
                    // ==================================================

                    const totalPeminjaman =
                        roundMoney(
                            loan.total_harga
                        );


                    // ==================================================
                    // VALIDASI NOMINAL
                    // ==================================================

                    const jumlahBayar =
                        data.total !== undefined
                            ? roundMoney(
                                data.total
                            )
                            : roundMoney(
                                payment.total
                            );


                    const validasiNominal =
                        validateNominalPembayaran(
                            totalPeminjaman,
                            jumlahBayar
                        );


                    if (
                        !validasiNominal.valid
                    ) {

                        if (req.file) {
                            deleteSupabaseFile(
                                req.file.filename
                            );
                        }

                        return res.status(400).json({
                            success: false,
                            message:
                                validasiNominal.message
                        });
                    }


                    // ==================================================
                    // BUKTI PEMBAYARAN
                    // ==================================================

                    const buktiBayar =
                        req.file
                            ? req.file.publicUrl
                            : payment.bukti_bayar ||
                              null;


                    if (
                        (
                            metode === "QRIS" ||
                            metode === "Transfer Bank"
                        ) &&
                        !buktiBayar
                    ) {

                        if (req.file) {
                            deleteSupabaseFile(
                                req.file.filename
                            );
                        }

                        return res.status(400).json({
                            success: false,
                            message:
                                "Bukti pembayaran wajib diunggah untuk QRIS atau Transfer Bank"
                        });
                    }


                    // ==================================================
                    // STATUS TETAP BELUM BAYAR
                    // ==================================================

                    const updateData = {

                        id_peminjaman:
                            payment.id_peminjaman,

                        tanggal_bayar:
                            data.tanggal_bayar ||
                            payment.tanggal_bayar,

                        total:
                            validasiNominal.jumlahBayar,

                        metode:
                            metode,

                        status:
                            "Belum Bayar",

                        bukti_bayar:
                            buktiBayar
                    };


                    console.log(
                        "DATA UPDATE PEMBAYARAN:",
                        updateData
                    );


                    // ==================================================
                    // SIMPAN UPDATE
                    // ==================================================

                    pembayaranModel.updatePembayaran(
                        id,
                        updateData,
                        async (
                            err,
                            updateResult
                        ) => {

                            if (err) {

                                console.error(
                                    "Error update pembayaran:",
                                    err
                                );

                                if (req.file) {
                                    await deleteSupabaseFile(
                                        req.file.filename
                                    );
                                }

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Gagal memperbarui pembayaran",
                                    error:
                                        err.message
                                });
                            }


                            if (
                                !updateResult ||
                                updateResult.affectedRows ===
                                0
                            ) {

                                if (req.file) {
                                    await deleteSupabaseFile(
                                        req.file.filename
                                    );
                                }

                                return res.status(404).json({
                                    success: false,
                                    message:
                                        "Pembayaran tidak ditemukan"
                                });
                            }


                            // Jika ada file baru,
                            // hapus file lama dari Supabase.
                            if (
                                req.file &&
                                payment.bukti_bayar
                            ) {

                                await deleteSupabaseFile(
                                    payment.bukti_bayar
                                );
                            }


                            const tipePembayaran =
                                validasiNominal.isDP
                                    ? "DP 50%"
                                    : "Pembayaran penuh";


                            // ==================================================
                            // NOTIFIKASI ADMIN
                            // ==================================================

                            const pesanAdmin =
                                `Pembayaran untuk peminjaman #${payment.id_peminjaman} telah diperbarui. ` +
                                `${tipePembayaran} sebesar Rp${validasiNominal.jumlahBayar.toLocaleString(
                                    "id-ID"
                                )} menunggu verifikasi.`;


                            notificationModel.createNotificationForAdmins(
                                pesanAdmin,
                                (
                                    notificationError
                                ) => {

                                    if (
                                        notificationError
                                    ) {

                                        console.error(
                                            "Gagal membuat notifikasi update pembayaran:",
                                            notificationError
                                        );
                                    }


                                    return res.status(200).json({
                                        success: true,
                                        message:
                                            "Pembayaran berhasil diperbarui dan menunggu verifikasi petugas"
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};


// ======================================================
// UPDATE STATUS PEMBAYARAN
// HANYA DIGUNAKAN PETUGAS / ADMIN
// ======================================================

const updateStatusPembayaran = (
    req,
    res
) => {

    const id =
        req.params.id;


    const {
        status
    } =
        req.body || {};


    if (
        !isValidId(id)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID pembayaran tidak valid"
        });
    }


    // ==================================================
    // HANYA BOLEH LUNAS
    // ==================================================

    if (
        status !==
        "Lunas"
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Status pembayaran hanya dapat diubah menjadi Lunas melalui proses verifikasi"
        });
    }


    // ==================================================
    // AMBIL DATA PEMBAYARAN
    // ==================================================

    pembayaranModel.getPembayaranById(
        id,
        (
            paymentErr,
            paymentResult
        ) => {

            if (paymentErr) {

                console.error(
                    "Error get pembayaran untuk verifikasi:",
                    paymentErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil pembayaran",
                    error:
                        paymentErr.message
                });
            }


            if (
                !paymentResult ||
                paymentResult.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Pembayaran tidak ditemukan"
                });
            }


            const payment =
                paymentResult[0];


            // ==================================================
            // JIKA SUDAH LUNAS
            // ==================================================

            if (
                payment.status ===
                "Lunas"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Pembayaran ini sudah diverifikasi sebagai Lunas"
                });
            }


            // ==================================================
            // STATUS ASAL HARUS BELUM BAYAR
            // ==================================================

            if (
                payment.status !==
                "Belum Bayar"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Pembayaran dengan status "${payment.status}" tidak dapat diverifikasi`
                });
            }


            // ==================================================
            // BUKTI HARUS ADA UNTUK QRIS / TRANSFER
            // ==================================================

            if (
                (
                    payment.metode === "QRIS" ||
                    payment.metode === "Transfer Bank"
                ) &&
                !payment.bukti_bayar
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Pembayaran QRIS atau Transfer Bank tidak dapat diverifikasi karena bukti pembayaran tidak tersedia"
                });
            }


            // ==================================================
            // AMBIL DATA PEMINJAMAN
            // ==================================================

            peminjamanModel.getPeminjamanById(
                payment.id_peminjaman,
                (
                    loanErr,
                    loanResult
                ) => {

                    if (loanErr) {

                        console.error(
                            "Error get peminjaman untuk verifikasi pembayaran:",
                            loanErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal mengambil data peminjaman",
                            error:
                                loanErr.message
                        });
                    }


                    if (
                        !loanResult ||
                        loanResult.length === 0
                    ) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "Peminjaman tidak ditemukan"
                        });
                    }


                    const loan =
                        loanResult[0];


                    // ==================================================
                    // VALIDASI STATUS PEMINJAMAN
                    // ==================================================

                    if (
                        !allowedLoanStatusUntukPembayaran.includes(
                            loan.status
                        )
                    ) {

                        return res.status(400).json({
                            success: false,
                            message:
                                `Pembayaran tidak dapat diverifikasi karena status peminjaman adalah "${loan.status}"`
                        });
                    }


                    // ==================================================
                    // VALIDASI TOTAL PEMINJAMAN
                    // ==================================================

                    const totalPeminjaman =
                        roundMoney(
                            loan.total_harga
                        );


                    const jumlahBayar =
                        roundMoney(
                            payment.total
                        );


                    const validasiNominal =
                        validateNominalPembayaran(
                            totalPeminjaman,
                            jumlahBayar
                        );


                    if (
                        !validasiNominal.valid
                    ) {

                        return res.status(400).json({
                            success: false,
                            message:
                                validasiNominal.message
                        });
                    }


                    // ==================================================
                    // UPDATE STATUS MENJADI LUNAS
                    // ==================================================

                    pembayaranModel.updateStatusPembayaran(
                        id,
                        "Lunas",
                        (
                            err,
                            result
                        ) => {

                            if (err) {

                                console.error(
                                    "Error update status pembayaran:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Gagal mengubah status pembayaran",
                                    error:
                                        err.message
                                });
                            }


                            if (
                                !result ||
                                result.affectedRows ===
                                0
                            ) {

                                return res.status(404).json({
                                    success: false,
                                    message:
                                        "Pembayaran tidak ditemukan"
                                });
                            }


                            // ==================================================
                            // JENIS PEMBAYARAN
                            // ==================================================

                            const tipePembayaran =
                                validasiNominal.isDP
                                    ? "DP 50%"
                                    : "Pembayaran penuh";


                            // ==================================================
                            // NOTIFIKASI USER
                            // ==================================================

                            const pesanUser =
                                `Pembayaran ${tipePembayaran} untuk peminjaman #${payment.id_peminjaman} sebesar Rp${jumlahBayar.toLocaleString(
                                    "id-ID"
                                )} telah diverifikasi dan dinyatakan Lunas.`;


                            notificationModel.createNotificationForUser(
                                loan.id_user,
                                pesanUser,
                                (
                                    notificationError
                                ) => {

                                    if (
                                        notificationError
                                    ) {

                                        console.error(
                                            "Gagal membuat notifikasi status pembayaran:",
                                            notificationError
                                        );
                                    }


                                    return res.status(200).json({
                                        success: true,

                                        message:
                                            "Pembayaran berhasil diverifikasi sebagai Lunas",

                                        id_pembayaran:
                                            id,

                                        id_peminjaman:
                                            payment.id_peminjaman,

                                        jenis_pembayaran:
                                            validasiNominal.isDP
                                                ? "DP 50%"
                                                : "Lunas 100%",

                                        total:
                                            jumlahBayar,

                                        status:
                                            "Lunas"
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};


// ======================================================
// DELETE PEMBAYARAN
// ======================================================

const deletePembayaran = (
    req,
    res
) => {

    const id =
        req.params.id;


    if (
        !isValidId(id)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "ID pembayaran tidak valid"
        });
    }


    // ==================================================
    // CEK PEMBAYARAN TERLEBIH DAHULU
    // ==================================================

    pembayaranModel.getPembayaranById(
        id,
        (
            getErr,
            result
        ) => {

            if (getErr) {

                console.error(
                    "Error get pembayaran sebelum delete:",
                    getErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Gagal mengambil pembayaran",
                    error:
                        getErr.message
                });
            }


            if (
                !result ||
                result.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Pembayaran tidak ditemukan"
                });
            }


            const payment =
                result[0];


            // ==================================================
            // PEMBAYARAN LUNAS TIDAK BOLEH DIHAPUS
            // ==================================================

            if (
                payment.status ===
                "Lunas"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Pembayaran yang sudah Lunas tidak dapat dihapus"
                });
            }


            // ==================================================
            // DELETE DATABASE
            // ==================================================

            pembayaranModel.deletePembayaran(
                id,
                async (
                    err,
                    deleteResult
                ) => {

                    if (err) {

                        console.error(
                            "Error delete pembayaran:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Gagal menghapus pembayaran",
                            error:
                                err.message
                        });
                    }


                    if (
                        !deleteResult ||
                        deleteResult.affectedRows ===
                        0
                    ) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "Pembayaran tidak ditemukan"
                        });
                    }


                    // ==================================================
                    // HAPUS FILE SUPABASE
                    // ==================================================

                    if (
                        payment.bukti_bayar
                    ) {

                        await deleteSupabaseFile(
                            payment.bukti_bayar
                        );
                    }


                    return res.status(200).json({
                        success: true,
                        message:
                            "Pembayaran berhasil dihapus"
                    });
                }
            );
        }
    );
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getPembayaran,

    getPembayaranById,

    getPembayaranByPeminjaman,

    createPembayaran,

    updatePembayaran,

    updateStatusPembayaran,

    deletePembayaran
};