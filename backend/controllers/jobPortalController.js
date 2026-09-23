const pool = require("../config/db");

// ===============================
// GET JOB LISTINGS
// Search + Filter + Pagination
// ===============================
const getJobs = async (req, res) => {
    try {
        let {
            search,
            location,
            job_type,
            experience_required,
            company_id,
            page = 1,
            limit = 10
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        if (isNaN(page) || page < 1) {
            page = 1;
        }

        if (isNaN(limit) || limit < 1 || limit > 50) {
            limit = 10;
        }

        const offset = (page - 1) * limit;

        let whereConditions = [
            "j.status = 'ACTIVE'",
            "j.moderation_status = 'APPROVED'",
            "c.verification_status = 'VERIFIED'",
            "(j.application_deadline IS NULL OR j.application_deadline >= CURDATE())"
        ];

        let params = [];

        // ===============================
        // SEARCH
        // ===============================
        if (search && search.trim() !== "") {
            whereConditions.push(`
                (
                    j.title LIKE ?
                    OR j.description LIKE ?
                    OR j.skills LIKE ?
                    OR j.location LIKE ?
                    OR c.company_name LIKE ?
                )
            `);

            const searchValue = `%${search.trim()}%`;

            params.push(
                searchValue,
                searchValue,
                searchValue,
                searchValue,
                searchValue
            );
        }

        // ===============================
        // LOCATION FILTER
        // ===============================
        if (location && location.trim() !== "") {
            whereConditions.push("j.location LIKE ?");
            params.push(`%${location.trim()}%`);
        }

        // ===============================
        // JOB TYPE FILTER
        // ===============================
        if (job_type && job_type.trim() !== "") {
            whereConditions.push("j.job_type = ?");
            params.push(job_type.trim());
        }

        // ===============================
        // EXPERIENCE FILTER
        // ===============================
        if (experience_required && experience_required.trim() !== "") {
            whereConditions.push("j.experience_required = ?");
            params.push(experience_required.trim());
        }

        // ===============================
        // COMPANY FILTER
        // ===============================
        if (company_id) {
            whereConditions.push("j.company_id = ?");
            params.push(company_id);
        }

        const whereClause = whereConditions.join(" AND ");

        // ===============================
        // GET TOTAL COUNT
        // ===============================
        const [countRows] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM jobs j
            JOIN companies c ON j.company_id = c.id
            WHERE ${whereClause}
            `,
            params
        );

        const totalJobs = countRows[0].total;

        // ===============================
        // GET JOBS
        // ===============================
        const [jobs] = await pool.query(
            `
            SELECT
                j.id,
                j.company_id,
                j.recruiter_id,
                j.title,
                j.description,
                j.requirements,
                j.responsibilities,
                j.location,
                j.job_type,
                j.experience_required,
                j.salary_min,
                j.salary_max,
                j.skills,
                j.vacancy,
                j.application_deadline,
                j.status,
                j.created_at,
                c.company_name
            FROM jobs j
            JOIN companies c ON j.company_id = c.id
            WHERE ${whereClause}
            ORDER BY j.created_at DESC
            LIMIT ? OFFSET ?
            `,
            [...params, limit, offset]
        );

        const totalPages = Math.ceil(totalJobs / limit);

        res.status(200).json({
            jobs,
            pagination: {
                currentPage: page,
                limit,
                totalJobs,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (error) {
        console.error("Get jobs error:", error);

        res.status(500).json({
            message: "Failed to get jobs"
        });
    }
};


// ===============================
// GET JOB DETAILS
// ===============================
const getJobDetails = async (req, res) => {
    try {
        const jobId = req.params.id;

        const [rows] = await pool.query(
            `
            SELECT
                j.id,
                j.company_id,
                j.recruiter_id,
                j.title,
                j.description,
                j.requirements,
                j.responsibilities,
                j.location,
                j.job_type,
                j.experience_required,
                j.salary_min,
                j.salary_max,
                j.skills,
                j.vacancy,
                j.application_deadline,
                j.status,
                j.created_at,
                j.updated_at,
                c.company_name
            FROM jobs j
            JOIN companies c ON j.company_id = c.id
            WHERE j.id = ?
            AND j.status = 'ACTIVE'
            AND j.moderation_status = 'APPROVED'
            AND c.verification_status = 'VERIFIED'
            `,
            [jobId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Get job details error:", error);

        res.status(500).json({
            message: "Failed to get job details"
        });
    }
};


module.exports = {
    getJobs,
    getJobDetails
};
