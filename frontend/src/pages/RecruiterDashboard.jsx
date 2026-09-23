import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import recruiterService from "../services/recruiterService";
function RecruiterDashboard() {
    const { user } = useAuth();

    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDashboard = useCallback(async () => {
        try {
            const [companyResult, jobsResult] = await Promise.allSettled([
                recruiterService.getCompany(),
                recruiterService.getMyJobs()
            ]);

            if (companyResult.status === "fulfilled") {
                setCompany(companyResult.value);
            }

            if (jobsResult.status === "fulfilled") {
                setJobs(jobsResult.value);
            }

        } catch (error) {
            console.error("Failed to load recruiter dashboard:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load recruiter dashboard data after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadDashboard();
    }, [loadDashboard]);

    const activeJobs = jobs.filter(
        (job) => job.status === "ACTIVE"
    ).length;
    const totalApplicants = jobs.reduce((total, job) => total + Number(job.total_applicants || 0), 0);
    const pendingApplications = jobs.reduce((total, job) => total + Number(job.pending_applications || 0), 0);
    const shortlistedApplicants = jobs.reduce((total, job) => total + Number(job.shortlisted_applicants || 0), 0);

    if (loading) {
        return (
            <div className="recruiter-loading">
                Loading recruiter dashboard...
            </div>
        );
    }

    return (
        <div className="recruiter-dashboard">

            <div className="recruiter-header">
                <div>
                    <p className="dashboard-label">
                        RECRUITER DASHBOARD
                    </p>

                    <h1>
                        Welcome, {user?.name || "Recruiter"} 👋
                    </h1>

                    <p>
                        Manage your company and job postings from one place.
                    </p>
                </div>
            </div>


            {/* Stats */}

            <div className="recruiter-stats">

                <div className="stat-card">
                    <span className="stat-icon">🏢</span>

                    <div>
                        <span>Company</span>
                        <strong>{company ? "1" : "0"}</strong>
                    </div>
                </div>


                <div className="stat-card">
                    <span className="stat-icon">💼</span>

                    <div>
                        <span>Posted Jobs</span>
                        <strong>{jobs.length}</strong>
                    </div>
                </div>


                <div className="stat-card">
                    <span className="stat-icon">✅</span>

                    <div>
                        <span>Active Jobs</span>
                        <strong>{activeJobs}</strong>
                    </div>
                </div>

                <div className="stat-card"><span className="stat-icon">AP</span><div><span>Total Applicants</span><strong>{totalApplicants}</strong></div></div>
                <div className="stat-card"><span className="stat-icon">PE</span><div><span>Pending Applications</span><strong>{pendingApplications}</strong></div></div>
                <div className="stat-card"><span className="stat-icon">SL</span><div><span>Shortlisted</span><strong>{shortlistedApplicants}</strong></div></div>

            </div>

            {company && company.verification_status !== "VERIFIED" && (
                <div className="verification-notice" role="status">
                    Company verification: <strong>{company.verification_status?.toLowerCase()}</strong>. Job listings appear to candidates after admin approval.
                </div>
            )}


            {/* Quick Actions */}

            <section className="quick-actions">

                <div className="section-heading">
                    <h2>Quick Actions</h2>
                    <p>Manage your recruitment activities.</p>
                </div>


                <div className="action-grid">

                    <Link
                        to="/recruiter/company"
                        className="action-card"
                    >
                        <span>🏢</span>
                        <div>
                            <h3>Company Profile</h3>
                            <p>
                                Create or update your company information.
                            </p>
                        </div>
                        <b>→</b>
                    </Link>


                    <Link
                        to="/recruiter/jobs/create"
                        className="action-card"
                    >
                        <span>➕</span>
                        <div>
                            <h3>Post New Job</h3>
                            <p>
                                Publish a new opportunity for candidates.
                            </p>
                        </div>
                        <b>→</b>
                    </Link>


                    <Link
                        to="/recruiter/jobs"
                        className="action-card"
                    >
                        <span>📋</span>
                        <div>
                            <h3>Manage Jobs</h3>
                            <p>
                                View, edit and delete your job postings.
                            </p>
                        </div>
                        <b>→</b>
                    </Link>

                </div>

            </section>


            {/* Recent Jobs */}

            <section className="recent-jobs">

                <div className="section-heading">
                    <h2>Recent Job Posts</h2>
                    <Link to="/recruiter/jobs">
                        View All →
                    </Link>
                </div>


                {jobs.length === 0 ? (
                    <div className="empty-recruiter-state">
                        <div>💼</div>
                        <h3>No jobs posted yet</h3>
                        <p>
                            Create your first job posting to start hiring.
                        </p>

                        <Link
                            to="/recruiter/jobs/create"
                            className="primary-button"
                        >
                            Post a Job
                        </Link>
                    </div>
                ) : (
                    <div className="recent-job-list">

                        {jobs.slice(0, 5).map((job) => (
                            <div
                                className="recent-job"
                                key={job.id}
                            >
                                <div>
                                    <h3>{job.title}</h3>

                                    <p>
                                        {job.location || "Location not specified"}
                                        {" • "}
                                        {job.job_type || "Job type not specified"}
                                    </p>
                                </div>

                                <span
                                    className={`job-status ${
                                        job.status?.toLowerCase()
                                    }`}
                                >
                                    {job.status}
                                </span>
                                {job.moderation_status && <span className={`job-status ${job.moderation_status.toLowerCase()}`}>{job.moderation_status.toLowerCase()} review</span>}
                            </div>
                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}

export default RecruiterDashboard;
