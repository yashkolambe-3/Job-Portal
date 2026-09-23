import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getJobDetails,
    applyForJob,
    saveJob
} from "../services/jobService";

function JobDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");

    const [applying, setApplying] = useState(false);
    const [saving, setSaving] = useState(false);


    // ===============================
    // LOAD JOB
    // ===============================
    useEffect(() => {

        const loadJob = async () => {

            try {

                setLoading(true);

                const data = await getJobDetails(id);

                setJob(data);

            } catch (err) {

                console.error("Get job details error:", err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load job details"
                );

            } finally {

                setLoading(false);

            }
        };

        loadJob();

    }, [id]);


    // ===============================
    // APPLY
    // ===============================
    const handleApply = async () => {

        try {

            setApplying(true);

            setActionMessage("");
            setActionError("");

            const data = await applyForJob(id);

            setActionMessage(
                data.message || "Application submitted successfully"
            );

        } catch (err) {

            console.error("Apply error:", err);

            setActionError(
                err.response?.data?.message ||
                "Failed to apply for this job"
            );

        } finally {

            setApplying(false);

        }
    };


    // ===============================
    // SAVE
    // ===============================
    const handleSave = async () => {

        try {

            setSaving(true);

            setActionMessage("");
            setActionError("");

            const data = await saveJob(id);

            setActionMessage(
                data.message || "Job saved successfully"
            );

        } catch (err) {

            console.error("Save error:", err);

            setActionError(
                err.response?.data?.message ||
                "Failed to save this job"
            );

        } finally {

            setSaving(false);

        }
    };


    // ===============================
    // LOADING
    // ===============================
    if (loading) {

        return (
            <div className="details-loading">
                Loading job details...
            </div>
        );

    }


    // ===============================
    // ERROR
    // ===============================
    if (error || !job) {

        return (
            <div className="details-error">

                <h2>Job Not Found</h2>

                <p>
                    {error || "This job could not be found."}
                </p>

                <button onClick={() => navigate("/jobs")}>
                    Back to Jobs
                </button>

            </div>
        );

    }


    return (
        <div className="job-details-page">

            {/* =============================== */}
            {/* BACK */}
            {/* =============================== */}

            <button
                className="back-btn"
                onClick={() => navigate("/jobs")}
            >
                ← Back to Jobs
            </button>


            {/* =============================== */}
            {/* HEADER */}
            {/* =============================== */}

            <div className="job-details-header">

                <div className="company-large-icon">
                    {job.company_name
                        ? job.company_name.charAt(0).toUpperCase()
                        : "C"
                    }
                </div>

                <div>

                    <h1>{job.title}</h1>

                    <h3>
                        {job.company_name}
                    </h3>

                    <div className="details-meta">

                        {job.location && (
                            <span>📍 {job.location}</span>
                        )}

                        {job.job_type && (
                            <span>💼 {job.job_type}</span>
                        )}

                        {job.experience_required && (
                            <span>
                                🎓 {job.experience_required}
                            </span>
                        )}

                    </div>

                </div>

            </div>


            {/* =============================== */}
            {/* ACTIONS */}
            {/* =============================== */}

            <div className="job-actions">

                <button
                    className="apply-btn"
                    disabled={applying}
                    onClick={handleApply}
                >
                    {applying
                        ? "Applying..."
                        : "Apply Now"
                    }
                </button>


                <button
                    className="save-btn"
                    disabled={saving}
                    onClick={handleSave}
                >
                    {saving
                        ? "Saving..."
                        : "♡ Save Job"
                    }
                </button>

            </div>


            {/* =============================== */}
            {/* ACTION MESSAGE */}
            {/* =============================== */}

            {actionMessage && (
                <div className="success-message">
                    {actionMessage}
                </div>
            )}

            {actionError && (
                <div className="error-message">
                    {actionError}
                </div>
            )}


            {/* =============================== */}
            {/* CONTENT */}
            {/* =============================== */}

            <div className="job-details-content">

                <main>

                    <section className="details-section">

                        <h2>Job Description</h2>

                        <p className="details-text">
                            {job.description}
                        </p>

                    </section>


                    {job.requirements && (

                        <section className="details-section">

                            <h2>Requirements</h2>

                            <p className="details-text">
                                {job.requirements}
                            </p>

                        </section>

                    )}


                    {job.responsibilities && (

                        <section className="details-section">

                            <h2>Responsibilities</h2>

                            <p className="details-text">
                                {job.responsibilities}
                            </p>

                        </section>

                    )}


                    {job.skills && (

                        <section className="details-section">

                            <h2>Skills</h2>

                            <div className="detail-skills">

                                {job.skills
                                    .split(",")
                                    .map((skill, index) => (

                                        <span key={index}>
                                            {skill.trim()}
                                        </span>

                                    ))
                                }

                            </div>

                        </section>

                    )}

                </main>


                {/* =============================== */}
                {/* SIDEBAR */}
                {/* =============================== */}

                <aside className="job-sidebar">

                    <div className="sidebar-card">

                        <h3>Job Overview</h3>


                        {job.job_type && (
                            <div className="overview-item">
                                <strong>Job Type</strong>
                                <span>{job.job_type}</span>
                            </div>
                        )}


                        {job.location && (
                            <div className="overview-item">
                                <strong>Location</strong>
                                <span>{job.location}</span>
                            </div>
                        )}


                        {job.experience_required && (
                            <div className="overview-item">
                                <strong>Experience</strong>
                                <span>{job.experience_required}</span>
                            </div>
                        )}


                        {(job.salary_min || job.salary_max) && (
                            <div className="overview-item">
                                <strong>Salary</strong>
                                <span>
                                    ₹{job.salary_min || 0}
                                    {" - "}
                                    ₹{job.salary_max || "Not specified"}
                                </span>
                            </div>
                        )}


                        {job.vacancy && (
                            <div className="overview-item">
                                <strong>Vacancies</strong>
                                <span>{job.vacancy}</span>
                            </div>
                        )}


                        {job.application_deadline && (
                            <div className="overview-item">
                                <strong>Deadline</strong>
                                <span>
                                    {new Date(
                                        job.application_deadline
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                    </div>

                </aside>

            </div>

        </div>
    );
}

export default JobDetails;