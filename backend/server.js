const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const pool = require("./config/db");

// ===============================
// ROUTES
// ===============================

const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const adminRoutes = require("./routes/adminRoutes");
// Phase 3 - Recruiter routes
const companyRoutes = require("./routes/companyRoutes");
const jobRoutes = require("./routes/jobRoutes");
const aiRoutes = require("./routes/aiRoutes");
// Phase 4 - Candidate Job Portal
const jobPortalRoutes = require("./routes/jobPortalRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobRoutes = require("./routes/savedJobRoutes");

// ===============================
// MIDDLEWARE
// ===============================

const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

const app = express();


// ===============================
// GLOBAL MIDDLEWARE
// ===============================

const hasConfiguredOrigins = Boolean(process.env.CORS_ORIGIN?.trim());
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        const isLocalDevelopmentOrigin = !hasConfiguredOrigins
            && process.env.NODE_ENV !== "production"
            && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");

        if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
            return callback(null, true);
        }

        return callback(null, false);
    }
}));
app.use(express.json({ limit: "1mb" }));


// ===============================
// EXISTING ROUTES
// ===============================

// Authentication
app.use("/api/v1/auth", authRoutes);

// Candidate
app.use("/api/v1/candidate", candidateRoutes);
app.use("/api/v1/admin", adminRoutes);
// Resumes
app.use("/api/v1/resumes", resumeRoutes);
app.use("/api/v1/ai", aiRoutes);

// ===============================
// PHASE 3 - RECRUITER ROUTES
// ===============================

// Recruiter Company
app.use(
    "/api/v1/recruiter/company",
    companyRoutes
);

// Recruiter Job Management
app.use(
    "/api/v1/recruiter/jobs",
    jobRoutes
);


// ===============================
// PHASE 4 - CANDIDATE JOB PORTAL
// ===============================

// Job Listing
// Search
// Filters
// Pagination
// Job Details

app.use(
    "/api/v1/jobs",
    jobPortalRoutes
);

// Applications
// Apply for Job
// My Applications
app.use(
    "/api/v1/applications",
    applicationRoutes
);

// Saved Jobs
// Save Job
// Remove Saved Job
// My Saved Jobs
app.use(
    "/api/v1/saved-jobs",
    savedJobRoutes
);


// ===============================
// AUTH CHECK
// ===============================

app.get(
    "/api/v1/auth/me",
    authMiddleware,
    (req, res) => {

        res.json({
            message: "Authentication successful",
            user: req.user
        });

    }
);


// ===============================
// ROOT
// ===============================

app.get(
    "/",
    (req, res) => {

        res.json({
            message: "CareerConnect AI Backend is running!"
        });

    }
);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});


// ===============================
// DATABASE TEST
// ===============================

app.get(
    "/api/v1/test-db",
    async (req, res) => {

        try {

            const [rows] = await pool.query(
                "SELECT 1 AS result"
            );

            res.json({
                message: "MySQL connection successful!",
                result: rows[0].result
            });

        } catch (error) {

            console.error(
                "Database connection error:",
                error
            );

            res.status(500).json({
                message: "MySQL connection failed"
            });

        }

    }
);


// ===============================
// CANDIDATE TEST ROUTE
// ===============================

app.get(
    "/api/v1/candidate/test",
    authMiddleware,
    roleMiddleware("CANDIDATE"),
    (req, res) => {

        res.json({
            message: "Candidate route accessed successfully",
            user: req.user
        });

    }
);


// ===============================
// RECRUITER TEST ROUTE
// ===============================

app.get(
    "/api/v1/recruiter/test",
    authMiddleware,
    roleMiddleware("RECRUITER"),
    (req, res) => {

        res.json({
            message: "Recruiter route accessed successfully",
            user: req.user
        });

    }
);


// ===============================
// ADMIN TEST ROUTE
// ===============================

app.get(
    "/api/v1/admin/test",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => {

        res.json({
            message: "Admin route accessed successfully",
            user: req.user
        });

    }
);


app.use((req, res) => {
    res.status(404).json({ message: "API route not found" });
});

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Resume file must be 5 MB or smaller" });
    }
    if (error.code === "INVALID_FILE_TYPE") {
        return res.status(400).json({ message: "Only PDF, DOC and DOCX files are allowed" });
    }
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Request body must contain valid JSON" });
    }
    console.error("Request failed:", error.code || error.name || "Server error");
    return res.status(500).json({ message: "An unexpected server error occurred" });
});

if (require.main === module) {
    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, () => {
        console.log(`CareerConnect AI API listening on port ${PORT}`);
    });
}

module.exports = app;
