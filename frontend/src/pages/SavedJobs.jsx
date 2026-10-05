import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getSavedJobs,
    removeSavedJob
} from "../services/jobService";

function SavedJobs() {

    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const loadSavedJobs = useCallback(async () => {

        try {

            const data = await getSavedJobs();

            setJobs(data || []);
            setError("");

        } catch (err) {

            console.error("Saved jobs error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load saved jobs"
            );

        } finally {

            setLoading(false);

        }
    }, []);


    useEffect(() => {
        // Load the candidate's saved jobs after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadSavedJobs();
    }, [loadSavedJobs]);


    const handleRemove = async (jobId) => {

        try {

            await removeSavedJob(jobId);

            setJobs(
                jobs.filter(
                    (job) => job.job_id !== jobId
                )
            );

        } catch (err) {

            alert(
                err.response?.data?.message ||
                "Failed to remove saved job"
            );

        }
    };


    if (loading) {

        return (
            <div className="saved-state">
                Loading saved jobs...
            </div>
        );

    }


    if (error) {

        return (
            <div className="saved-state">

                <h2>Unable to load saved jobs</h2>

                <p>{error}</p>

                <button onClick={() => { setLoading(true); setError(""); void loadSavedJobs(); }}>
                    Try Again
                </button>

            </div>
        );

    }


    return (
        <div className="saved-jobs-page">

            <div className="saved-header">

                <button
                    onClick={() => navigate("/jobs")}
                    className="back-btn"
                >
                    ← Back to Jobs
                </button>

                <h1>Saved Jobs</h1>

                <p>
                    Jobs you've saved for later.
                </p>

            </div>


            {jobs.length === 0 ? (

                <div className="saved-empty">

                    <div>♡</div>

                    <h2>No saved jobs</h2>

                    <p>
                        Save interesting jobs and find them here later.
                    </p>

                    <button
                        onClick={() => navigate("/jobs")}
                    >
                        Browse Jobs
                    </button>

                </div>

            ) : (

                <div className="saved-list">

                    {jobs.map((job) => (

                        <div
                            className="saved-job-card"
                            key={job.saved_job_id}
                        >

                            <div>

                                <h2>{job.title}</h2>

                                <h3>
                                    {job.company_name}
                                </h3>

                                <div className="saved-meta">

                                    {job.location && (
                                        <span>
                                            📍 {job.location}
                                        </span>
                                    )}

                                    {job.job_type && (
                                        <span>
                                            💼 {job.job_type}
                                        </span>
                                    )}

                                    {job.experience_required && (
                                        <span>
                                            🎓 {job.experience_required}
                                        </span>
                                    )}

                                </div>

                                {(job.salary_min || job.salary_max) && (
                                    <p className="saved-salary">
                                        ₹{job.salary_min || 0}
                                        {" - "}
                                        ₹{job.salary_max || "Not specified"}
                                    </p>
                                )}

                            </div>


                            <div className="saved-buttons">

                                <button
                                    onClick={() =>
                                        navigate(`/jobs/${job.job_id}`)
                                    }
                                >
                                    View Job
                                </button>

                                <button
                                    className="remove-btn"
                                    onClick={() =>
                                        handleRemove(job.job_id)
                                    }
                                >
                                    Remove
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default SavedJobs;
