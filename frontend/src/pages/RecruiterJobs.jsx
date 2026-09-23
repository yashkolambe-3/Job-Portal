
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import recruiterService from "../services/recruiterService";
function RecruiterJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadJobs = useCallback(async () => {
        try {
            const data = await recruiterService.getMyJobs();
            setJobs(data);
        } catch (error) {
            console.error("Failed to load jobs:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load jobs"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load the recruiter's job list after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadJobs();
    }, [loadJobs]);

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this job?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await recruiterService.deleteJob(id);

            setJobs(
                jobs.filter((job) => job.id !== id)
            );
        } catch (error) {
            console.error("Delete job error:", error);

            setError(error.response?.data?.message || "Failed to delete job");
        }
    };

    const handleApplicants = (jobId) => {
        navigate(`/recruiter/jobs/${jobId}/applicants`);
    };

    if (loading) {
        return (
            <div className="jobs-loading">
                Loading jobs...
            </div>
        );
    }

    return (
        <div className="recruiter-jobs-page">

            <div className="jobs-page-header">

                <div>
                    <Link
                        to="/recruiter/dashboard"
                        className="back-link"
                    >
                        ← Dashboard
                    </Link>

                    <h1>My Posted Jobs</h1>

                    <p>
                        Manage all your job postings.
                    </p>
                </div>

                <Link
                    to="/recruiter/jobs/create"
                    className="create-job-button"
                >
                    + Post New Job
                </Link>

            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {jobs.length === 0 ? (

                <div className="jobs-empty">

                    <div>💼</div>

                    <h2>No jobs yet</h2>

                    <p>
                        You haven't posted any jobs yet.
                    </p>

                    <Link
                        to="/recruiter/jobs/create"
                        className="create-job-button"
                    >
                        Post Your First Job
                    </Link>

                </div>

            ) : (

                <div className="jobs-list">

                    {jobs.map((job) => (

                        <div
                            className="job-card"
                            key={job.id}
                        >

                            <div className="job-card-main">

                                <div className="job-card-top">

                                    <div>
                                        <h2>{job.title}</h2>

                                        <p className="company-name">
                                            {job.company_name}
                                        </p>
                                    </div>

                                    <span
                                        className={`job-status ${job.status?.toLowerCase()}`}
                                    >
                                        {job.status}
                                    </span>
                                    {job.moderation_status && <span className={`job-status ${job.moderation_status.toLowerCase()}`}>{job.moderation_status.toLowerCase()} review</span>}

                                </div>

                                <div className="job-meta">

                                    <span>
                                        📍 {job.location || "Not specified"}
                                    </span>

                                    <span>
                                        💼 {job.job_type || "Not specified"}
                                    </span>

                                    <span>
                                        👤 {job.vacancy || 1} vacancy
                                        {(job.vacancy || 1) > 1 ? "ies" : ""}
                                    </span>

                                </div>

                                <div className="job-applicant-counts">
                                    <span>{Number(job.total_applicants || 0)} applicants</span>
                                    <span>{Number(job.pending_applications || 0)} pending</span>
                                    <span>{Number(job.shortlisted_applicants || 0)} shortlisted</span>
                                </div>

                                <div className="job-salary">

                                    {job.salary_min || job.salary_max ? (
                                        <>
                                            ₹
                                            {job.salary_min
                                                ? Number(job.salary_min).toLocaleString()
                                                : "0"
                                            }

                                            {" - "}

                                            ₹
                                            {job.salary_max
                                                ? Number(job.salary_max).toLocaleString()
                                                : "0"
                                            }
                                        </>
                                    ) : (
                                        "Salary not specified"
                                    )}

                                </div>

                            </div>

                            <div className="job-card-actions">

                                <button
                                    onClick={() => handleApplicants(job.id)}
                                    className="applicants-button"
                                >
                                    Applicants
                                </button>

                                <Link
                                    to={`/recruiter/jobs/edit/${job.id}`}
                                    className="edit-button"
                                >
                                    Edit
                                </Link>

                                <button
                                    onClick={() => handleDelete(job.id)}
                                    className="delete-button"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default RecruiterJobs;
