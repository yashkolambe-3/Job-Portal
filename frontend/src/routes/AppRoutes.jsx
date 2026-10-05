import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Link
} from "react-router-dom";

import { useAuth } from "../context/useAuth";
import AppShell from "../components/AppShell";


// ===============================
// AUTH PAGES
// ===============================

import Login from "../pages/Login";
import Register from "../pages/Register.jsx";
import AdminDashboard from "../pages/AdminDashboard";

// ===============================
// CANDIDATE PAGES
// ===============================

import CandidateDashboard from "../pages/CandidateDashboard";
import CandidateProfile from "../pages/CandidateProfile";
import ResumeManagement from "../pages/ResumeManagement";
import ResumeBuilder from "../pages/ResumeBuilder";
import RecruiterApplicants from "../pages/RecruiterApplicants";

// ===============================
// PHASE 4 - JOB PORTAL
// ===============================

import JobPortal from "../pages/JobPortal";
import JobDetails from "../pages/JobDetails";
import SavedJobs from "../pages/SavedJobs";
import MyApplications from "../pages/MyApplications";


// ===============================
// RECRUITER PAGES
// ===============================

import RecruiterDashboard from "../pages/RecruiterDashboard";
import CompanyProfile from "../pages/CompanyProfile";
import CreateJob from "../pages/CreateJob";
import RecruiterJobs from "../pages/RecruiterJobs";
import EditJob from "../pages/EditJob";
import AIDashboard from "../pages/AIDashboard";

// ===============================
// PROTECTED ROUTE
// ===============================

function ProtectedRoute({ children, role }) {

    const {
        user,
        loading,
        isAuthenticated
    } = useAuth();


    if (loading) {

        return <div className="app-loading" role="status">Loading your workspace…</div>;

    }


    if (!isAuthenticated) {
        return <Navigate to={user ? "/" : "/login"} replace />;
    }


    if (role && user?.role !== role) {

        if (user?.role === "CANDIDATE") {
            return (
                <Navigate
                    to="/candidate/dashboard"
                    replace
                />
            );
        }


        if (user?.role === "RECRUITER") {
            return (
                <Navigate
                    to="/recruiter/dashboard"
                    replace
                />
            );
        }


        return <Navigate to="/login" replace />;
    }


    return <AppShell>{children}</AppShell>;
}

function HomeRedirect() {
    const { user } = useAuth();
    const destination = {
        CANDIDATE: "/candidate/dashboard",
        RECRUITER: "/recruiter/dashboard",
        ADMIN: "/admin/dashboard"
    }[user?.role] || "/login";
    return <Navigate to={destination} replace />;
}


function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>


                {/* ===================== */}
                {/* AUTH */}
                {/* ===================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/register"
                    element={<Register />}
                />
 
                 

                {/* ===================== */}
                {/* CANDIDATE */}
                {/* ===================== */}

                <Route
                    path="/candidate/dashboard"
                    element={
                        <ProtectedRoute role="CANDIDATE">
                            <CandidateDashboard />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/candidate/resume-builder"
                    element={
                        <ProtectedRoute role="CANDIDATE">
                            <ResumeBuilder />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/candidate/profile"
                    element={
                        <ProtectedRoute role="CANDIDATE">
                            <CandidateProfile />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/candidate/resumes"
                    element={
                        <ProtectedRoute role="CANDIDATE">
                            <ResumeManagement />
                        </ProtectedRoute>
                    }
                />


                {/* ===================== */}
                {/* PHASE 4 - JOB PORTAL */}
                {/* ===================== */}

                <Route
                    path="/jobs"
                    element={
                        <ProtectedRoute role="CANDIDATE">
                            <JobPortal />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/jobs/:id"
                    element={
                        <ProtectedRoute role="CANDIDATE">
                            <JobDetails />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/saved-jobs"
                    element={
                        <ProtectedRoute role="CANDIDATE">
                            <SavedJobs />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/applications"
                    element={
                        <ProtectedRoute role="CANDIDATE">
                            <MyApplications />
                        </ProtectedRoute>
                    }
                />


                {/* ===================== */}
                {/* RECRUITER */}
                {/* ===================== */}

                <Route
                    path="/recruiter/dashboard"
                    element={
                        <ProtectedRoute role="RECRUITER">
                            <RecruiterDashboard />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/recruiter/company"
                    element={
                        <ProtectedRoute role="RECRUITER">
                            <CompanyProfile />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/recruiter/jobs"
                    element={
                        <ProtectedRoute role="RECRUITER">
                            <RecruiterJobs />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/recruiter/jobs/create"
                    element={
                        <ProtectedRoute role="RECRUITER">
                            <CreateJob />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/recruiter/jobs/edit/:id"
                    element={
                        <ProtectedRoute role="RECRUITER">
                            <EditJob />
                        </ProtectedRoute>
                    }
                />

<Route
    path="/admin/dashboard"
    element={
        <ProtectedRoute role="ADMIN">
            <AdminDashboard />
        </ProtectedRoute>
    }
/>

<Route
    path="/ai"
    element={
        <ProtectedRoute role="CANDIDATE">
            <AIDashboard />
        </ProtectedRoute>
    }
/>

                {/* ===================== */}
                {/* DEFAULT */}
                {/* ===================== */}

                <Route
                    path="/"
                    element={
                        <HomeRedirect />
                    }
                />

<Route
    path="/recruiter/jobs/:id/applicants"
    element={
        <ProtectedRoute role="RECRUITER">
            <RecruiterApplicants />
        </ProtectedRoute>
    }
/>
                <Route
                    path="*"
                    element={
                        <main className="not-found-page">
                            <p>404 · Page not found</p>
                            <h1>We can’t find that page</h1>
                            <Link to="/">Return to your workspace</Link>
                        </main>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default AppRoutes;
