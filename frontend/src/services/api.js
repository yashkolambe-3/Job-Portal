import axios from "axios";

const baseURL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1")
    .replace(/\/+$/, "");

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && localStorage.getItem("token")) {
            localStorage.removeItem("token");
            window.dispatchEvent(new Event("careerconnect:session-expired"));
        }
        return Promise.reject(error);
    }
);

export const API_BASE_URL = baseURL;
export const API_ORIGIN = baseURL.replace(/\/api\/v1\/?$/, "");

export const getFriendlyError = (error, fallback = "Something went wrong. Please try again.") => {
    const status = error.response?.status;
    if (!status) return "Can’t reach CareerConnect right now. Check your connection and try again.";
    if (status === 401) return "Your session has expired. Please sign in again.";
    if (status === 403) return "You don’t have permission to do that.";
    if (status === 404) return error.response.data?.message || "We couldn’t find that item.";
    if (status === 409) return error.response.data?.message || "This item already exists.";
    if (status === 422) return error.response.data?.message || "Check the information and try again.";
    if (status >= 500) return "The server couldn’t complete your request. Please try again.";
    return error.response.data?.message || fallback;
};

export default api;
