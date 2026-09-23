# CareerConnect AI

CareerConnect AI is a React and Express job portal backed by MySQL. Candidates can manage profiles and resumes, search and save jobs, and track applications. Recruiters can maintain a company profile, post jobs, and review applicants. Admins can manage users, recruiter verification, and job moderation.

## Features

- JWT sign-in and registration for candidates and recruiters, with role protected routes.
- Candidate profiles, a resume builder, and PDF/DOC/DOCX resume uploads.
- Job search, filters, pagination, saved jobs, and applications.
- Recruiter company and job management with applicant status updates.
- Admin user management, recruiter verification, and job moderation.
- Career tools for profile completeness scoring, common skill suggestions, and job matching.
- Optional SMTP email for welcome, application, status, verification, and moderation events.
- Responsive cream, red, and white UI. Tailwind CSS powers the shared shell and authentication screens; existing page styles are consolidated in one stylesheet.

## Tech stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS.
- Backend: Node.js, Express, MySQL 8, JWT, bcryptjs, Nodemailer.
- Database driver: mysql2.

## Project structure

```text
backend/
  config/          MySQL connection pool
  controllers/     REST endpoint handlers
  database/        MySQL schema
  middleware/      JWT, roles, and resume upload validation
  models/          User, company, and job data access
  routes/          Versioned API routes
  services/        Authentication and email services
  server.js        Express application and start point
frontend/
  src/components/  Shared application shell
  src/context/     Authentication state
  src/pages/       Candidate, recruiter, and admin screens
  src/services/    API clients
  src/styles/      Consolidated page component styles
```

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 8 requirement).
- MySQL 8.0+.

## Database setup

1. Create a MySQL database named `careerconnect_ai` (or choose another name for `DB_NAME`).
2. Apply [`backend/database/schema.sql`](backend/database/schema.sql). It creates the tables and the `CANDIDATE`, `RECRUITER`, and `ADMIN` role records without inserting user data.
3. The schema uses MySQL 8's `utf8mb4_0900_ai_ci` collation.

Admin registration is intentionally disabled in the public registration endpoint. Provision admin access through a trusted database administrator using a password hashed with `bcryptjs`.

## Environment variables

Copy `backend/.env.example` to `backend/.env` and set the database connection and a unique, long `JWT_SECRET`.

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port; defaults to `5000`. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection. |
| `JWT_SECRET` | Signs and verifies access tokens. Keep it private and change the example value. |
| `CORS_ORIGIN` | Comma separated frontend origins allowed by the API. Leave blank for local development; set exact origins in production. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` | Optional SMTP server settings. |
| `EMAIL_FROM` | Optional sender address; defaults to `EMAIL_USER`. |
| `EMAIL_SECURE` | Set `true` for implicit TLS; port `465` is also treated as secure. |

If SMTP settings are blank, email delivery is disabled. If an SMTP server rejects a message, the main API action still succeeds and the delivery failure is logged. Email is sent for account welcome, application submitted (to both candidate and recruiter), application status, recruiter verification, and job moderation events.

Copy `frontend/.env.example` to `frontend/.env` only when the API address differs from the default. `VITE_API_BASE_URL` must include the `/api/v1` prefix. Vite variables are public, so never place secrets there.

## Run the backend

```bash
cd backend
npm install
npm run dev
```

For production, run `npm start` after setting production environment variables.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Build and preview the frontend with `npm run build` and `npm run preview`.

## Verify the project

From `frontend/`, run `npm run lint` and `npm run build`. From `backend/`, run `npm run test:smoke` to exercise the API against a temporary MySQL database. The configured MySQL account needs permission to create and drop databases for that smoke test.

## API overview

All application endpoints use the `/api/v1` prefix:

- `/auth` — register and sign in; `/auth/me` returns the current authenticated user.
- `/candidate` — candidate profile and dashboard.
- `/resumes` — resume builder data and protected uploads/downloads.
- `/jobs` — candidate job browse, filter, pagination, and details.
- `/applications` — apply, view candidate applications, recruiter applicants, and statuses.
- `/saved-jobs` — save, list, and remove saved jobs.
- `/recruiter/company` and `/recruiter/jobs` — recruiter workspace.
- `/admin` — user management, verification, moderation, and dashboard.
- `/ai` — candidate score, skill suggestions, and job recommendations.
- `/health` — service health; `/api/v1/test-db` checks MySQL connectivity.

Protected routes require `Authorization: Bearer <token>`. The frontend Axios client reads the token from browser storage and attaches it to API requests.

## AI features

The current AI dashboard uses the existing deterministic implementation: the resume score checks profile completeness, skill suggestions come from a built in skills list, and job recommendations compare profile skills and location with approved jobs. It does not call a language model or parse uploaded resume contents, so no AI API key is required.

## Deployment preparation

- Set `CORS_ORIGIN` to the deployed frontend origin(s).
- Set `VITE_API_BASE_URL` to the deployed API's `/api/v1` URL before building the frontend.
- Configure database, JWT, and SMTP variables in the deployment environment. Do not deploy `.env` files.
- Build the frontend with `npm run build`; start the backend with `npm start`.

This repository is prepared for deployment but has not been deployed.
