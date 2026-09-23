const pool = require("../config/db");


// ===============================
// CREATE JOB
// ===============================
const createJob = async (req, res) => {
    try {
        const recruiterId = req.user.id;

        const {
            company_id,
            title,
            description,
            requirements,
            responsibilities,
            location,
            job_type,
            experience_required,
            salary_min,
            salary_max,
            skills,
            vacancy,
            application_deadline,
            status
        } = req.body;

        if (!company_id) {
            return res.status(400).json({
                message: "Company ID is required"
            });
        }

        if (!title || !description) {
            return res.status(400).json({
                message: "Job title and description are required"
            });
        }

        // Make sure company belongs to logged-in recruiter
        const [company] = await pool.query(
            `SELECT id
             FROM companies
             WHERE id = ?
             AND recruiter_id = ?`,
            [company_id, recruiterId]
        );

        if (company.length === 0) {
            return res.status(403).json({
                message: "You can only create jobs for your own company"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO jobs
            (
                company_id,
                recruiter_id,
                title,
                description,
                requirements,
                responsibilities,
                location,
                job_type,
                experience_required,
                salary_min,
                salary_max,
                skills,
                vacancy,
                application_deadline,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                company_id,
                recruiterId,
                title,
                description,
                requirements,
                responsibilities,
                location,
                job_type,
                experience_required,
                salary_min || null,
                salary_max || null,
                skills,
                vacancy || 1,
                application_deadline || null,
                status || "ACTIVE"
            ]
        );

        res.status(201).json({
            message: "Job posted successfully",
            jobId: result.insertId
        });

    } catch (error) {
        console.error("Create job error:", error);

        res.status(500).json({
            message: "Failed to create job"
        });
    }
};


// ===============================
// GET RECRUITER JOBS
// ===============================
const getMyJobs = async (req, res) => {
    try {
        const recruiterId = req.user.id;

        const [rows] = await pool.query(
            `SELECT
                j.*,
                c.company_name,
                (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS total_applicants,
                (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id AND a.status = 'APPLIED') AS pending_applications,
                (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id AND a.status = 'SHORTLISTED') AS shortlisted_applicants
             FROM jobs j
             JOIN companies c ON j.company_id = c.id
             WHERE j.recruiter_id = ?
             ORDER BY j.created_at DESC`,
            [recruiterId]
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error("Get recruiter jobs error:", error);

        res.status(500).json({
            message: "Failed to get jobs"
        });
    }
};


// ===============================
// GET SINGLE JOB
// ===============================
const getJobById = async (req, res) => {
    try {
        const recruiterId = req.user.id;
        const jobId = req.params.id;

        const [rows] = await pool.query(
            `SELECT
                j.*,
                c.company_name
             FROM jobs j
             JOIN companies c ON j.company_id = c.id
             WHERE j.id = ?
             AND j.recruiter_id = ?`,
            [jobId, recruiterId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Get job error:", error);

        res.status(500).json({
            message: "Failed to get job"
        });
    }
};


// ===============================
// UPDATE JOB
// ===============================
const updateJob = async (req, res) => {
    try {
        const recruiterId = req.user.id;
        const jobId = req.params.id;

        const {
            title,
            description,
            requirements,
            responsibilities,
            location,
            job_type,
            experience_required,
            salary_min,
            salary_max,
            skills,
            vacancy,
            application_deadline,
            status
        } = req.body;

        if (status && !["ACTIVE", "CLOSED"].includes(status)) {
            return res.status(400).json({ message: "Job status must be ACTIVE or CLOSED" });
        }

        const [existingJobs] = await pool.query(
            "SELECT id FROM jobs WHERE id = ? AND recruiter_id = ? LIMIT 1",
            [jobId, recruiterId]
        );
        if (existingJobs.length === 0) {
            return res.status(404).json({ message: "Job not found" });
        }

        const [result] = await pool.query(
            `UPDATE jobs
             SET title = ?,
                 description = ?,
                 requirements = ?,
                 responsibilities = ?,
                 location = ?,
                 job_type = ?,
                 experience_required = ?,
                 salary_min = ?,
                 salary_max = ?,
                 skills = ?,
                 vacancy = ?,
                 application_deadline = ?,
                 status = ?,
                 moderation_status = 'PENDING'
             WHERE id = ?
             AND recruiter_id = ?`,
            [
                title,
                description,
                requirements,
                responsibilities,
                location,
                job_type,
                experience_required,
                salary_min || null,
                salary_max || null,
                skills,
                vacancy || 1,
                application_deadline || null,
                status || "ACTIVE",
                jobId,
                recruiterId
            ]
        );

        res.status(200).json({
            message: "Job updated successfully"
        });

    } catch (error) {
        console.error("Update job error:", error);

        res.status(500).json({
            message: "Failed to update job"
        });
    }
};


// ===============================
// DELETE JOB
// ===============================
const deleteJob = async (req, res) => {
    let connection;

    try {
        const recruiterId = req.user.id;
        const jobId = req.params.id;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Lock the job row so a concurrent application cannot slip between
        // the count check and the delete (the schema otherwise cascades it).
        const [jobs] = await connection.query(
            "SELECT id FROM jobs WHERE id = ? AND recruiter_id = ? FOR UPDATE",
            [jobId, recruiterId]
        );

        if (jobs.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Job not found"
            });
        }

        const [[applicationCount]] = await connection.query(
            "SELECT COUNT(*) AS total FROM applications WHERE job_id = ?",
            [jobId]
        );

        if (Number(applicationCount.total) > 0) {
            await connection.rollback();
            return res.status(409).json({
                message: "This job has applications and cannot be deleted. Close it instead."
            });
        }

        await connection.query("DELETE FROM jobs WHERE id = ? AND recruiter_id = ?", [jobId, recruiterId]);
        await connection.commit();

        res.status(200).json({
            message: "Job deleted successfully"
        });

    } catch (error) {
        if (connection) await connection.rollback().catch(() => {});
        console.error("Delete job error:", error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ message: "This job has applications and cannot be deleted. Close it instead." });
        }

        res.status(500).json({
            message: "Failed to delete job"
        });
    } finally {
        connection?.release();
    }
};


module.exports = {
    createJob,
    getMyJobs,
    getJobById,
    updateJob,
    deleteJob
};
