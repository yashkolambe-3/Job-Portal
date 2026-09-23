import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import resumeService from "../services/resumeService";
function ResumeManagement() {

    const navigate = useNavigate();

    const [resumes, setResumes] = useState([]);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const loadResumes = useCallback(async () => {
        try {
            const data = await resumeService.getResumes();
            setResumes(data);
        } catch (error) {
            console.error("Resume loading error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load the candidate's uploaded resumes after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadResumes();
    }, [loadResumes]);

    const handleUpload = async (e) => {

        e.preventDefault();

        if (!file) {
            setMessage("Please select a resume file.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {

            const data = await resumeService.uploadResume(
                file,
                title || file.name
            );

            setMessage(
                data.message || "Resume uploaded successfully"
            );

            setTitle("");
            setFile(null);

            document.getElementById("resumeFile").value = "";

            await loadResumes();

        } catch (error) {

            console.error("Resume upload error:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to upload resume"
            );

        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {

        if (!window.confirm("Are you sure you want to delete this resume?")) {
            return;
        }

        try {

            await resumeService.deleteResume(id);

            await loadResumes();

            setMessage("Resume deleted successfully");

        } catch (error) {

            console.error("Delete resume error:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to delete resume"
            );
        }
    };

    const handleDownload = async (resume) => {
        try {
            const file = await resumeService.downloadResume(resume.id);
            const url = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = url;
            link.download = resume.file_name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to download resume");
        }
    };

    return (
        <div className="resume-page">

            <div className="resume-container">

                <div className="resume-header">

                    <div>
                        <h1>My Resumes</h1>

                        <p>
                            Upload and manage your resumes.
                        </p>
                    </div>

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/candidate/dashboard")
                        }
                    >
                        Back to Dashboard
                    </button>

                </div>


                {message && (
                    <div className="message">
                        {message}
                    </div>
                )}


                {/* Upload */}
                <div className="upload-card">

                    <h2>Upload Resume</h2>

                    <form
                        className="upload-form"
                        onSubmit={handleUpload}
                    >

                        <div className="input-group">

                            <label htmlFor="resumeTitle">Resume Title</label>

                            <input
                                id="resumeTitle"
                                type="text"
                                placeholder="Software Developer Resume"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                            />

                        </div>


                        <div className="input-group">

                            <label htmlFor="resumeFile">Select File</label>

                            <input
                                id="resumeFile"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                required
                                onChange={(e) =>
                                    setFile(e.target.files[0])
                                }
                            />

                        </div>


                        <button
                            className="upload-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Uploading..."
                                : "Upload Resume"}
                        </button>

                    </form>

                </div>


                {/* Resume List */}
                <div className="resume-list">

                    <h2>Uploaded Resumes</h2>

                    {resumes.length === 0 ? (

                        <div className="empty-resumes">

                            <p>
                                You haven't uploaded any resumes yet.
                            </p>

                        </div>

                    ) : (

                        resumes.map((resume) => (

                            <div
                                className="resume-item"
                                key={resume.id}
                            >

                                <div className="resume-info">

                                    <div className="resume-icon">
                                        📄
                                    </div>

                                    <div>

                                        <h3>
                                            {resume.title}
                                        </h3>

                                        <p>
                                            {resume.file_name}
                                        </p>

                                    </div>

                                </div>


                                <button
                                    className="delete-button"
                                    type="button"
                                    onClick={() => handleDownload(resume)}
                                >
                                    Download
                                </button>
                                <button
                                    className="delete-button"
                                    type="button"
                                    onClick={() =>
                                        handleDelete(resume.id)
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>
    );
}

export default ResumeManagement;
