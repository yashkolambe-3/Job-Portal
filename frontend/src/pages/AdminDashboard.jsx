import { useCallback, useEffect, useState } from "react";
import adminService from "../services/adminService";
function AdminDashboard() {

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [recruiters, setRecruiters] = useState([]);
    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");


    const loadData = useCallback(async () => {
        try {
            const [
                dashboardData,
                usersData,
                recruitersData,
                jobsData
            ] = await Promise.all([
                adminService.getDashboard(),
                adminService.getUsers(),
                adminService.getRecruiters(),
                adminService.getJobs()
            ]);

            setStats(dashboardData);
            setUsers(usersData);
            setRecruiters(recruitersData);
            setJobs(jobsData);
            setError("");

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load admin dashboard"
            );
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        // Load API data after mount; the async result populates this page.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadData();
    }, [loadData]);


    const handleDeleteUser = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) return;

        try {
            await adminService.deleteUser(id);

            setMessage("User deleted successfully");

            setLoading(true);
            void loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete user"
            );
        }
    };


    const handleRecruiterStatus = async (
        companyId,
        status
    ) => {

        try {
            await adminService.updateRecruiterVerification(
                companyId,
                status
            );

            setMessage(
                `Recruiter ${status.toLowerCase()} successfully`
            );

            setLoading(true);
            void loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update recruiter"
            );
        }
    };


    const handleJobStatus = async (
        jobId,
        status
    ) => {

        try {
            await adminService.updateJobModeration(
                jobId,
                status
            );

            setMessage(
                `Job ${status.toLowerCase()} successfully`
            );

            setLoading(true);
            void loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update job"
            );
        }
    };


    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    Loading admin dashboard...
                </div>
            </div>
        );
    }


    return (
        <div className="admin-page">

            <div className="admin-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>
                        Manage users, recruiters and jobs.
                    </p>
                </div>
            </div>


            {error && (
                <div className="admin-alert error">
                    {error}
                </div>
            )}


            {message && (
                <div className="admin-alert success">
                    {message}
                </div>
            )}


            {/* =========================================
                STATISTICS
            ========================================= */}

            {stats && (
                <div className="admin-stats">

                    <div className="admin-stat-card">
                        <span>Total Users</span>
                        <strong>
                            {stats.totalUsers}
                        </strong>
                    </div>

                    <div className="admin-stat-card">
                        <span>Recruiters</span>
                        <strong>
                            {stats.totalRecruiters}
                        </strong>
                    </div>

                    <div className="admin-stat-card">
                        <span>Total Jobs</span>
                        <strong>
                            {stats.totalJobs}
                        </strong>
                    </div>

                    <div className="admin-stat-card">
                        <span>Applications</span>
                        <strong>
                            {stats.totalApplications}
                        </strong>
                    </div>

                    <div className="admin-stat-card warning">
                        <span>Pending Recruiters</span>
                        <strong>
                            {stats.pendingRecruiters}
                        </strong>
                    </div>

                    <div className="admin-stat-card warning">
                        <span>Pending Jobs</span>
                        <strong>
                            {stats.pendingJobs}
                        </strong>
                    </div>

                </div>
            )}


            {/* =========================================
                USER MANAGEMENT
            ========================================= */}

            <section className="admin-section">

                <div className="section-heading">
                    <div>
                        <h2>User Management</h2>
                        <p>Manage registered users.</p>
                    </div>
                </div>

                <div className="admin-table-wrapper">

                    <table className="admin-table">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {users.map((user) => (
                                <tr key={user.id}>

                                    <td>{user.id}</td>

                                    <td>{user.name}</td>

                                    <td>{user.email}</td>

                                    <td>
                                        <span className="role-badge">
                                            {user.role}
                                        </span>
                                    </td>

                                    <td>

                                        {user.role !== "ADMIN" && (
                                            <button
                                                className="danger-btn"
                                                onClick={() =>
                                                    handleDeleteUser(user.id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        )}

                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =========================================
                RECRUITER VERIFICATION
            ========================================= */}

            <section className="admin-section">

                <div className="section-heading">
                    <div>
                        <h2>Recruiter Verification</h2>
                        <p>
                            Verify recruiters before allowing
                            them to operate.
                        </p>
                    </div>
                </div>


                <div className="admin-table-wrapper">

                    <table className="admin-table">

                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Recruiter</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {recruiters.map((recruiter) => (

                                <tr key={recruiter.company_id}>

                                    <td>
                                        {recruiter.company_name}
                                    </td>

                                    <td>
                                        {recruiter.name}
                                    </td>

                                    <td>
                                        {recruiter.email}
                                    </td>

                                    <td>
                                        <span
                                            className={`status-badge ${recruiter.verification_status.toLowerCase()}`}
                                        >
                                            {recruiter.verification_status}
                                        </span>
                                    </td>

                                    <td className="action-group">

                                        <button
                                            className="success-btn"
                                            onClick={() =>
                                                handleRecruiterStatus(
                                                    recruiter.company_id,
                                                    "VERIFIED"
                                                )
                                            }
                                        >
                                            Verify
                                        </button>

                                        <button
                                            className="danger-btn"
                                            onClick={() =>
                                                handleRecruiterStatus(
                                                    recruiter.company_id,
                                                    "REJECTED"
                                                )
                                            }
                                        >
                                            Reject
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =========================================
                JOB MODERATION
            ========================================= */}

            <section className="admin-section">

                <div className="section-heading">
                    <div>
                        <h2>Job Moderation</h2>
                        <p>
                            Review and moderate recruiter job posts.
                        </p>
                    </div>
                </div>


                <div className="admin-table-wrapper">

                    <table className="admin-table">

                        <thead>
                            <tr>
                                <th>Job</th>
                                <th>Company</th>
                                <th>Recruiter</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {jobs.map((job) => (

                                <tr key={job.id}>

                                    <td>
                                        {job.title}
                                    </td>

                                    <td>
                                        {job.company_name || "—"}
                                    </td>

                                    <td>
                                        {job.recruiter_name || "—"}
                                    </td>

                                    <td>
                                        <span
                                            className={`status-badge ${job.moderation_status.toLowerCase()}`}
                                        >
                                            {job.moderation_status}
                                        </span>
                                    </td>

                                    <td className="action-group">

                                        <button
                                            className="success-btn"
                                            onClick={() =>
                                                handleJobStatus(
                                                    job.id,
                                                    "APPROVED"
                                                )
                                            }
                                        >
                                            Approve
                                        </button>

                                        <button
                                            className="danger-btn"
                                            onClick={() =>
                                                handleJobStatus(
                                                    job.id,
                                                    "REJECTED"
                                                )
                                            }
                                        >
                                            Reject
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </section>

        </div>
    );
}

export default AdminDashboard;
