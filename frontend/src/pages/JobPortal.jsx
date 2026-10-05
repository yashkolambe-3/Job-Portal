import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getJobs,
    saveJob
} from "../services/jobService";
import { getFriendlyError } from "../services/api";

function JobPortal() {

    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);

    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState("");
    const [experience, setExperience] = useState("");
    const [appliedFilters, setAppliedFilters] = useState({ search: "", location: "", job_type: "", experience_required: "" });

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        hasNextPage: false,
        hasPreviousPage: false
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [message, setMessage] = useState("");


    // ===============================
    // LOAD JOBS
    // ===============================
    const loadJobs = useCallback(async (filters = appliedFilters, requestedPage = page) => {

        try {

            const data = await getJobs({
                ...filters,
                page: requestedPage,
                limit: 6
            });

            setJobs(data.jobs || []);

            setPagination(
                data.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalJobs: 0,
                    hasNextPage: false,
                    hasPreviousPage: false
                }
            );
            setError("");

        } catch (err) {

            console.error("Load jobs error:", err);

            setError(getFriendlyError(err, "Failed to load jobs."));

        } finally {

            setLoading(false);

        }
    }, [appliedFilters, page]);


    useEffect(() => {
        // Load paginated jobs when the active filters or page changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadJobs();
    }, [loadJobs]);


    // ===============================
    // SEARCH / FILTER
    // ===============================
    const handleSearch = (e) => {

        e.preventDefault();
        setLoading(true);
        setError("");
        const filters = {
            search: search.trim(),
            location: location.trim(),
            job_type: jobType.trim(),
            experience_required: experience.trim()
        };
        setAppliedFilters(filters);
        setPage(1);
    };


    // ===============================
    // CLEAR FILTERS
    // ===============================
    const clearFilters = () => {

        setLoading(true);
        setError("");
        setSearch("");
        setLocation("");
        setJobType("");
        setExperience("");
        const filters = { search: "", location: "", job_type: "", experience_required: "" };
        setAppliedFilters(filters);
        setPage(1);

    };


    // ===============================
    // SAVE JOB
    // ===============================
    const handleSaveJob = async (jobId) => {

        try {

            const data = await saveJob(jobId);

            setMessage(data.message || "Job saved successfully");

            setTimeout(() => {
                setMessage("");
            }, 3000);

        } catch (err) {

            console.error("Save job error:", err);

            setMessage(
                err.response?.data?.message ||
                "Failed to save job"
            );

            setTimeout(() => {
                setMessage("");
            }, 3000);
        }
    };


    // ===============================
    // VIEW JOB
    // ===============================
    const handleViewJob = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };


    return (
        <div className="job-portal">

            {/* =============================== */}
            {/* HEADER */}
            {/* =============================== */}

            <div className="job-portal-header">

                <div>
                    <h1>Find Your Next Job</h1>

                    <p>
                        Discover opportunities that match your skills and career goals.
                    </p>
                </div>

                <div className="job-portal-actions">

                    <button
                        className="secondary-nav-btn"
                        onClick={() => navigate("/saved-jobs")}
                    >
                        Saved Jobs
                    </button>

                    <button
                        className="secondary-nav-btn"
                        onClick={() => navigate("/applications")}
                    >
                        My Applications
                    </button>

                </div>

            </div>


            {/* =============================== */}
            {/* SEARCH */}
            {/* =============================== */}

            <form
                className="job-search-box"
                onSubmit={handleSearch}
            >

                <div className="search-main">

                    <input
                        type="text"
                        aria-label="Search jobs by title, skills or company"
                        placeholder="Search job title, skills, company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button type="submit">
                        Search
                    </button>

                </div>


                <div className="filters">

                    <input
                        type="text"
                        aria-label="Filter by location"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />


                    <input
                        type="text"
                        aria-label="Filter by job type"
                        placeholder="Job Type (e.g. FULL_TIME)"
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                    />


                    <input
                        type="text"
                        aria-label="Filter by experience level"
                        placeholder="Experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                    />


                    <button
                        type="button"
                        className="clear-btn"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>

                </div>

            </form>


            {/* =============================== */}
            {/* MESSAGE */}
            {/* =============================== */}

            {message && (
                <div className="job-message">
                    {message}
                </div>
            )}


            {/* =============================== */}
            {/* RESULTS INFO */}
            {/* =============================== */}

            {!loading && !error && (
                <div className="results-info">
                    <span>
                        {pagination.totalJobs} job
                        {pagination.totalJobs !== 1 ? "s" : ""} found
                    </span>

                    <span>
                        Page {pagination.currentPage} of {pagination.totalPages || 1}
                    </span>
                </div>
            )}


            {/* =============================== */}
            {/* LOADING */}
            {/* =============================== */}

            {loading && (
                <div className="job-loading">
                    <div className="loader"></div>
                    <p>Finding jobs...</p>
                </div>
            )}


            {/* =============================== */}
            {/* ERROR */}
            {/* =============================== */}

            {!loading && error && (
                <div className="job-error">
                    <h3>Unable to load jobs</h3>
                    <p>{error}</p>

                    <button onClick={() => { setLoading(true); setError(""); void loadJobs(); }}>
                        Try Again
                    </button>
                </div>
            )}


            {/* =============================== */}
            {/* JOB LIST */}
            {/* =============================== */}

            {!loading && !error && jobs.length > 0 && (

                <div className="job-grid">

                    {jobs.map((job) => (

                        <div
                            className="job-card"
                            key={job.id}
                        >

                            <div className="job-card-top">

                                <div className="company-icon">
                                    {job.company_name
                                        ? job.company_name.charAt(0).toUpperCase()
                                        : "C"
                                    }
                                </div>

                                <div>
                                    <h2>{job.title}</h2>

                                    <p className="company-name">
                                        {job.company_name}
                                    </p>
                                </div>

                            </div>


                            <div className="job-tags">

                                {job.location && (
                                    <span>📍 {job.location}</span>
                                )}

                                {job.job_type && (
                                    <span>💼 {job.job_type}</span>
                                )}

                                {job.experience_required && (
                                    <span>🎓 {job.experience_required}</span>
                                )}

                            </div>


                            {(job.salary_min || job.salary_max) && (

                                <div className="salary">

                                    ₹{job.salary_min || 0}
                                    {" - "}
                                    ₹{job.salary_max || "Not specified"}

                                </div>

                            )}


                            <p className="job-description">
                                {job.description?.length > 150
                                    ? `${job.description.substring(0, 150)}...`
                                    : job.description
                                }
                            </p>


                            {job.skills && (

                                <div className="skills">

                                    {job.skills
                                        .split(",")
                                        .slice(0, 4)
                                        .map((skill, index) => (

                                            <span key={index}>
                                                {skill.trim()}
                                            </span>

                                        ))
                                    }

                                </div>

                            )}


                            <div className="job-card-buttons">

                                <button
                                    className="view-job-btn"
                                    onClick={() => handleViewJob(job.id)}
                                >
                                    View Details
                                </button>

                                <button
                                    className="save-job-btn"
                                    onClick={() => handleSaveJob(job.id)}
                                >
                                    ♡ Save
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}


            {/* =============================== */}
            {/* EMPTY */}
            {/* =============================== */}

            {!loading && !error && jobs.length === 0 && (

                <div className="empty-jobs">

                    <div className="empty-icon">
                        🔍
                    </div>

                    <h2>No jobs found</h2>

                    <p>
                        Try changing your search or filters.
                    </p>

                    <button onClick={clearFilters}>
                        Clear Filters
                    </button>

                </div>

            )}


            {/* =============================== */}
            {/* PAGINATION */}
            {/* =============================== */}

            {!loading && !error && pagination.totalPages > 1 && (

                <div className="pagination">

                    <button
                        disabled={!pagination.hasPreviousPage}
                        onClick={() => { setLoading(true); setPage(page - 1); }}
                    >
                        ← Previous
                    </button>


                    {Array.from(
                        { length: pagination.totalPages },
                        (_, index) => index + 1
                    ).map((pageNumber) => (

                        <button
                            key={pageNumber}
                            className={
                                pageNumber === page
                                    ? "active-page"
                                    : ""
                            }
                            onClick={() => { setLoading(true); setPage(pageNumber); }}
                        >
                            {pageNumber}
                        </button>

                    ))}


                    <button
                        disabled={!pagination.hasNextPage}
                        onClick={() => { setLoading(true); setPage(page + 1); }}
                    >
                        Next →
                    </button>

                </div>

            )}

        </div>
    );
}

export default JobPortal;
