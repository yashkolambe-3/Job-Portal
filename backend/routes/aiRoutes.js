const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    resumeScore,
    skillSuggestions,
    jobRecommendations
} = require("../controllers/aiController");


// Resume Score
router.post(
    "/resume-score",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    resumeScore
);


// Skill Suggestions
router.post(
    "/skill-suggestions",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    skillSuggestions
);


// Job Recommendations
router.get(
    "/job-recommendations",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    jobRecommendations
);


module.exports = router;
