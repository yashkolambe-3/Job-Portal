const pool = require("../config/db");


// =====================================================
// AI RESUME SCORE
// =====================================================

const resumeScore = async (req, res) => {
    try {
        const userId = req.user.id;

        const [profiles] = await pool.query(
            `SELECT
                cp.id,
                cp.headline,
                cp.location,
                r.skills,
                EXISTS (
                    SELECT 1 FROM resumes resume_check
                    WHERE resume_check.candidate_id = cp.id
                ) AS has_resume
             FROM candidate_profiles cp
             LEFT JOIN resumes r
                ON r.candidate_id = cp.id AND r.is_builder = 1
             WHERE cp.user_id = ?
             ORDER BY r.is_primary DESC, r.id DESC
             LIMIT 1`,
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                message: "Candidate profile not found"
            });
        }

        const profile = profiles[0];

        let score = 0;
        const suggestions = [];
        const strengths = [];

        // -----------------------------------------
        // HEADLINE
        // -----------------------------------------

        if (
            profile.headline &&
            profile.headline.trim() !== ""
        ) {
            score += 25;
            strengths.push("Professional headline is included");
        } else {
            suggestions.push(
                "Add a professional headline"
            );
        }


        // -----------------------------------------
        // SKILLS
        // -----------------------------------------

        if (
            profile.skills &&
            profile.skills.trim() !== ""
        ) {

            const skills = profile.skills
                .split(",")
                .map(skill => skill.trim())
                .filter(skill => skill !== "");

            if (skills.length >= 5) {
                score += 35;
            } else if (skills.length >= 3) {
                score += 25;
            } else {
                score += 15;
            }
            if (skills.length >= 3) strengths.push("Resume lists " + skills.length + " skills");

        } else {
            suggestions.push(
                "Add technical skills to your resume"
            );
        }


        // -----------------------------------------
        // LOCATION
        // -----------------------------------------

        if (
            profile.location &&
            profile.location.trim() !== ""
        ) {
            score += 20;
            strengths.push("Location is set");
        } else {
            suggestions.push(
                "Add your location"
            );
        }


        // -----------------------------------------
        // RESUME EXISTENCE
        // -----------------------------------------

        if (profile.has_resume) {
            score += 20;
        } else {
            suggestions.push(
                "Create or upload a resume"
            );
        }


        if (score > 100) {
            score = 100;
        }


        res.json({
            score,
            suggestions,
            strengths,
            skillsDetected: profile.skills
                ? profile.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
                : [],
            method: "Rule-based profile completeness checklist; uploaded document contents are not parsed."
        });

    } catch (error) {

        console.error(
            "Resume Score Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to calculate resume score"
        });
    }
};



// =====================================================
// AI SKILL SUGGESTIONS
// =====================================================

const skillSuggestions = async (req, res) => {
    try {

        const userId = req.user.id;


        const [profiles] = await pool.query(
            `SELECT
                cp.id,
                r.skills
             FROM candidate_profiles cp
             LEFT JOIN resumes r
                ON r.candidate_id = cp.id
             WHERE cp.user_id = ?
             ORDER BY r.is_primary DESC, r.id DESC
             LIMIT 1`,
            [userId]
        );


        if (profiles.length === 0) {
            return res.status(404).json({
                message:
                    "Candidate profile not found"
            });
        }


        const currentSkills = profiles[0].skills
            ? profiles[0].skills
                .split(",")
                .map(skill =>
                    skill.trim().toLowerCase()
                )
                .filter(skill => skill !== "")
            : [];


        // Common skills used for recommendations
        const commonSkills = [
            "Java",
            "JavaScript",
            "React",
            "Node.js",
            "Express",
            "MySQL",
            "MongoDB",
            "Python",
            "Spring Boot",
            "Git",
            "GitHub",
            "REST API",
            "HTML",
            "CSS",
            "SQL",
            "Docker"
        ];


        const suggestions = commonSkills.filter(
            skill =>
                !currentSkills.includes(
                    skill.toLowerCase()
                )
        );


        res.json({
            currentSkills,
            suggestions,
            method: "Suggestions come from a built-in common skills list and are not generated by a language model."
        });

    } catch (error) {

        console.error(
            "Skill Suggestion Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to generate skill suggestions"
        });
    }
};



// =====================================================
// AI JOB RECOMMENDATIONS
// =====================================================

const jobRecommendations = async (req, res) => {

    try {

        const userId = req.user.id;


        // -----------------------------------------
        // GET CANDIDATE SKILLS + LOCATION
        // -----------------------------------------

        const [profiles] = await pool.query(
            `SELECT
                cp.id,
                cp.location,
                r.skills
             FROM candidate_profiles cp
             LEFT JOIN resumes r
                ON r.candidate_id = cp.id
             WHERE cp.user_id = ?
             ORDER BY r.is_primary DESC, r.id DESC
             LIMIT 1`,
            [userId]
        );


        if (profiles.length === 0) {

            return res.status(404).json({
                message:
                    "Candidate profile not found"
            });
        }


        const profile = profiles[0];


        const userSkills = profile.skills
            ? profile.skills
                .split(",")
                .map(skill =>
                    skill.trim().toLowerCase()
                )
                .filter(skill => skill !== "")
            : [];


        // -----------------------------------------
        // GET APPROVED JOBS
        // -----------------------------------------

        const [jobs] = await pool.query(
            `SELECT
                j.id,
                j.title,
                j.description,
                j.requirements,
                j.location,
                j.job_type,
                j.experience_required,
                j.salary_min,
                j.salary_max,
                j.skills,
                j.vacancy,
                j.application_deadline,
                c.company_name
             FROM jobs j
             JOIN companies c
                ON j.company_id = c.id
             WHERE j.status = 'ACTIVE'
               AND j.moderation_status = 'APPROVED'
               AND c.verification_status = 'VERIFIED'
             ORDER BY j.id DESC`
        );


        // -----------------------------------------
        // CALCULATE MATCH
        // -----------------------------------------

        const recommendations = jobs.map(job => {

            let matchScore = 0;

            const matchedSkills = [];


            const jobText = `
                ${job.title || ""}
                ${job.description || ""}
                ${job.requirements || ""}
                ${job.skills || ""}
            `.toLowerCase();


            // -------------------------------------
            // SKILL MATCHING
            // -------------------------------------

            userSkills.forEach(skill => {

                if (
                    skill &&
                    jobText.includes(skill)
                ) {

                    matchScore += 15;

                    matchedSkills.push(skill);
                }
            });


            // -------------------------------------
            // LOCATION MATCHING
            // -------------------------------------

            if (
                profile.location &&
                job.location &&
                profile.location
                    .trim()
                    .toLowerCase() ===
                job.location
                    .trim()
                    .toLowerCase()
            ) {

                matchScore += 20;
            }


            // -------------------------------------
            // MAX SCORE
            // -------------------------------------

            if (matchScore > 100) {
                matchScore = 100;
            }


            return {
                id: job.id,
                title: job.title,
                company_name: job.company_name,
                location: job.location,
                job_type: job.job_type,
                experience_required:
                    job.experience_required,
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                application_deadline:
                    job.application_deadline,
                matchScore,
                matchedSkills
            };
        });


        // -----------------------------------------
        // SORT BY MATCH
        // -----------------------------------------

        recommendations.sort(
            (a, b) =>
                b.matchScore - a.matchScore
        );


        res.json({
            recommendations
        });


    } catch (error) {

        console.error(
            "Job Recommendation Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to generate job recommendations"
        });
    }
};



module.exports = {
    resumeScore,
    skillSuggestions,
    jobRecommendations
};
