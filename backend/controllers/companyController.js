const pool = require("../config/db");


// ===============================
// CREATE OR UPDATE COMPANY
// ===============================
const createOrUpdateCompany = async (req, res) => {
    try {
        const recruiterId = req.user.id;

        const {
            company_name,
            description,
            industry,
            website,
            location,
            company_size,
            logo_url
        } = req.body;

        if (!company_name || company_name.trim() === "") {
            return res.status(400).json({
                message: "Company name is required"
            });
        }

        // Check if recruiter already has a company
        const [existing] = await pool.query(
            "SELECT id FROM companies WHERE recruiter_id = ?",
            [recruiterId]
        );

        if (existing.length > 0) {

            await pool.query(
                `UPDATE companies
                 SET company_name = ?,
                     description = ?,
                     industry = ?,
                     website = ?,
                     location = ?,
                     company_size = ?,
                     logo_url = ?
                 WHERE recruiter_id = ?`,
                [
                    company_name,
                    description,
                    industry,
                    website,
                    location,
                    company_size,
                    logo_url,
                    recruiterId
                ]
            );

            return res.status(200).json({
                message: "Company profile updated successfully"
            });
        }

        await pool.query(
            `INSERT INTO companies
            (
                recruiter_id,
                company_name,
                description,
                industry,
                website,
                location,
                company_size,
                logo_url
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                recruiterId,
                company_name,
                description,
                industry,
                website,
                location,
                company_size,
                logo_url
            ]
        );

        res.status(201).json({
            message: "Company created successfully"
        });

    } catch (error) {
        console.error("Create/update company error:", error);

        res.status(500).json({
            message: "Failed to save company profile"
        });
    }
};


// ===============================
// GET COMPANY
// ===============================
const getCompany = async (req, res) => {
    try {
        const recruiterId = req.user.id;

        const [rows] = await pool.query(
            `SELECT
                c.*,
                u.name AS recruiter_name,
                u.email AS recruiter_email
             FROM companies c
             JOIN users u ON c.recruiter_id = u.id
             WHERE c.recruiter_id = ?`,
            [recruiterId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Company profile not found"
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Get company error:", error);

        res.status(500).json({
            message: "Failed to get company profile"
        });
    }
};


// ===============================
// DELETE COMPANY
// ===============================
const deleteCompany = async (req, res) => {
    try {
        const recruiterId = req.user.id;

        const [result] = await pool.query(
            `DELETE FROM companies
             WHERE recruiter_id = ?`,
            [recruiterId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Company profile not found"
            });
        }

        res.status(200).json({
            message: "Company deleted successfully"
        });

    } catch (error) {
        console.error("Delete company error:", error);

        res.status(500).json({
            message: "Failed to delete company"
        });
    }
};


module.exports = {
    createOrUpdateCompany,
    getCompany,
    deleteCompany
};