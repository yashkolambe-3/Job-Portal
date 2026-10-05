import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import recruiterService from "../services/recruiterService";
function EditJob() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        requirements: "",
        responsibilities: "",
        location: "",
        job_type: "FULL_TIME",
        experience_required: "",
        salary_min: "",
        salary_max: "",
        skills: "",
        vacancy: 1,
        application_deadline: "",
        status: "ACTIVE"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadJob = useCallback(async () => {
        try {
            const job = await recruiterService.getJobById(id);

            setFormData({
                title: job.title || "",
                description: job.description || "",
                requirements: job.requirements || "",
                responsibilities: job.responsibilities || "",
                location: job.location || "",
                job_type: job.job_type || "FULL_TIME",
                experience_required: job.experience_required || "",
                salary_min: job.salary_min || "",
                salary_max: job.salary_max || "",
                skills: job.skills || "",
                vacancy: job.vacancy || 1,
                application_deadline:
                    job.application_deadline
                        ? String(job.application_deadline).substring(0, 10)
                        : "",
                status: job.status || "ACTIVE"
            });

        } catch (error) {
            console.error("Failed to load job:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load job"
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        // Load the selected job when its route id changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadJob();
    }, [loadJob]);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");

        try {
            await recruiterService.updateJob(id, {
                title: formData.title,
                description: formData.description,
                requirements: formData.requirements,
                responsibilities: formData.responsibilities,
                location: formData.location,
                job_type: formData.job_type,
                experience_required: formData.experience_required,
                salary_min: formData.salary_min || null,
                salary_max: formData.salary_max || null,
                skills: formData.skills,
                vacancy: Number(formData.vacancy) || 1,
                application_deadline:
                    formData.application_deadline || null,
                status: formData.status
            });

            navigate("/recruiter/jobs");

        } catch (error) {
            console.error("Update job error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to update job"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="job-loading">
                Loading job...
            </div>
        );
    }

    return (
        <div className="job-form-page">

            <div className="job-form-header">

                <Link
                    to="/recruiter/jobs"
                    className="back-link"
                >
                    ← My Jobs
                </Link>

                <h1>Edit Job</h1>

                <p>
                    Update your job posting information.
                </p>

            </div>


            <form
                className="job-form"
                onSubmit={handleSubmit}
            >

                <div className="job-form-section">

                    <h2>Job Information</h2>

                    <div className="job-form-grid">

                        <div className="form-group full">
                            <label htmlFor="title">Job Title *</label>

                            <input id="title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="location">Location</label>

                            <input id="location"
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="job_type">Job Type</label>

                            <select id="job_type"
                                name="job_type"
                                value={formData.job_type}
                                onChange={handleChange}
                            >
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="INTERNSHIP">Internship</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="REMOTE">Remote</option>
                            </select>
                        </div>


                        <div className="form-group">
                            <label htmlFor="experience_required">Experience Required</label>

                            <input id="experience_required"
                                type="text"
                                name="experience_required"
                                value={formData.experience_required}
                                onChange={handleChange}
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="vacancy">Vacancies</label>

                            <input id="vacancy"
                                type="number"
                                min="1"
                                name="vacancy"
                                value={formData.vacancy}
                                onChange={handleChange}
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="salary_min">Minimum Salary</label>

                            <input id="salary_min"
                                type="number"
                                min="0"
                                name="salary_min"
                                value={formData.salary_min}
                                onChange={handleChange}
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="salary_max">Maximum Salary</label>

                            <input id="salary_max"
                                type="number"
                                min="0"
                                name="salary_max"
                                value={formData.salary_max}
                                onChange={handleChange}
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="application_deadline">Application Deadline</label>

                            <input id="application_deadline"
                                type="date"
                                name="application_deadline"
                                value={formData.application_deadline}
                                onChange={handleChange}
                            />
                        </div>


                        <div className="form-group full">
                            <label htmlFor="skills">Skills</label>

                            <input id="skills"
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                            />
                        </div>


                        <div className="form-group full">
                            <label htmlFor="description">Description *</label>

                            <textarea id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                required
                            />
                        </div>


                        <div className="form-group full">
                            <label htmlFor="requirements">Requirements</label>

                            <textarea id="requirements"
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                rows="5"
                            />
                        </div>


                        <div className="form-group full">
                            <label htmlFor="responsibilities">Responsibilities</label>

                            <textarea id="responsibilities"
                                name="responsibilities"
                                value={formData.responsibilities}
                                onChange={handleChange}
                                rows="5"
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="status">Status</label>

                            <select id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="DRAFT">Draft</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                    </div>

                </div>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <div className="form-actions">

                    <Link
                        to="/recruiter/jobs"
                        className="secondary-button"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        className="save-button"
                        disabled={saving}
                    >
                        {saving ? "Updating..." : "Update Job"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default EditJob;
