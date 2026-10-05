const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const resumeController = require("../controllers/resumeController");
const upload = require("../middleware/resumeUploadMiddleware");

router.get(
    "/",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    resumeController.getUploadedResumes
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    upload.single("resume"),
    resumeController.uploadResume
);

router.get(
    "/:id/download",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    resumeController.downloadResume
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    resumeController.deleteResume
);

router.get(
    "/builder",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    resumeController.getBuilderResume
);

router.post(
    "/builder",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    resumeController.saveBuilderResume
);

module.exports = router;
