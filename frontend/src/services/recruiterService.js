import api from "./api";


// ===============================
// COMPANY
// ===============================

const getCompany = async () => {
    const response = await api.get("/recruiter/company/profile");

    return response.data;
};


const saveCompany = async (companyData) => {
    const response = await api.put("/recruiter/company/profile", companyData);

    return response.data;
};


const deleteCompany = async () => {
    const response = await api.delete("/recruiter/company/profile");

    return response.data;
};


// ===============================
// JOBS
// ===============================

const getMyJobs = async () => {
    const response = await api.get("/recruiter/jobs");

    return response.data;
};


const getJobById = async (id) => {
    const response = await api.get(`/recruiter/jobs/${id}`);

    return response.data;
};


const createJob = async (jobData) => {
    const response = await api.post("/recruiter/jobs", jobData);

    return response.data;
};


const updateJob = async (id, jobData) => {
    const response = await api.put(`/recruiter/jobs/${id}`, jobData);

    return response.data;
};


const deleteJob = async (id) => {
    const response = await api.delete(`/recruiter/jobs/${id}`);

    return response.data;
};


export default {
    getCompany,
    saveCompany,
    deleteCompany,

    getMyJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob
};
