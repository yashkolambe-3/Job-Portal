import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import candidateService from "../services/candidateService";
function CandidateProfile() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        phone: "",
        location: "",
        headline: "",
        summary: "",
        linkedin_url: "",
        github_url: "",
        portfolio_url: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadProfile = useCallback(async () => {

        try {

            const data = await candidateService.getProfile();

            setForm({
                phone: data.phone || "",
                location: data.location || "",
                headline: data.headline || "",
                summary: data.summary || "",
                linkedin_url: data.linkedin_url || "",
                github_url: data.github_url || "",
                portfolio_url: data.portfolio_url || ""
            });

        } catch (err) {

            if (err.response?.status !== 404) {
                console.error("Profile loading error:", err);
            }

        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load API data after mount; the async result populates this form.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadProfile();
    }, [loadProfile]);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

        setMessage("");
        setError("");
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        try {

            const data =
                await candidateService.updateProfile(form);

            setMessage(
                data.message ||
                "Candidate profile saved successfully"
            );

        } catch (err) {

            console.error("Profile save error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to save profile"
            );

        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <h2>Loading profile...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">

            <div className="profile-container">

                <div className="profile-header">

                    <h1>Candidate Profile</h1>

                    <p>
                        Build your professional profile and
                        help recruiters understand your experience.
                    </p>

                </div>


                <div className="profile-form-card">

                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* Personal Information */}
                        <div className="form-section">

                            <h2>Personal Information</h2>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label htmlFor="phone">Phone</label>

                                    <input id="phone"
                                        type="tel"
                                        name="phone"
                                        placeholder="Your phone number"
                                        value={form.phone}
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="form-group">

                                    <label htmlFor="location">Location</label>

                                    <input id="location"
                                        type="text"
                                        name="location"
                                        placeholder="City, Country"
                                        value={form.location}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </div>


                        {/* Professional Information */}
                        <div className="form-section">

                            <h2>Professional Information</h2>

                            <div className="form-grid">

                                <div className="form-group full">

                                    <label htmlFor="headline">
                                        Professional Headline
                                    </label>

                                    <input id="headline"
                                        type="text"
                                        name="headline"
                                        placeholder="e.g. Full Stack Developer"
                                        value={form.headline}
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="form-group full">

                                    <label htmlFor="summary">
                                        Professional Summary
                                    </label>

                                    <textarea id="summary"
                                        name="summary"
                                        placeholder="Tell recruiters about yourself..."
                                        value={form.summary}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </div>


                        {/* Social Links */}
                        <div className="form-section">

                            <h2>Professional Links</h2>

                            <div className="form-grid">

                                <div className="form-group full">

                                    <label htmlFor="linkedin_url">LinkedIn</label>

                                    <input id="linkedin_url"
                                        type="url"
                                        name="linkedin_url"
                                        placeholder="https://linkedin.com/in/..."
                                        value={form.linkedin_url}
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="form-group full">

                                    <label htmlFor="github_url">GitHub</label>

                                    <input id="github_url"
                                        type="url"
                                        name="github_url"
                                        placeholder="https://github.com/..."
                                        value={form.github_url}
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="form-group full">

                                    <label htmlFor="portfolio_url">Portfolio</label>

                                    <input id="portfolio_url"
                                        type="url"
                                        name="portfolio_url"
                                        placeholder="https://yourportfolio.com"
                                        value={form.portfolio_url}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="form-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    navigate("/candidate/dashboard")
                                }
                            >
                                Back to Dashboard
                            </button>

                            <button
                                type="submit"
                                className="save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Profile"}
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default CandidateProfile;
