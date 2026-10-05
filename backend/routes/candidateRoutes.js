const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getProfile,
    createOrUpdateProfile,
    getDashboard
} = require("../controllers/candidateController");

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    getProfile
);

router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    createOrUpdateProfile
);

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    getDashboard
);

module.exports = router;