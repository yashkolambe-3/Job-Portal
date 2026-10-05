const pool = require("../config/db");
const emailService = require("../services/emailService");


// ===============================
// APPLY FOR JOB
// ===============================
const applyForJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const jobId = req.params.id;

        // CHECK JOB
        const [jobs] = await pool.query(
            `
            SELECT j.id, j.status, j.moderation_status, j.application_deadline,
                   j.title, c.company_name, c.verification_status,
                   recruiter.name AS recruiter_name,
                   recruiter.email AS recruiter_email,
                   (j.application_deadline IS NOT NULL AND j.application_deadline < CURDATE()) AS deadline_passed
            FROM jobs j
            JOIN companies c ON c.id = j.company_id
            JOIN users recruiter ON recruiter.id = j.recruiter_id
            WHERE j.id = ?
            `,
            [jobId]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        const job = jobs[0];

        if (job.status !== "ACTIVE" || job.moderation_status !== "APPROVED" || job.verification_status !== "VERIFIED") {
            return res.status(400).json({
                message: "This job is not currently accepting applications"
            });
        }

        if (job.deadline_passed) {
            return res.status(400).json({
                message: "Application deadline has passed"
            });
        }

        // CHECK EXISTING APPLICATION
        const [existing] = await pool.query(
            `
            SELECT id
            FROM applications
            WHERE user_id = ?
            AND job_id = ?
            `,
            [userId, jobId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "You have already applied for this job"
            });
        }

        // Load the candidate recipient before writing the application so a
        // profile lookup failure cannot turn a successful insert into a 500.
        const [candidateRows] = await pool.query(
            "SELECT name, email FROM users WHERE id = ? LIMIT 1",
            [userId]
        );

        // CREATE APPLICATION
        const [result] = await pool.query(
            `
            INSERT INTO applications
            (
                user_id,
                job_id,
                status
            )
            VALUES (?, ?, 'APPLIED')
            `,
            [userId, jobId]
        );

        if (candidateRows[0]) {
            void emailService.sendApplicationConfirmation({
                ...candidateRows[0],
                jobTitle: job.title,
                companyName: job.company_name
            });

            void emailService.sendRecruiterNewApplication({
                name: job.recruiter_name,
                email: job.recruiter_email,
                candidateName: candidateRows[0].name,
                jobTitle: job.title,
                companyName: job.company_name
            });
        }

        res.status(201).json({
            message: "Job application submitted successfully",
            applicationId: result.insertId
        });

    } catch (error) {
        console.error("Apply job error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "You have already applied for this job"
            });
        }

        res.status(500).json({
            message: "Failed to apply for job"
        });
    }
};


// ===============================
// GET MY APPLICATIONS - CANDIDATE
// ===============================
const getMyApplications = async (req, res) => {
    try {
        const userId = req.user.id;

        const [applications] = await pool.query(
            `
            SELECT
                a.id,
                a.status,
                a.applied_at,

                j.id AS job_id,
                j.title,
                j.location,
                j.job_type,
                j.salary_min,
                j.salary_max,

                c.company_name

            FROM applications a

            JOIN jobs j
                ON a.job_id = j.id

            JOIN companies c
                ON j.company_id = c.id

            WHERE a.user_id = ?

            ORDER BY a.applied_at DESC
            `,
            [userId]
        );

        res.status(200).json(applications);

    } catch (error) {
        console.error("Get applications error:", error);

        res.status(500).json({
            message: "Failed to get applications"
        });
    }
};


// =====================================================
// PHASE 5
// GET APPLICANTS FOR RECRUITER'S JOB
// =====================================================
const getJobApplicants = async (req, res) => {
    try {
        const recruiterId = req.user.id;
        const jobId = req.params.id;

        // Make sure this job belongs to logged-in recruiter
        const [jobs] = await pool.query(
            `
            SELECT
                j.id,
                j.title,
                j.recruiter_id,
                c.company_name
            FROM jobs j
            JOIN companies c
                ON j.company_id = c.id
            WHERE j.id = ?
            AND j.recruiter_id = ?
            `,
            [jobId, recruiterId]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                message: "Job not found or access denied"
            });
        }

        const [applicants] = await pool.query(
            `
            SELECT
                a.id AS application_id,
                a.status,
                a.applied_at,

                u.id AS candidate_id,
                u.name AS candidate_name,
                u.email AS candidate_email,

                cp.phone,
                cp.location,
                cp.headline
                

            FROM applications a

            JOIN users u
                ON a.user_id = u.id

            LEFT JOIN candidate_profiles cp
                ON a.user_id = cp.user_id

            WHERE a.job_id = ?

            ORDER BY a.applied_at DESC
            `,
            [jobId]
        );

        res.status(200).json({
            job: jobs[0],
            applicants
        });

    } catch (error) {
        console.error("Get job applicants error:", error);

        res.status(500).json({
            message: "Failed to get job applicants"
        });
    }
};


// =====================================================
// PHASE 5
// UPDATE APPLICATION STATUS
// =====================================================
const updateApplicationStatus = async (req, res) => {
    try {
        const recruiterId = req.user.id;
        const applicationId = req.params.id;
        const { status } = req.body;

        // Only these statuses are allowed
        const allowedStatuses = [
            "APPLIED",
            "SHORTLISTED",
            "REJECTED"
        ];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid application status"
            });
        }

        // Make sure application belongs to a job
        // owned by this recruiter
        const [applications] = await pool.query(
            `
            SELECT
                a.id,
                a.status,
                j.recruiter_id,
                j.title,
                u.name AS candidate_name,
                u.email AS candidate_email
            FROM applications a
            JOIN jobs j
                ON a.job_id = j.id
            JOIN users u
                ON a.user_id = u.id
            WHERE a.id = ?
            AND j.recruiter_id = ?
            `,
            [applicationId, recruiterId]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                message: "Application not found or access denied"
            });
        }

        await pool.query(
            `
            UPDATE applications
            SET status = ?
            WHERE id = ?
            `,
            [status, applicationId]
        );

        if (applications[0].status !== status) {
            void emailService.sendApplicationStatus({
                name: applications[0].candidate_name,
                email: applications[0].candidate_email,
                jobTitle: applications[0].title,
                status
            });
        }

        res.status(200).json({
            message: "Application status updated successfully",
            status
        });

    } catch (error) {
        console.error("Update application status error:", error);

        res.status(500).json({
            message: "Failed to update application status"
        });
    }
};


module.exports = {
    applyForJob,
    getMyApplications,
    getJobApplicants,
    updateApplicationStatus
};
