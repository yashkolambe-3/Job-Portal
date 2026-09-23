import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import resumeService from "../services/resumeService";
function ResumeBuilder() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        email: "",
        location: "",
        headline: "",
        summary: "",
        skills: "",
        education: "",
        experience: "",
        projects: "",
        certifications: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const loadResume = useCallback(async () => {
        try {
            const data = await resumeService.getBuilderResume();

            if (data) {
                setForm({
                    full_name: data.full_name || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    location: data.location || "",
                    headline: data.headline || "",
                    summary: data.summary || "",
                    skills: data.skills || "",
                    education: data.education || "",
                    experience: data.experience || "",
                    projects: data.projects || "",
                    certifications: data.certifications || ""
                });
            }
        } catch (error) {
            console.error("Resume loading error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load the saved resume into the builder form after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadResume();
    }, [loadResume]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        setSaving(true);
        setMessage("");

        try {
            const data = await resumeService.saveBuilderResume(form);

            setMessage(
                data.message || "Resume saved successfully"
            );
        } catch (error) {
            console.error("Resume save error:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to save resume"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <h2>Loading Resume Builder...</h2>;
    }

    return (
        <div className="builder-page">

            <div className="builder-container">

                {/* HEADER */}
                <div className="builder-header">

                    <div>
                        <h1>Resume Builder</h1>
                        <p>
                            Create a professional resume.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/candidate/dashboard")
                        }
                    >
                        Dashboard
                    </button>

                </div>


                {/* MESSAGE */}
                {message && (
                    <div className="builder-message">
                        {message}
                    </div>
                )}


                {/* RESUME FORM */}
                <form onSubmit={handleSave}>

                    {/* PERSONAL INFORMATION */}
                    <section className="builder-card">

                        <h2>Personal Information</h2>

                        <div className="builder-grid">

                            <input
                                name="full_name"
                                aria-label="Full name"
                                placeholder="Full Name"
                                value={form.full_name}
                                onChange={handleChange}
                            />

                            <input
                                name="email"
                                aria-label="Email"
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                            />

                            <input
                                name="phone"
                                aria-label="Phone"
                                placeholder="Phone"
                                value={form.phone}
                                onChange={handleChange}
                            />

                            <input
                                name="location"
                                aria-label="Location"
                                placeholder="Location"
                                value={form.location}
                                onChange={handleChange}
                            />

                            <input
                                className="full"
                                name="headline"
                                aria-label="Professional headline"
                                placeholder="Professional Headline"
                                value={form.headline}
                                onChange={handleChange}
                            />

                        </div>

                    </section>


                    {/* SUMMARY */}
                    <section className="builder-card">

                        <h2>Professional Summary</h2>

                        <textarea
                            name="summary"
                            aria-label="Professional summary"
                            placeholder="Write your professional summary..."
                            value={form.summary}
                            onChange={handleChange}
                        />

                    </section>


                    {/* SKILLS */}
                    <section className="builder-card">

                        <h2>Skills</h2>

                        <textarea
                            name="skills"
                            aria-label="Skills"
                            placeholder="JavaScript, React, Node.js, MySQL..."
                            value={form.skills}
                            onChange={handleChange}
                        />

                    </section>


                    {/* EDUCATION */}
                    <section className="builder-card">

                        <h2>Education</h2>

                        <textarea
                            name="education"
                            aria-label="Education"
                            placeholder="Degree, College, Year..."
                            value={form.education}
                            onChange={handleChange}
                        />

                    </section>


                    {/* EXPERIENCE */}
                    <section className="builder-card">

                        <h2>Experience</h2>

                        <textarea
                            name="experience"
                            aria-label="Experience"
                            placeholder="Company, Role, Duration, Responsibilities..."
                            value={form.experience}
                            onChange={handleChange}
                        />

                    </section>


                    {/* PROJECTS */}
                    <section className="builder-card">

                        <h2>Projects</h2>

                        <textarea
                            name="projects"
                            aria-label="Projects"
                            placeholder="Project name, technologies, description..."
                            value={form.projects}
                            onChange={handleChange}
                        />

                    </section>


                    {/* CERTIFICATIONS */}
                    <section className="builder-card">

                        <h2>Certifications</h2>

                        <textarea
                            name="certifications"
                            aria-label="Certifications"
                            placeholder="Certification name, organization, year..."
                            value={form.certifications}
                            onChange={handleChange}
                        />

                    </section>


                    {/* ACTIONS */}
                    <div className="builder-actions">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/candidate/dashboard")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Resume"}
                        </button>

                    </div>

                </form>


                {/* RESUME PREVIEW */}
                {form.full_name && (
                    <div className="resume-preview">

                        <div className="preview-actions">

                            <button
                                type="button"
                                onClick={() => window.print()}
                            >
                                Download / Print PDF
                            </button>

                        </div>


                        <div className="resume-paper">

                            {/* NAME */}
                            <h1>
                                {form.full_name}
                            </h1>


                            {/* CONTACT */}
                            <p className="resume-contact">

                                {form.email}

                                {form.phone &&
                                    ` | ${form.phone}`}

                                {form.location &&
                                    ` | ${form.location}`}

                            </p>


                            {/* HEADLINE */}
                            {form.headline && (
                                <h2>
                                    {form.headline}
                                </h2>
                            )}


                            {/* SUMMARY */}
                            {form.summary && (
                                <section>

                                    <h3>
                                        Professional Summary
                                    </h3>

                                    <p>
                                        {form.summary}
                                    </p>

                                </section>
                            )}


                            {/* SKILLS */}
                            {form.skills && (
                                <section>

                                    <h3>
                                        Skills
                                    </h3>

                                    <p>
                                        {form.skills}
                                    </p>

                                </section>
                            )}


                            {/* EDUCATION */}
                            {form.education && (
                                <section>

                                    <h3>
                                        Education
                                    </h3>

                                    <p>
                                        {form.education}
                                    </p>

                                </section>
                            )}


                            {/* EXPERIENCE */}
                            {form.experience && (
                                <section>

                                    <h3>
                                        Experience
                                    </h3>

                                    <p>
                                        {form.experience}
                                    </p>

                                </section>
                            )}


                            {/* PROJECTS */}
                            {form.projects && (
                                <section>

                                    <h3>
                                        Projects
                                    </h3>

                                    <p>
                                        {form.projects}
                                    </p>

                                </section>
                            )}


                            {/* CERTIFICATIONS */}
                            {form.certifications && (
                                <section>

                                    <h3>
                                        Certifications
                                    </h3>

                                    <p>
                                        {form.certifications}
                                    </p>

                                </section>
                            )}

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

export default ResumeBuilder;
