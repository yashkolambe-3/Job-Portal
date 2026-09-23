import api from "./api";


// ===============================
// GET JOBS
// Search + Filters + Pagination
// ===============================
export const getJobs = async (params = {}) => {
    const response = await api.get("/jobs", { params });

    return response.data;
};


// ===============================
// GET JOB DETAILS
// ===============================
export const getJobDetails = async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);

    return response.data;
};


// ===============================
// APPLY FOR JOB
// ===============================
export const applyForJob = async (jobId) => {
    const response = await api.post(`/applications/${jobId}/apply`);

    return response.data;
};


// ===============================
// GET MY APPLICATIONS
// ===============================
export const getMyApplications = async () => {
    const response = await api.get("/applications/my");

    return response.data;
};


// ===============================
// SAVE JOB
// ===============================
export const saveJob = async (jobId) => {
    const response = await api.post(`/saved-jobs/${jobId}`);

    return response.data;
};


// ===============================
// REMOVE SAVED JOB
// ===============================
export const removeSavedJob = async (jobId) => {
    const response = await api.delete(`/saved-jobs/${jobId}`);

    return response.data;
};


// ===============================
// GET SAVED JOBS
// ===============================
export const getSavedJobs = async () => {
    const response = await api.get("/saved-jobs");

    return response.data;
};

// ===============================
// PHASE 5 - GET JOB APPLICANTS
// ===============================
export const getJobApplicants = async (jobId) => {
    const response = await api.get(`/applications/job/${jobId}`);

    return response.data;
};


// ===============================
// PHASE 5 - UPDATE APPLICATION STATUS
// ===============================
export const updateApplicationStatus = async (
    applicationId,
    status
) => {
    const response = await api.put(`/applications/${applicationId}/status`, { status });

    return response.data;
};
