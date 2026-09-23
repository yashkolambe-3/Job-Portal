import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getMyApplications
} from "../services/jobService";

function MyApplications() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const loadApplications = useCallback(async () => {

        try {

            const data = await getMyApplications();

            setApplications(data || []);
            setError("");

        } catch (err) {

            console.error("Applications error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load applications"
            );

        } finally {

            setLoading(false);

        }
    }, []);


    useEffect(() => {
        // Load the candidate's applications after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadApplications();
    }, [loadApplications]);


    if (loading) {

        return (
            <div className="applications-state">
                Loading applications...
            </div>
        );

    }


    if (error) {

        return (
            <div className="applications-state">

                <h2>Unable to load applications</h2>

                <p>{error}</p>

                <button onClick={() => { setLoading(true); setError(""); void loadApplications(); }}>
                    Try Again
                </button>

            </div>
        );

    }


    return (
        <div className="applications-page">

            <div className="applications-header">

                <button
                    className="back-btn"
                    onClick={() => navigate("/jobs")}
                >
                    ← Back to Jobs
                </button>

                <h1>My Applications</h1>

                <p>
                    Track the jobs you've applied for.
                </p>

            </div>


            {applications.length === 0 ? (

                <div className="applications-empty">

                    <div>📄</div>

                    <h2>No applications yet</h2>

                    <p>
                        Start applying for jobs to see your applications here.
                    </p>

                    <button
                        onClick={() => navigate("/jobs")}
                    >
                        Find Jobs
                    </button>

                </div>

            ) : (

                <div className="applications-list">

                    {applications.map((application) => (

                        <div
                            className="application-card"
                            key={application.id}
                        >

                            <div className="application-info">

                                <h2>
                                    {application.title}
                                </h2>

                                <h3>
                                    {application.company_name}
                                </h3>

                                <div className="application-meta">

                                    {application.location && (
                                        <span>
                                            📍 {application.location}
                                        </span>
                                    )}

                                    {application.job_type && (
                                        <span>
                                            💼 {application.job_type}
                                        </span>
                                    )}

                                </div>

                                {(application.salary_min ||
                                    application.salary_max) && (

                                    <p className="application-salary">

                                        ₹{application.salary_min || 0}
                                        {" - "}
                                        ₹{application.salary_max || "Not specified"}

                                    </p>

                                )}

                            </div>


                            <div className="application-status">

                                <span className="status-label">
                                    Status
                                </span>

                                <span className="status-badge">
                                    {application.status}
                                </span>

                                <span className="applied-date">

                                    Applied{" "}

                                    {new Date(
                                        application.applied_at
                                    ).toLocaleDateString()}

                                </span>


                                <button
                                    onClick={() =>
                                        navigate(
                                            `/jobs/${application.job_id}`
                                        )
                                    }
                                >
                                    View Job
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default MyApplications;
