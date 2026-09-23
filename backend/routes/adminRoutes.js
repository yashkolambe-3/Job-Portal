const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getDashboard,
    getUsers,
    deleteUser,
    getRecruiters,
    updateRecruiterVerification,
    getJobsForModeration,
    updateJobModeration
} = require("../controllers/adminController");


// =====================================================
// ADMIN DASHBOARD
// GET /api/v1/admin/dashboard
// =====================================================

router.get(
    "/dashboard",
    authMiddleware,
    adminMiddleware,
    getDashboard
);


// =====================================================
// USER MANAGEMENT
// =====================================================

router.get(
    "/users",
    authMiddleware,
    adminMiddleware,
    getUsers
);

router.delete(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    deleteUser
);


// =====================================================
// RECRUITER VERIFICATION
// =====================================================

router.get(
    "/recruiters",
    authMiddleware,
    adminMiddleware,
    getRecruiters
);

router.put(
    "/recruiters/:companyId/verification",
    authMiddleware,
    adminMiddleware,
    updateRecruiterVerification
);


// =====================================================
// JOB MODERATION
// =====================================================

router.get(
    "/jobs",
    authMiddleware,
    adminMiddleware,
    getJobsForModeration
);

router.put(
    "/jobs/:jobId/moderation",
    authMiddleware,
    adminMiddleware,
    updateJobModeration
);


module.exports = router;