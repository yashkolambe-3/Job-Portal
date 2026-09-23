const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const databaseName = `careerconnect_ai_test_${Date.now().toString(36)}`;
const checks = [];
let databaseCreated = false;
let pool;
let server;
let uploadedFilePath;

function check(name, condition) {
    assert.ok(condition, name);
    checks.push(name);
}

async function expectStatus(name, response, expectedStatus) {
    assert.equal(response.status, expectedStatus, `${name}: expected ${expectedStatus}, received ${response.status}`);
    checks.push(name);
    return response.data;
}

async function request(baseUrl, route, { method = "GET", token, body, form } = {}) {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const response = await fetch(`${baseUrl}${route}`, {
        method,
        headers,
        body: form || (body === undefined ? undefined : JSON.stringify(body))
    });
    const isJson = response.headers.get("content-type")?.includes("application/json");
    return {
        status: response.status,
        data: isJson ? await response.json() : Buffer.from(await response.arrayBuffer()),
        headers: response.headers
    };
}

async function run() {
    const adminConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    try {
        await adminConnection.query(`CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
        databaseCreated = true;
        await adminConnection.changeUser({ database: databaseName });

        const schema = fs.readFileSync(path.join(__dirname, "database", "schema.sql"), "utf8");
        for (const statement of schema.split(";").map((item) => item.trim()).filter(Boolean)) {
            await adminConnection.query(statement);
        }
    } finally {
        await adminConnection.end();
    }

    process.env.DB_NAME = databaseName;
    pool = require("./config/db");
    const app = require("./server");
    server = app.listen(0);
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });

    const baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
    const suffix = Date.now().toString(36);
    const candidateEmail = `candidate-${suffix}@example.test`;
    const recruiterEmail = `recruiter-${suffix}@example.test`;
    const adminEmail = `admin-${suffix}@example.test`;
    const candidatePassword = "temporary-candidate-472!";
    const recruiterPassword = "temporary-recruiter-583!";
    const adminPassword = "temporary-admin-694!";

    await expectStatus("backend root health", await request(baseUrl.replace(/\/api\/v1$/, ""), "/health"), 200);
    await expectStatus("database connectivity", await request(baseUrl, "/test-db"), 200);
    await expectStatus("unknown API route returns 404", await request(baseUrl, "/no-such-route"), 404);
    await expectStatus("protected API rejects missing token", await request(baseUrl, "/auth/me"), 401);

    await expectStatus("public admin registration blocked", await request(baseUrl, "/auth/register", {
        method: "POST", body: { name: "Test Admin", email: adminEmail, password: adminPassword, role: "ADMIN" }
    }), 400);
    await expectStatus("weak password rejected", await request(baseUrl, "/auth/register", {
        method: "POST", body: { name: "Short Password", email: `weak-${suffix}@example.test`, password: "short", role: "CANDIDATE" }
    }), 400);

    const candidate = await expectStatus("candidate registration", await request(baseUrl, "/auth/register", {
        method: "POST", body: { name: "Smoke Test Candidate", email: candidateEmail, password: candidatePassword, role: "CANDIDATE" }
    }), 201);
    check("registration response excludes password", !("password" in candidate.user));
    await expectStatus("duplicate email rejected", await request(baseUrl, "/auth/register", {
        method: "POST", body: { name: "Duplicate", email: candidateEmail, password: candidatePassword, role: "CANDIDATE" }
    }), 409);
    await expectStatus("invalid credentials rejected", await request(baseUrl, "/auth/login", {
        method: "POST", body: { email: candidateEmail, password: "wrong-password" }
    }), 401);

    const candidateLogin = await expectStatus("candidate login", await request(baseUrl, "/auth/login", {
        method: "POST", body: { email: candidateEmail, password: candidatePassword }
    }), 200);
    const candidateToken = candidateLogin.token;
    const currentCandidate = (await request(baseUrl, "/auth/me", { token: candidateToken })).data.user;
    check("candidate JWT resolves current user", currentCandidate.role === "CANDIDATE");
    check("candidate JWT preserves account name after refresh", currentCandidate.name === "Smoke Test Candidate");
    await expectStatus("candidate is blocked from recruiter routes", await request(baseUrl, "/recruiter/jobs", { token: candidateToken }), 403);
    await expectStatus("candidate profile starts empty", await request(baseUrl, "/candidate/profile", { token: candidateToken }), 404);
    await expectStatus("candidate profile saves", await request(baseUrl, "/candidate/profile", {
        method: "PUT", token: candidateToken, body: {
            phone: "555-0100", location: "Pune", headline: "Full Stack Engineer", summary: "Test profile",
            linkedin_url: "", github_url: "", portfolio_url: ""
        }
    }), 200);
    const candidateDashboard = await expectStatus("candidate dashboard loads", await request(baseUrl, "/candidate/dashboard", { token: candidateToken }), 200);
    check("candidate dashboard returns real application count", candidateDashboard.applicationCount === 0);

    await expectStatus("resume builder saves", await request(baseUrl, "/resumes/builder", {
        method: "POST", token: candidateToken, body: {
            full_name: "Smoke Test Candidate", phone: "555-0100", email: candidateEmail, location: "Pune",
            headline: "Full Stack Engineer", summary: "Test resume", skills: "React, Node.js, JavaScript, SQL, Git",
            education: "BSc", experience: "3 years", projects: "Portal", certifications: ""
        }
    }), 200);
    const builderResume = await expectStatus("resume builder returns saved data", await request(baseUrl, "/resumes/builder", { token: candidateToken }), 200);
    check("resume builder preserves skills", builderResume.skills.includes("React"));
    const score = await expectStatus("profile score endpoint", await request(baseUrl, "/ai/resume-score", { method: "POST", token: candidateToken, body: {} }), 200);
    check("resume score is derived from completed profile", score.score === 100 && score.method.includes("Rule-based"));
    const skills = await expectStatus("skill suggestions endpoint", await request(baseUrl, "/ai/skill-suggestions", { method: "POST", token: candidateToken, body: {} }), 200);
    check("skill suggestions include current resume skills", skills.currentSkills.includes("react"));

    const uploadForm = new FormData();
    uploadForm.append("resume", new Blob(["%PDF-1.4\n%%EOF"], { type: "application/pdf" }), "smoke-test.pdf");
    uploadForm.append("title", "Smoke test resume");
    const uploaded = await expectStatus("PDF resume upload", await request(baseUrl, "/resumes", { method: "POST", token: candidateToken, form: uploadForm }), 201);
    const [uploadedRows] = await pool.query("SELECT file_path FROM resumes WHERE id = ?", [uploaded.id]);
    uploadedFilePath = uploadedRows[0]?.file_path ? path.join(__dirname, uploadedRows[0].file_path.replace(/^\//, "")) : null;
    const downloaded = await expectStatus("private resume download", await request(baseUrl, `/resumes/${uploaded.id}/download`, { token: candidateToken }), 200);
    check("download returns file bytes", downloaded.length > 5);
    await expectStatus("uploaded resume deletion", await request(baseUrl, `/resumes/${uploaded.id}`, { method: "DELETE", token: candidateToken }), 200);
    uploadedFilePath = null;
    const invalidForm = new FormData();
    invalidForm.append("resume", new Blob(["bad"], { type: "text/plain" }), "notes.txt");
    await expectStatus("unsupported resume type rejected", await request(baseUrl, "/resumes", { method: "POST", token: candidateToken, form: invalidForm }), 400);

    const recruiter = await expectStatus("recruiter registration", await request(baseUrl, "/auth/register", {
        method: "POST", body: { name: "Smoke Test Recruiter", email: recruiterEmail, password: recruiterPassword, role: "RECRUITER" }
    }), 201);
    const recruiterLogin = await expectStatus("recruiter login", await request(baseUrl, "/auth/login", {
        method: "POST", body: { email: recruiterEmail, password: recruiterPassword }
    }), 200);
    const recruiterToken = recruiterLogin.token;
    await expectStatus("company profile starts empty", await request(baseUrl, "/recruiter/company/profile", { token: recruiterToken }), 404);
    await expectStatus("company profile saves", await request(baseUrl, "/recruiter/company/profile", {
        method: "PUT", token: recruiterToken, body: {
            company_name: "Smoke Test Studio", description: "Test company", industry: "Technology",
            website: "https://example.test", location: "Pune", company_size: "1-10", logo_url: ""
        }
    }), 201);
    const company = await expectStatus("company profile loads", await request(baseUrl, "/recruiter/company/profile", { token: recruiterToken }), 200);
    const newJob = await expectStatus("recruiter creates job", await request(baseUrl, "/recruiter/jobs", {
        method: "POST", token: recruiterToken, body: {
            company_id: company.id, title: "Backend Engineer", description: "Build reliable services",
            requirements: "Node.js and SQL", responsibilities: "Build APIs", location: "Pune",
            job_type: "FULL_TIME", experience_required: "2-4 years", salary_min: 1200000,
            salary_max: 1800000, skills: "React, Node.js, SQL", vacancy: 1, status: "ACTIVE"
        }
    }), 201);
    const jobId = newJob.jobId;

    const [adminRole] = await pool.query("SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1");
    const [adminInsert] = await pool.execute("INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)", [
        "Smoke Test Admin", adminEmail, await bcrypt.hash(adminPassword, 10), adminRole[0].id
    ]);
    check("test admin provisioned in isolated database", adminInsert.insertId > 0);
    const adminLogin = await expectStatus("admin login", await request(baseUrl, "/auth/login", {
        method: "POST", body: { email: adminEmail, password: adminPassword }
    }), 200);
    const adminToken = adminLogin.token;
    await expectStatus("candidate is blocked from admin routes", await request(baseUrl, "/admin/dashboard", { token: candidateToken }), 403);
    await expectStatus("admin dashboard loads", await request(baseUrl, "/admin/dashboard", { token: adminToken }), 200);
    const adminUsers = await expectStatus("admin user list loads", await request(baseUrl, "/admin/users", { token: adminToken }), 200);
    check("admin responses omit password hashes", adminUsers.every((user) => !("password" in user)));
    const recruiters = await expectStatus("admin recruiter list loads", await request(baseUrl, "/admin/recruiters", { token: adminToken }), 200);
    const testCompany = recruiters.find((item) => item.recruiter_id === recruiter.user.id);
    check("admin recruiter list includes the test company", Boolean(testCompany));
    await expectStatus("admin verifies recruiter", await request(baseUrl, `/admin/recruiters/${testCompany.company_id}/verification`, {
        method: "PUT", token: adminToken, body: { status: "VERIFIED" }
    }), 200);
    await expectStatus("admin rejects invalid verification status", await request(baseUrl, `/admin/recruiters/${testCompany.company_id}/verification`, {
        method: "PUT", token: adminToken, body: { status: "UNKNOWN" }
    }), 400);
    await expectStatus("admin approves job moderation", await request(baseUrl, `/admin/jobs/${jobId}/moderation`, {
        method: "PUT", token: adminToken, body: { status: "APPROVED" }
    }), 200);
    await expectStatus("admin job moderation list loads", await request(baseUrl, "/admin/jobs", { token: adminToken }), 200);

    const jobSearch = await expectStatus("candidate job search and filters", await request(baseUrl, "/jobs?search=Backend+Engineer&location=Pune&job_type=FULL_TIME&page=1&limit=5", { token: candidateToken }), 200);
    check("only the matching approved job is returned", jobSearch.jobs.length === 1 && jobSearch.jobs[0].id === jobId);
    await expectStatus("candidate job details load", await request(baseUrl, `/jobs/${jobId}`, { token: candidateToken }), 200);
    await expectStatus("candidate saves job", await request(baseUrl, `/saved-jobs/${jobId}`, { method: "POST", token: candidateToken }), 201);
    await expectStatus("duplicate saved job rejected", await request(baseUrl, `/saved-jobs/${jobId}`, { method: "POST", token: candidateToken }), 409);
    const savedJobs = await expectStatus("saved jobs list loads", await request(baseUrl, "/saved-jobs", { token: candidateToken }), 200);
    check("saved job list contains the selected job", savedJobs.length === 1 && savedJobs[0].job_id === jobId);
    await expectStatus("candidate submits application", await request(baseUrl, `/applications/${jobId}/apply`, { method: "POST", token: candidateToken }), 201);
    await expectStatus("duplicate application rejected", await request(baseUrl, `/applications/${jobId}/apply`, { method: "POST", token: candidateToken }), 409);
    const applications = await expectStatus("candidate application list loads", await request(baseUrl, "/applications/my", { token: candidateToken }), 200);
    check("candidate application starts in APPLIED status", applications.length === 1 && applications[0].status === "APPLIED");
    const applicants = await expectStatus("recruiter applicant tracking loads", await request(baseUrl, `/applications/job/${jobId}`, { token: recruiterToken }), 200);
    check("recruiter sees the candidate application", applicants.applicants.length === 1);
    await expectStatus("invalid application status rejected", await request(baseUrl, `/applications/${applicants.applicants[0].application_id}/status`, {
        method: "PUT", token: recruiterToken, body: { status: "ACCEPTED" }
    }), 400);
    await expectStatus("recruiter shortlists application", await request(baseUrl, `/applications/${applicants.applicants[0].application_id}/status`, {
        method: "PUT", token: recruiterToken, body: { status: "SHORTLISTED" }
    }), 200);
    const updatedApplications = await expectStatus("candidate sees application status change", await request(baseUrl, "/applications/my", { token: candidateToken }), 200);
    check("application status change is persisted", updatedApplications[0].status === "SHORTLISTED");
    await expectStatus("recruiter job list and applicant counts load", await request(baseUrl, "/recruiter/jobs", { token: recruiterToken }), 200);
    const recommendations = await expectStatus("AI job recommendations load", await request(baseUrl, "/ai/job-recommendations", { token: candidateToken }), 200);
    check("recommendations include a matched job", recommendations.recommendations.some((job) => job.id === jobId && job.matchScore > 0));
    await expectStatus("job with applications cannot be deleted", await request(baseUrl, `/recruiter/jobs/${jobId}`, { method: "DELETE", token: recruiterToken }), 409);
    check("job remains after blocked delete", (await pool.query("SELECT id FROM jobs WHERE id = ?", [jobId]))[0].length === 1);

    console.log(`API smoke checks passed: ${checks.length}`);
    for (const name of checks) console.log(`PASS ${name}`);
}

run()
    .catch((error) => {
        console.error("API smoke test failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (uploadedFilePath) await fs.promises.unlink(uploadedFilePath).catch(() => {});
        if (server) await new Promise((resolve) => server.close(resolve));
        if (pool) await pool.end().catch(() => {});
        if (databaseCreated) {
            const cleanup = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT) || 3306,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            });
            await cleanup.query(`DROP DATABASE \`${databaseName}\``).catch((error) => {
                console.error("Test database cleanup failed:", error.code || error.message);
                process.exitCode = 1;
            });
            await cleanup.end();
        }
    });
