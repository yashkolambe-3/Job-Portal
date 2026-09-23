import api from "./api";

const resumeService = {

    async getResumes() {
        const response = await api.get("/resumes");

        return response.data;
    },

    // Upload resume
    async uploadResume(file, title) {

        const formData = new FormData();

        formData.append("resume", file);
        formData.append("title", title);

        const response = await api.post("/resumes", formData);

        return response.data;
    },

    // Delete resume
    async deleteResume(id) {

        const response = await api.delete(`/resumes/${id}`);

        return response.data;
    },

    // Get resume builder
    async getBuilderResume() {

        const response = await api.get("/resumes/builder");

        return response.data;
    },

    // Save resume builder
    async saveBuilderResume(data) {

        const response = await api.post("/resumes/builder", data);

        return response.data;
    },

    async downloadResume(id) {
        const response = await api.get(`/resumes/${id}/download`, { responseType: "blob" });
        return response.data;
    }
};

export default resumeService;
