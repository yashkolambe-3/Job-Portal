import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import candidateService from "../services/candidateService";
import { getFriendlyError } from "../services/api";
function CandidateDashboard() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [applicationCount, setApplicationCount] = useState(null);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async () => {
        try {
            const data = await candidateService.getDashboard();

            setError("");
            setProfile(data.profile);
            setResumes(data.resumes || []);
            setApplicationCount(data.applicationCount ?? 0);
            setRecentApplications(data.recentApplications || []);
            setLoaded(true);

        } catch (error) {
            console.error("Dashboard error:", error);
            setError(getFriendlyError(error, "Failed to load your dashboard."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load API data after mount; the async result populates this page.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadDashboard();
    }, [loadDashboard]);

    const profileFields = ["phone", "location", "headline", "summary", "linkedin_url", "github_url", "portfolio_url"];
    const completedFields = profileFields.filter((field) => profile?.[field]?.trim()).length;
    const completion = profile ? Math.round((completedFields / profileFields.length) * 100) : 0;

    if (loading) {
        return (
            <div className="candidate-dashboard">
                <div className="dashboard-container">
                    <h2>Loading dashboard...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="candidate-dashboard">

            <div className="dashboard-container">

                {error && <div className="dashboard-error" role="alert">{error} <button type="button" onClick={loadDashboard}>Try again</button></div>}

                {/* Header */}
                <div className="dashboard-header">

                    <div>
                        <h1>
                            Welcome back{profile?.name
                                ? `, ${profile.name}`
                                : ""}
                        </h1>

                        <p>
                            Manage your profile, resumes and career.
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/candidate/profile")
                        }
                    >
                        Edit Profile
                    </button>

                </div>


                {/* Profile */}
                <div className="profile-card">

                    <div className="profile-top">

                        <div className="profile-info">

                            <h2>
                                {profile?.name || "Candidate"}
                            </h2>

                            <p>
                                {profile?.headline ||
                                    "Add your professional headline"}
                            </p>

                            <p>
                                {profile?.location ||
                                    "Add your location"}
                            </p>

                            <p>
                                {profile?.email || ""}
                            </p>

                        </div>

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate("/candidate/profile")
                            }
                        >
                            Complete Profile
                        </button>

                    </div>

                    <div className="profile-completion">
                        <div className="profile-completion-label"><span>Profile completeness</span><strong>{completion}%</strong></div>
                        <div className="profile-progress" role="progressbar" aria-label="Profile completeness" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${completion}%` }} /></div>
                    </div>

                </div>


                {/* Stats */}
                <div className="stats-grid">

                    <div className="stat-card">
                        <h3>Resumes</h3>
                        <strong>{loaded ? resumes.length : "—"}</strong>
                    </div>

                    <div className="stat-card">
                        <h3>Profile</h3>
                        <strong>
                            {loaded ? (completion === 100 ? "Complete" : "In progress") : "—"}
                        </strong>
                    </div>

                    <div className="stat-card">
                        <h3>Applications</h3>
                        <strong>{applicationCount ?? "—"}</strong>
                    </div>

                </div>


                {/* Resume Section */}
                <div className="resume-card">

                    <div className="resume-card-header">

                        <h2>My Resumes</h2>

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate("/candidate/resumes")
                            }
                        >
                            Manage Resumes
                        </button>

                    </div>


<button
    className="primary-button"
    onClick={() =>
        navigate("/candidate/resume-builder")
    }
>
    Build Resume
</button>
                    {loaded && resumes.length === 0 ? (

                        <div className="empty-state">

                            <p>
                                You haven't uploaded a resume yet.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate("/candidate/resumes")
                                }
                            >
                                Upload Resume
                            </button>

                        </div>

                    ) : loaded ? (

                        resumes.map((resume) => (

                            <div
                                className="resume-item"
                                key={resume.id}
                            >

                                <h4>{resume.title}</h4>

                                <p>
                                    {resume.file_name}
                                </p>

                            </div>

                        ))

                    ) : null}

                </div>

                <section className="recent-applications-card">
                    <div className="resume-card-header">
                        <div><h2>Recent applications</h2><p>Keep track of where you are in the hiring process.</p></div>
                        <button className="secondary-button" type="button" onClick={() => navigate("/applications")}>View all</button>
                    </div>
                    {!loaded ? null : recentApplications.length === 0 ? (
                        <div className="empty-state"><p>You haven’t applied to a role yet.</p><button className="primary-button" type="button" onClick={() => navigate("/jobs")}>Browse jobs</button></div>
                    ) : recentApplications.map((application) => (
                        <div className="recent-application" key={application.id}>
                            <div><strong>{application.title}</strong><span>{application.company_name}</span></div>
                            <span className={`application-status ${application.status?.toLowerCase()}`}>{application.status}</span>
                        </div>
                    ))}
                </section>

            </div>

        </div>
    );
}

export default CandidateDashboard;
