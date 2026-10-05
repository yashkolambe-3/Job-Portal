const pool = require("../config/db");
const emailService = require("../services/emailService");

// =====================================================
// ADMIN DASHBOARD
// =====================================================

const getDashboard = async (req, res) => {
    try {
        const [[users]] = await pool.execute(
            "SELECT COUNT(*) AS totalUsers FROM users"
        );

        const [[recruiters]] = await pool.execute(
            `SELECT COUNT(*) AS totalRecruiters
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE r.name = 'RECRUITER'`
        );

        const [[jobs]] = await pool.execute(
            "SELECT COUNT(*) AS totalJobs FROM jobs"
        );

        const [[applications]] = await pool.execute(
            "SELECT COUNT(*) AS totalApplications FROM applications"
        );

        const [[pendingRecruiters]] = await pool.execute(
            `SELECT COUNT(*) AS pendingRecruiters
             FROM companies
             WHERE verification_status = 'PENDING'`
        );

        const [[pendingJobs]] = await pool.execute(
            `SELECT COUNT(*) AS pendingJobs
             FROM jobs
             WHERE moderation_status = 'PENDING'`
        );

        res.json({
            totalUsers: users.totalUsers,
            totalRecruiters: recruiters.totalRecruiters,
            totalJobs: jobs.totalJobs,
            totalApplications: applications.totalApplications,
            pendingRecruiters: pendingRecruiters.pendingRecruiters,
            pendingJobs: pendingJobs.pendingJobs
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);

        res.status(500).json({
            message: "Failed to load admin dashboard"
        });
    }
};


// =====================================================
// GET ALL USERS
// =====================================================

const getUsers = async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT 
                u.id,
                u.name,
                u.email,
                r.name AS role
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             ORDER BY u.id DESC`
        );

        res.json(users);

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};


// =====================================================
// DELETE USER
// =====================================================

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting himself
        if (Number(id) === Number(req.user.id)) {
            return res.status(400).json({
                message: "You cannot delete your own admin account"
            });
        }

        const [result] = await pool.execute(
            "DELETE FROM users WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete user error:", error);

        res.status(500).json({
            message: "Failed to delete user"
        });
    }
};


// =====================================================
// GET RECRUITERS
// =====================================================

const getRecruiters = async (req, res) => {
    try {
        const [recruiters] = await pool.execute(
            `SELECT
                c.id AS company_id,
                c.recruiter_id,
                c.verification_status,
                u.name,
                u.email,
                c.company_name
             FROM companies c
             JOIN users u
                ON c.recruiter_id = u.id
             ORDER BY c.id DESC`
        );

        res.json(recruiters);

    } catch (error) {
        console.error("Get recruiters error:", error);

        res.status(500).json({
            message: "Failed to fetch recruiters"
        });
    }
};


// =====================================================
// VERIFY / REJECT RECRUITER
// =====================================================

const updateRecruiterVerification = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "VERIFIED",
            "REJECTED",
            "PENDING"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid verification status"
            });
        }

        const [companies] = await pool.execute(
            `SELECT c.verification_status, c.company_name, u.name, u.email
             FROM companies c JOIN users u ON u.id = c.recruiter_id
             WHERE c.id = ? LIMIT 1`,
            [companyId]
        );
        if (companies.length === 0) {
            return res.status(404).json({ message: "Company not found" });
        }

        await pool.execute(
            `UPDATE companies
             SET verification_status = ?
             WHERE id = ?`,
            [status, companyId]
        );

        if (companies[0].verification_status !== status) {
            void emailService.sendRecruiterVerification({ ...companies[0], status });
        }

        res.json({
            message: `Recruiter ${status.toLowerCase()} successfully`
        });

    } catch (error) {
        console.error("Recruiter verification error:", error);

        res.status(500).json({
            message: "Failed to update recruiter verification"
        });
    }
};


// =====================================================
// GET JOBS FOR MODERATION
// =====================================================

const getJobsForModeration = async (req, res) => {
    try {
        const [jobs] = await pool.execute(
            `SELECT
                j.*,
                c.company_name,
                u.name AS recruiter_name,
                u.email AS recruiter_email
             FROM jobs j
             LEFT JOIN companies c
                ON j.company_id = c.id
             LEFT JOIN users u
                ON c.recruiter_id = u.id
             ORDER BY j.id DESC`
        );

        res.json(jobs);

    } catch (error) {
        console.error("Get moderation jobs error:", error);

        res.status(500).json({
            message: "Failed to fetch jobs"
        });
    }
};


// =====================================================
// APPROVE / REJECT JOB
// =====================================================

const updateJobModeration = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "APPROVED",
            "REJECTED",
            "PENDING"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid moderation status"
            });
        }

        const [jobs] = await pool.execute(
            `SELECT j.moderation_status, j.title, u.name, u.email
             FROM jobs j JOIN users u ON u.id = j.recruiter_id
             WHERE j.id = ? LIMIT 1`,
            [jobId]
        );
        if (jobs.length === 0) {
            return res.status(404).json({ message: "Job not found" });
        }

        await pool.execute(
            `UPDATE jobs
             SET moderation_status = ?
             WHERE id = ?`,
            [status, jobId]
        );

        if (jobs[0].moderation_status !== status) {
            void emailService.sendJobModeration({ ...jobs[0], status });
        }

        res.json({
            message: `Job ${status.toLowerCase()} successfully`
        });

    } catch (error) {
        console.error("Job moderation error:", error);

        res.status(500).json({
            message: "Failed to update job moderation"
        });
    }
};


module.exports = {
    getDashboard,
    getUsers,
    deleteUser,
    getRecruiters,
    updateRecruiterVerification,
    getJobsForModeration,
    updateJobModeration
};
