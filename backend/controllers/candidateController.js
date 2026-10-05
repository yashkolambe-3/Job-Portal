const pool = require("../config/db");

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await pool.query(
            `SELECT 
                cp.*,
                u.name,
                u.email
             FROM candidate_profiles cp
             JOIN users u ON cp.user_id = u.id
             WHERE cp.user_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Candidate profile not found"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Get candidate profile error:", error);

        res.status(500).json({
            message: "Failed to get candidate profile"
        });
    }
};


const createOrUpdateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            phone,
            location,
            headline,
            summary,
            profile_image,
            linkedin_url,
            github_url,
            portfolio_url
        } = req.body;

        const [existing] = await pool.query(
            "SELECT id FROM candidate_profiles WHERE user_id = ?",
            [userId]
        );

        if (existing.length > 0) {

            await pool.query(
                `UPDATE candidate_profiles
                 SET phone = ?,
                     location = ?,
                     headline = ?,
                     summary = ?,
                     profile_image = ?,
                     linkedin_url = ?,
                     github_url = ?,
                     portfolio_url = ?
                 WHERE user_id = ?`,
                [
                    phone,
                    location,
                    headline,
                    summary,
                    profile_image,
                    linkedin_url,
                    github_url,
                    portfolio_url,
                    userId
                ]
            );

        } else {

            await pool.query(
                `INSERT INTO candidate_profiles
                (
                    user_id,
                    phone,
                    location,
                    headline,
                    summary,
                    profile_image,
                    linkedin_url,
                    github_url,
                    portfolio_url
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    phone,
                    location,
                    headline,
                    summary,
                    profile_image,
                    linkedin_url,
                    github_url,
                    portfolio_url
                ]
            );
        }

        res.status(200).json({
            message: "Candidate profile saved successfully"
        });

    } catch (error) {
        console.error("Save candidate profile error:", error);

        res.status(500).json({
            message: "Failed to save candidate profile"
        });
    }
};


const getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const [profile] = await pool.query(
            `SELECT 
                cp.*,
                u.name,
                u.email
             FROM candidate_profiles cp
             JOIN users u ON cp.user_id = u.id
             WHERE cp.user_id = ?`,
            [userId]
        );

        const [resumes] = await pool.query(
            `SELECT r.*
             FROM resumes r
             JOIN candidate_profiles cp
             ON r.candidate_id = cp.id
             WHERE cp.user_id = ?
             ORDER BY r.created_at DESC`,
            [userId]
        );

        const [[applicationCount]] = await pool.query(
            "SELECT COUNT(*) AS total FROM applications WHERE user_id = ?",
            [userId]
        );

        const [recentApplications] = await pool.query(
            `SELECT a.id, a.status, a.applied_at, j.id AS job_id, j.title, c.company_name
             FROM applications a
             JOIN jobs j ON j.id = a.job_id
             JOIN companies c ON c.id = j.company_id
             WHERE a.user_id = ?
             ORDER BY a.applied_at DESC
             LIMIT 5`,
            [userId]
        );

        res.status(200).json({
            profile: profile.length > 0 ? profile[0] : null,
            resumes,
            applicationCount: applicationCount.total,
            recentApplications
        });

    } catch (error) {
        console.error("Candidate dashboard error:", error);

        res.status(500).json({
            message: "Failed to load candidate dashboard"
        });
    }
};


module.exports = {
    getProfile,
    createOrUpdateProfile,
    getDashboard
};
