const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createJob,
    getMyJobs,
    getJobById,
    updateJob,
    deleteJob
} = require("../controllers/jobController");


// Create job
router.post(
    "/",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    createJob
);


// Get recruiter's jobs
router.get(
    "/",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    getMyJobs
);


// Get single job
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    getJobById
);


// Update job
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    updateJob
);


// Delete job
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    deleteJob
);


module.exports = router;