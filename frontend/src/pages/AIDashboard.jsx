import { useState } from "react";
import { Link } from "react-router-dom";
import aiService from "../services/aiService";
import { getFriendlyError } from "../services/api";
function AIDashboard() {

    const [scoreData, setScoreData] = useState(null);

    const [skills, setSkills] = useState([]);
    const [skillSuggestions, setSkillSuggestions] = useState([]);

    const [jobs, setJobs] = useState(null);

    const [loadingScore, setLoadingScore] = useState(false);
    const [loadingSkills, setLoadingSkills] = useState(false);
    const [loadingJobs, setLoadingJobs] = useState(false);

    const [error, setError] = useState("");

    const handleResumeScore = async () => {
        try {
            setLoadingScore(true);
            setError("");

            const data = await aiService.getResumeScore();

            setScoreData(data);

        } catch (error) {
            console.error(error);

            setError(getFriendlyError(error, "Failed to calculate your profile score."));
        } finally {
            setLoadingScore(false);
        }
    };


    const handleSkillSuggestions = async () => {
        try {
            setLoadingSkills(true);
            setError("");

            const data = await aiService.getSkillSuggestions();

            setSkills(data.currentSkills || []);
            setSkillSuggestions(data.suggestions || []);

        } catch (error) {
            console.error(error);

            setError(getFriendlyError(error, "Failed to load skill suggestions."));
        } finally {
            setLoadingSkills(false);
        }
    };


    const handleJobRecommendations = async () => {
        try {
            setLoadingJobs(true);
            setError("");

            const data = await aiService.getJobRecommendations();

            setJobs(data.recommendations || []);

        } catch (error) {
            console.error(error);

            setError(getFriendlyError(error, "Failed to find job recommendations."));
        } finally {
            setLoadingJobs(false);
        }
    };


    return (
        <div className="ai-dashboard">

            <div className="ai-header">
                <div>
                    <span className="ai-label">AI CAREER ASSISTANT</span>

                    <h1>
                        Career Intelligence
                    </h1>

                    <p>
                        Review your profile completeness, see common skills to consider,
                        and compare open roles with your saved resume.
                    </p>
                </div>
            </div>


            {error && (
                <div className="ai-error">
                    {error}
                </div>
            )}


            {/* RESUME SCORE */}

            <section className="ai-card">

                <div className="ai-card-header">
                    <div>
                        <h2>AI Resume Score</h2>

                        <p>
                            Check how complete your candidate profile is.
                        </p>
                    </div>

                    <button
                        onClick={handleResumeScore}
                        disabled={loadingScore}
                    >
                        {loadingScore
                            ? "Analyzing..."
                            : "Analyze Profile"}
                    </button>
                </div>


                {scoreData !== null && (
                    <div className="score-section">

                        <div className="score-circle">
                            <span>{scoreData.score}</span>
                            <small>/ 100</small>
                        </div>

                        <div className="score-content">

                            <h3>Profile completeness</h3>
                            <p className="ai-method">{scoreData.method}</p>

                            {scoreData.strengths?.length > 0 && (
                                <>
                                    <h4>Strengths</h4>
                                    <ul>{scoreData.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
                                </>
                            )}

                            {scoreData.skillsDetected?.length > 0 && (
                                <div className="ai-detected-skills">
                                    <strong>Skills found</strong>
                                    <div className="skill-list">
                                        {scoreData.skillsDetected.map((skill) => <span className="skill-tag current" key={skill}>{skill}</span>)}
                                    </div>
                                </div>
                            )}

                            {scoreData.suggestions?.length === 0 ? (
                                <p>
                                    Your profile is looking complete.
                                </p>
                            ) : (
                                <>
                                    <p>
                                        Suggestions to improve your profile:
                                    </p>

                                    <ul>
                                        {scoreData.suggestions?.map(
                                            (suggestion) => (
                                                <li key={suggestion}>
                                                    {suggestion}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </>
                            )}

                        </div>

                    </div>
                )}

            </section>


            {/* SKILL SUGGESTIONS */}

            <section className="ai-card">

                <div className="ai-card-header">
                    <div>
                        <h2>Skill Suggestions</h2>

                        <p>
                            Discover technical skills you can add to your profile.
                        </p>
                    </div>

                    <button
                        onClick={handleSkillSuggestions}
                        disabled={loadingSkills}
                    >
                        {loadingSkills
                            ? "Finding..."
                            : "Suggest Skills"}
                    </button>
                </div>


                {skills.length > 0 && (
                    <div className="skills-area">

                        <h3>Your Skills</h3>

                        <div className="skill-list">

                            {skills.map((skill, index) => (
                                <span
                                    className="skill-tag current"
                                    key={index}
                                >
                                    {skill}
                                </span>
                            ))}

                        </div>

                    </div>
                )}


                {skillSuggestions.length > 0 && (
                    <div className="skills-area">

                        <h3>Suggested Skills</h3>

                        <div className="skill-list">

                            {skillSuggestions.map(
                                (skill, index) => (
                                    <span
                                        className="skill-tag suggested"
                                        key={index}
                                    >
                                        {skill}
                                    </span>
                                )
                            )}

                        </div>

                    </div>
                )}

                {skillSuggestions.length > 0 && (
                    <p className="ai-method">These are common technical skills missing from the saved resume. They are suggestions to consider, not a claim that you already have these skills.</p>
                )}

            </section>


            {/* JOB RECOMMENDATIONS */}

            <section className="ai-card">

                <div className="ai-card-header">
                    <div>
                        <h2>Recommended Jobs</h2>

                        <p>
                            Jobs matched against your profile.
                        </p>
                    </div>

                    <button
                        onClick={handleJobRecommendations}
                        disabled={loadingJobs}
                    >
                        {loadingJobs
                            ? "Matching..."
                            : "Find Jobs"}
                    </button>
                </div>


                {jobs?.length > 0 && (

                    <div className="job-list">

                        {jobs.map((job) => (

                            <div
                                className="recommended-job"
                                key={job.id}
                            >

                                <div className="job-main">

                                    <h3>
                                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                                    </h3>

                                    <p>
                                        {job.company_name}
                                    </p>

                                    <div className="job-meta">

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

                                    </div>

                                </div>

                                {job.matchedSkills?.length > 0 && (
                                    <div className="recommended-skills" aria-label="Matched skills">
                                        {job.matchedSkills.map((skill) => <span key={skill}>{skill}</span>)}
                                    </div>
                                )}


                                <div className="match-score">

                                    <strong>
                                        {job.matchScore}%
                                    </strong>

                                    <span>
                                        Match
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}


                {jobs !== null && jobs.length === 0 && !loadingJobs && (
                    <div className="empty-ai">
                        No matching open jobs were returned. Complete your resume or update your profile location to improve matching.
                    </div>
                )}

                {jobs === null && !loadingJobs && (
                    <div className="empty-ai">Choose <strong>Find Jobs</strong> to compare your skills and location with active listings.</div>
                )}

            </section>

        </div>
    );
}

export default AIDashboard;
