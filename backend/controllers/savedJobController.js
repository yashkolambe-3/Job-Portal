const pool = require("../config/db");


// ===============================
// SAVE JOB
// ===============================
const saveJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const jobId = req.params.id;

        // ===============================
        // CHECK JOB
        // ===============================
        const [jobs] = await pool.query(
            `
            SELECT id
            FROM jobs
            WHERE id = ?
            AND status = 'ACTIVE'
            `,
            [jobId]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        // ===============================
        // CHECK EXISTING SAVE
        // ===============================
        const [existing] = await pool.query(
            `
            SELECT id
            FROM saved_jobs
            WHERE user_id = ?
            AND job_id = ?
            `,
            [userId, jobId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Job already saved"
            });
        }

        // ===============================
        // SAVE JOB
        // ===============================
        const [result] = await pool.query(
            `
            INSERT INTO saved_jobs
            (
                user_id,
                job_id
            )
            VALUES (?, ?)
            `,
            [userId, jobId]
        );

        res.status(201).json({
            message: "Job saved successfully",
            savedJobId: result.insertId
        });

    } catch (error) {
        console.error("Save job error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Job already saved"
            });
        }

        res.status(500).json({
            message: "Failed to save job"
        });
    }
};


// ===============================
// UNSAVE JOB
// ===============================
const removeSavedJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const jobId = req.params.id;

        const [result] = await pool.query(
            `
            DELETE FROM saved_jobs
            WHERE user_id = ?
            AND job_id = ?
            `,
            [userId, jobId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Saved job not found"
            });
        }

        res.status(200).json({
            message: "Job removed from saved jobs"
        });

    } catch (error) {
        console.error("Remove saved job error:", error);

        res.status(500).json({
            message: "Failed to remove saved job"
        });
    }
};


// ===============================
// GET MY SAVED JOBS
// ===============================
const getMySavedJobs = async (req, res) => {
    try {
        const userId = req.user.id;

        const [savedJobs] = await pool.query(
            `
            SELECT
                s.id AS saved_job_id,
                s.saved_at,

                j.id AS job_id,
                j.title,
                j.description,
                j.location,
                j.job_type,
                j.experience_required,
                j.salary_min,
                j.salary_max,
                j.skills,
                j.application_deadline,
                j.status,
                j.created_at,

                c.company_name

            FROM saved_jobs s

            JOIN jobs j
                ON s.job_id = j.id

            JOIN companies c
                ON j.company_id = c.id

            WHERE s.user_id = ?
              AND j.status = 'ACTIVE'
              AND j.moderation_status = 'APPROVED'
              AND c.verification_status = 'VERIFIED'

            ORDER BY s.saved_at DESC
            `,
            [userId]
        );

        res.status(200).json(savedJobs);

    } catch (error) {
        console.error("Get saved jobs error:", error);

        res.status(500).json({
            message: "Failed to get saved jobs"
        });
    }
};


module.exports = {
    saveJob,
    removeSavedJob,
    getMySavedJobs
};
