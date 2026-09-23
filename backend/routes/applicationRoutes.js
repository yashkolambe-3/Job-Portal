const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    applyForJob,
    getMyApplications,
    getJobApplicants,
    updateApplicationStatus
} = require("../controllers/applicationController");


// =====================================================
// PHASE 4 - CANDIDATE
// =====================================================

// APPLY FOR JOB
router.post(
    "/:id/apply",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    applyForJob
);


// GET MY APPLICATIONS
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    getMyApplications
);


// =====================================================
// PHASE 5 - RECRUITER
// =====================================================

// GET APPLICANTS FOR A JOB
router.get(
    "/job/:id",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    getJobApplicants
);


// UPDATE APPLICATION STATUS
router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    updateApplicationStatus
);


module.exports = router;