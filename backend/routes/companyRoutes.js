const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
    createOrUpdateCompany,
    getCompany,
    deleteCompany
} = require("../controllers/companyController");


// Create / Update company
router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    createOrUpdateCompany
);


// Get company
router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    getCompany
);


// Delete company
router.delete(
    "/profile",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    deleteCompany
);


module.exports = router;