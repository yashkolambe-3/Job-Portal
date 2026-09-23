import api from "./api";

const getResumeScore = async () => {
    const response = await api.post("/ai/resume-score");

    return response.data;
};

const getSkillSuggestions = async () => {
    const response = await api.post("/ai/skill-suggestions");

    return response.data;
};

const getJobRecommendations = async () => {
    const response = await api.get("/ai/job-recommendations");

    return response.data;
};

export default {
    getResumeScore,
    getSkillSuggestions,
    getJobRecommendations
};
