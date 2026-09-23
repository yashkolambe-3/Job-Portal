import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getJobApplicants,
    updateApplicationStatus
} from "../services/jobService";

function RecruiterApplicants() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(null);


    const loadApplicants = useCallback(async () => {

        try {

            const data = await getJobApplicants(id);

            setJob(data.job);
            setApplicants(data.applicants || []);
            setError("");

        } catch (err) {

            console.error("Applicants error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load applicants"
            );

        } finally {

            setLoading(false);

        }
    }, [id]);


    useEffect(() => {
        // Load applicants for the job selected by the route.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadApplicants();
    }, [loadApplicants]);


    const handleStatusChange = async (
        applicationId,
        status
    ) => {

        try {

            setUpdating(applicationId);

            await updateApplicationStatus(
                applicationId,
                status
            );

            setApplicants((currentApplicants) =>
                currentApplicants.map((applicant) =>
                    applicant.application_id === applicationId
                        ? {
                            ...applicant,
                            status
                        }
                        : applicant
                )
            );

        } catch (err) {

            console.error(
                "Status update error:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to update application status"
            );

        } finally {

            setUpdating(null);

        }
    };


    if (loading) {

        return (
            <div className="applicants-state">
                Loading applicants...
            </div>
        );

    }


    if (error) {

        return (
            <div className="applicants-state">

                <h2>Unable to load applicants</h2>

                <p>{error}</p>

                <button onClick={loadApplicants}>
                    Try Again
                </button>

            </div>
        );

    }


    return (

        <div className="recruiter-applicants-page">

            <div className="applicants-header">

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate("/recruiter/jobs")
                    }
                >
                    ← Back to Jobs
                </button>


                <h1>
                    {job?.title || "Job Applicants"}
                </h1>


                <p>
                    {job?.company_name}
                </p>

            </div>


            <div className="applicants-summary">

                <strong>
                    {applicants.length}
                </strong>

                <span>
                    {applicants.length === 1
                        ? "Applicant"
                        : "Applicants"}
                </span>

            </div>


            {applicants.length === 0 ? (

                <div className="applicants-empty">

                    <div>📭</div>

                    <h2>No applicants yet</h2>

                    <p>
                        Candidates who apply for this job
                        will appear here.
                    </p>

                </div>

            ) : (

                <div className="applicants-list">

                    {applicants.map((applicant) => (

                        <div
                            className="applicant-card"
                            key={applicant.application_id}
                        >

                            <div className="applicant-info">

                                <h2>
                                    {applicant.candidate_name}
                                </h2>

                                <p className="applicant-email">
                                    {applicant.candidate_email}
                                </p>


                                {applicant.headline && (
                                    <p>
                                        {applicant.headline}
                                    </p>
                                )}


                                <div className="applicant-meta">

                                    {applicant.phone && (
                                        <span>
                                            📞 {applicant.phone}
                                        </span>
                                    )}

                                    {applicant.location && (
                                        <span>
                                            📍 {applicant.location}
                                        </span>
                                    )}

                                </div>


                                <p className="applied-date">
                                    Applied{" "}
                                    {new Date(
                                        applicant.applied_at
                                    ).toLocaleDateString()}
                                </p>

                            </div>


                            <div className="applicant-actions">

                                <span
                                    className={`application-status ${applicant.status.toLowerCase()}`}
                                >
                                    {applicant.status}
                                </span>


                                <button
                                    disabled={
                                        updating ===
                                        applicant.application_id
                                    }
                                    onClick={() =>
                                        handleStatusChange(
                                            applicant.application_id,
                                            "SHORTLISTED"
                                        )
                                    }
                                    className="shortlist-button"
                                >
                                    {updating === applicant.application_id
                                        ? "Updating..."
                                        : "Shortlist"}
                                </button>


                                <button
                                    disabled={
                                        updating ===
                                        applicant.application_id
                                    }
                                    onClick={() =>
                                        handleStatusChange(
                                            applicant.application_id,
                                            "REJECTED"
                                        )
                                    }
                                    className="reject-button"
                                >
                                    Reject
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}


export default RecruiterApplicants;
