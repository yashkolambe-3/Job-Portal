import api from "./api";

const candidateService = {

    getProfile: async () => {
        const response = await api.get("/candidate/profile");

        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put("/candidate/profile", profileData);

        return response.data;
    },

    getDashboard: async () => {
        const response = await api.get("/candidate/dashboard");

        return response.data;
    }
};

export default candidateService;
