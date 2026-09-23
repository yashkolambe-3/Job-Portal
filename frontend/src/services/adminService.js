import api from "./api";


// Dashboard
const getDashboard = async () => {
    const response = await api.get("/admin/dashboard");

    return response.data;
};


// Users
const getUsers = async () => {
    const response = await api.get("/admin/users");

    return response.data;
};


const deleteUser = async (id) => {
    const response = await api.delete(`/admin/users/${id}`);

    return response.data;
};


// Recruiters
const getRecruiters = async () => {
    const response = await api.get("/admin/recruiters");

    return response.data;
};


const updateRecruiterVerification = async (
    companyId,
    status
) => {
    const response = await api.put(`/admin/recruiters/${companyId}/verification`, { status });

    return response.data;
};


// Jobs
const getJobs = async () => {
    const response = await api.get("/admin/jobs");

    return response.data;
};


const updateJobModeration = async (
    jobId,
    status
) => {
    const response = await api.put(`/admin/jobs/${jobId}/moderation`, { status });

    return response.data;
};


export default {
    getDashboard,
    getUsers,
    deleteUser,
    getRecruiters,
    updateRecruiterVerification,
    getJobs,
    updateJobModeration
};
