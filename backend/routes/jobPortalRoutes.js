const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    getJobs,
    getJobDetails
} = require("../controllers/jobPortalController");


// GET JOB LISTINGS
router.get(
    "/",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    getJobs
);


// GET JOB DETAILS
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    getJobDetails
);


module.exports = router;