const pool = require("../config/db");
const path = require("path");
const fs = require("fs/promises");

const uploadDir = path.join(__dirname, "../uploads");

const getCandidateId = async (userId) => {
    const [rows] = await pool.query(
        "SELECT id FROM candidate_profiles WHERE user_id = ? LIMIT 1",
        [userId]
    );
    return rows[0]?.id;
};

exports.getBuilderResume = async (req, res) => {
    try {
        const candidateId = await getCandidateId(req.user.id);
        if (!candidateId) return res.json(null);

        const [rows] = await pool.query(
            "SELECT * FROM resumes WHERE candidate_id = ? AND is_builder = 1 LIMIT 1",
            [candidateId]
        );

        res.json(rows[0] || null);

    } catch (error) {
        console.error("Get builder resume error:", error);

        res.status(500).json({
            message: "Failed to load resume"
        });
    }
};


exports.saveBuilderResume = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            full_name,
            phone,
            email,
            location,
            headline,
            summary,
            skills,
            education,
            experience,
            projects,
            certifications
        } = req.body;


        // Get candidate profile ID
        const [candidateRows] = await pool.query(
            `SELECT id
             FROM candidate_profiles
             WHERE user_id = ?
             LIMIT 1`,
            [userId]
        );


        if (candidateRows.length === 0) {
            return res.status(400).json({
                message: "Candidate profile not found. Please save your candidate profile first."
            });
        }


        const candidateId = candidateRows[0].id;


        // Check existing builder resume
        const [existing] = await pool.query(
            `SELECT id
             FROM resumes
             WHERE candidate_id = ?
             AND is_builder = 1
             LIMIT 1`,
            [candidateId]
        );


        if (existing.length > 0) {

            await pool.query(
                `UPDATE resumes SET
                    full_name = ?,
                    phone = ?,
                    email = ?,
                    location = ?,
                    headline = ?,
                    summary = ?,
                    skills = ?,
                    education = ?,
                    experience = ?,
                    projects = ?,
                    certifications = ?,
                    updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [
                    full_name,
                    phone,
                    email,
                    location,
                    headline,
                    summary,
                    skills,
                    education,
                    experience,
                    projects,
                    certifications,
                    existing[0].id
                ]
            );

        } else {

            await pool.query(
                `INSERT INTO resumes
                (
                    candidate_id,
                    title,
                    file_name,
                    file_path,
                    file_type,
                    full_name,
                    phone,
                    email,
                    location,
                    headline,
                    summary,
                    skills,
                    education,
                    experience,
                    projects,
                    certifications,
                    is_builder
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    candidateId,
                    "My Resume",
                    "builder-resume",
                    "builder-resume",
                    "application/json",
                    full_name,
                    phone,
                    email,
                    location,
                    headline,
                    summary,
                    skills,
                    education,
                    experience,
                    projects,
                    certifications,
                    1
                ]
            );
        }


        res.json({
            message: "Resume saved successfully"
        });

    } catch (error) {

        console.error("Save builder resume error:", error);

        res.status(500).json({
            message: "Failed to save resume"
        });
    }
};

exports.getUploadedResumes = async (req, res) => {
    try {
        const candidateId = await getCandidateId(req.user.id);
        if (!candidateId) return res.json([]);

        const [rows] = await pool.query(
            `SELECT id, title, file_name, file_type, created_at
             FROM resumes
             WHERE candidate_id = ? AND COALESCE(is_builder, 0) = 0
             ORDER BY created_at DESC`,
            [candidateId]
        );
        return res.json(rows);
    } catch (error) {
        console.error("Get uploaded resumes error:", error.code || error.name);
        return res.status(500).json({ message: "Failed to load resumes" });
    }
};

exports.uploadResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Choose a resume file to upload" });
    }

    try {
        const candidateId = await getCandidateId(req.user.id);
        if (!candidateId) {
            await fs.unlink(req.file.path).catch(() => {});
            return res.status(400).json({ message: "Complete your candidate profile before uploading a resume" });
        }

        const title = String(req.body.title || req.file.originalname).trim().slice(0, 200);
        const filePath = `/uploads/${path.basename(req.file.filename)}`;
        const [result] = await pool.query(
            `INSERT INTO resumes (candidate_id, title, file_name, file_path, file_type, is_builder)
             VALUES (?, ?, ?, ?, ?, 0)`,
            [candidateId, title || req.file.originalname, req.file.originalname.slice(0, 255), filePath, req.file.mimetype]
        );

        return res.status(201).json({ message: "Resume uploaded successfully", id: result.insertId });
    } catch (error) {
        await fs.unlink(req.file.path).catch(() => {});
        console.error("Upload resume error:", error.code || error.name);
        return res.status(500).json({ message: "Failed to upload resume" });
    }
};

exports.downloadResume = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT r.file_path, r.file_name
             FROM resumes r
             JOIN candidate_profiles cp ON cp.id = r.candidate_id
             WHERE r.id = ? AND cp.user_id = ? AND COALESCE(r.is_builder, 0) = 0
             LIMIT 1`,
            [req.params.id, req.user.id]
        );
        if (!rows.length) return res.status(404).json({ message: "Resume not found" });

        const storedName = path.basename(rows[0].file_path || "");
        if (!storedName) return res.status(404).json({ message: "Resume file not found" });
        const absolutePath = path.join(uploadDir, storedName);
        await fs.access(absolutePath);
        return res.download(absolutePath, rows[0].file_name);
    } catch (error) {
        if (error.code === "ENOENT") return res.status(404).json({ message: "Resume file not found" });
        console.error("Download resume error:", error.code || error.name);
        return res.status(500).json({ message: "Failed to download resume" });
    }
};

exports.deleteResume = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT r.id, r.file_path
             FROM resumes r
             JOIN candidate_profiles cp ON cp.id = r.candidate_id
             WHERE r.id = ? AND cp.user_id = ? AND COALESCE(r.is_builder, 0) = 0
             LIMIT 1`,
            [req.params.id, req.user.id]
        );
        if (!rows.length) return res.status(404).json({ message: "Resume not found" });

        await pool.query("DELETE FROM resumes WHERE id = ?", [rows[0].id]);
        const storedName = path.basename(rows[0].file_path || "");
        if (storedName) await fs.unlink(path.join(uploadDir, storedName)).catch(() => {});
        return res.json({ message: "Resume deleted successfully" });
    } catch (error) {
        console.error("Delete resume error:", error.code || error.name);
        return res.status(500).json({ message: "Failed to delete resume" });
    }
};
