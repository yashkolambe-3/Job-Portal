import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import recruiterService from "../services/recruiterService";
function CompanyProfile() {
    const [formData, setFormData] = useState({
        company_name: "",
        description: "",
        industry: "",
        website: "",
        location: "",
        company_size: "",
        logo_url: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [verificationStatus, setVerificationStatus] = useState("");

    const loadCompany = useCallback(async () => {
        try {
            const data = await recruiterService.getCompany();
            setVerificationStatus(data.verification_status || "PENDING");

            setFormData({
                company_name: data.company_name || "",
                description: data.description || "",
                industry: data.industry || "",
                website: data.website || "",
                location: data.location || "",
                company_size: data.company_size || "",
                logo_url: data.logo_url || ""
            });

        } catch (error) {
            // 404 simply means company has not been created yet.
            if (error.response?.status !== 404) {
                console.error("Failed to load company:", error);
                setError("Failed to load company profile");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load API data after mount; the async result populates this form.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadCompany();
    }, [loadCompany]);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const response = await recruiterService.saveCompany(formData);

            await loadCompany();

            setMessage(
                response.message || "Company profile saved successfully"
            );

        } catch (error) {
            console.error("Save company error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to save company profile"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="company-loading">
                Loading company profile...
            </div>
        );
    }

    return (
        <div className="company-page">

            <div className="company-page-header">
                <div>
                    <Link
                        to="/recruiter/dashboard"
                        className="back-link"
                    >
                        ← Dashboard
                    </Link>

                    <h1>Company Profile</h1>

                    <p>
                        Create and manage your company information.
                    </p>
                    {verificationStatus && (
                        <p className={`company-verification ${verificationStatus.toLowerCase()}`} role="status">
                            Verification status: <strong>{verificationStatus.toLowerCase()}</strong>. New or edited details may need admin review.
                        </p>
                    )}
                </div>
            </div>


            <form
                className="company-form"
                onSubmit={handleSubmit}
            >

                <div className="form-section">
                    <h2>Basic Information</h2>

                    <div className="form-grid">

                        <div className="form-group full">
                            <label htmlFor="company_name">Company Name *</label>

                            <input id="company_name"
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                placeholder="e.g. TechNova Solutions"
                                required
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="industry">Industry</label>

                            <input id="industry"
                                type="text"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                placeholder="Information Technology"
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="company_size">Company Size</label>

                            <select id="company_size"
                                name="company_size"
                                value={formData.company_size}
                                onChange={handleChange}
                            >
                                <option value="">Select size</option>
                                <option value="1-10">1-10</option>
                                <option value="11-50">11-50</option>
                                <option value="51-200">51-200</option>
                                <option value="201-500">201-500</option>
                                <option value="501-1000">501-1000</option>
                                <option value="1000+">1000+</option>
                            </select>
                        </div>


                        <div className="form-group">
                            <label htmlFor="location">Location</label>

                            <input id="location"
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Mumbai, India"
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor="website">Website</label>

                            <input id="website"
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://example.com"
                            />
                        </div>


                        <div className="form-group full">
                            <label htmlFor="logo_url">Logo URL</label>

                            <input id="logo_url"
                                type="text"
                                name="logo_url"
                                value={formData.logo_url}
                                onChange={handleChange}
                                placeholder="https://example.com/logo.png"
                            />
                        </div>


                        <div className="form-group full">
                            <label htmlFor="description">Company Description</label>

                            <textarea id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Tell candidates about your company..."
                            />
                        </div>

                    </div>
                </div>


                {message && (
                    <div className="success-message">
                        ✓ {message}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <div className="form-actions">
                    <Link
                        to="/recruiter/dashboard"
                        className="secondary-button"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        className="save-button"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Company"}
                    </button>
                </div>

            </form>

        </div>
    );
}

export default CompanyProfile;
