// routers/usersRouter.js

const express = require("express");

const router = express.Router();

const usersController =
    require("../controllers/usersController");

// ========================================
// GET SEMUA USER
// ========================================

router.get(
    "/",
    usersController.getUsers
);

// ========================================
// GET SEMUA ADMIN
// ========================================

router.get(
    "/admins",
    usersController.getAdmins
);

// ========================================
// GET TOTAL USERS
// ========================================

router.get(
    "/total",
    usersController.getTotalUsers
);

// ========================================
// SEARCH USERS
// ========================================

router.get(
    "/search",
    usersController.searchUsers
);

// ========================================
// GET USERS BY ROLE
// ========================================

router.get(
    "/role/:roleId",
    usersController.getUsersByRole
);

// ========================================
// LOGIN
// ========================================

router.post(
    "/login",
    usersController.loginUser
);

// ========================================
// CHANGE PASSWORD
// ========================================

router.put(
    "/change-password",
    usersController.changePassword
);

// ========================================
// CREATE USER
// ========================================

router.post(
    "/",
    usersController.createUser
);

// ========================================
// GET USER DETAIL
// ========================================

router.get(
    "/:id/detail",
    usersController.getCustomerDetail
);

// ========================================
// GET USER BY ID
// ========================================

router.get(
    "/:id",
    usersController.getUserById
);

// ========================================
// UPDATE USER
// ========================================

router.put(
    "/:id",
    usersController.updateUser
);

// ========================================
// DELETE USER
// ========================================

router.delete(
    "/:id",
    usersController.deleteUser
);

// ========================================
// EXPORT
// ========================================

module.exports = router;