const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    saveJob,
    removeSavedJob,
    getMySavedJobs
} = require("../controllers/savedJobController");


// ===============================
// GET MY SAVED JOBS
// ===============================

router.get(
    "/",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    getMySavedJobs
);


// ===============================
// SAVE JOB
// ===============================

router.post(
    "/:id",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    saveJob
);


// ===============================
// REMOVE SAVED JOB
// ===============================

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    removeSavedJob
);


// ===============================
// EXPORT ROUTER
// ===============================

module.exports = router;