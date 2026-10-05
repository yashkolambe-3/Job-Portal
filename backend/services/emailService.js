const nodemailer = require("nodemailer");

let transporter;
let configurationWarningLogged = false;

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}[character]));

const getTransporter = () => {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;
    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
        if (!configurationWarningLogged) {
            console.warn("Email notifications are disabled: configure EMAIL_HOST, EMAIL_PORT, EMAIL_USER and EMAIL_PASSWORD.");
            configurationWarningLogged = true;
        }
        return null;
    }

    if (!transporter) {
        const port = Number(EMAIL_PORT);
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            console.warn("Email notifications are disabled: EMAIL_PORT is invalid.");
            configurationWarningLogged = true;
            return null;
        }

        transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port,
            secure: process.env.EMAIL_SECURE === "true" || port === 465,
            auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD }
        });
    }

    return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
    if (!to) return false;

    try {
        const mailer = getTransporter();
        if (!mailer) return false;
        await mailer.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        });
        return true;
    } catch (error) {
        console.error("Email delivery failed:", error.code || "SMTP error");
        return false;
    }
};

const sendWelcomeEmail = ({ name, email }) => sendEmail({
    to: email,
    subject: "Welcome to CareerConnect AI",
    text: `Hello ${name || "there"},\n\nYour account is ready. Complete your profile and explore opportunities that fit your career goals.\n\nCareerConnect AI`,
    html: `<p>Hello ${escapeHtml(name || "there")},</p><p>Your account is ready. Complete your profile and explore opportunities that fit your career goals.</p><p>CareerConnect AI</p>`
});

const sendApplicationConfirmation = ({ name, email, jobTitle, companyName }) => sendEmail({
    to: email,
    subject: `Application received: ${jobTitle}`,
    text: `Hello ${name || "there"},\n\nYour application for ${jobTitle} at ${companyName} was submitted successfully.\n\nCareerConnect AI`,
    html: `<p>Hello ${escapeHtml(name || "there")},</p><p>Your application for <strong>${escapeHtml(jobTitle)}</strong> at ${escapeHtml(companyName)} was submitted successfully.</p><p>CareerConnect AI</p>`
});

const sendRecruiterNewApplication = ({ name, email, candidateName, jobTitle, companyName }) => sendEmail({
    to: email,
    subject: `New application: ${jobTitle}`,
    text: `Hello ${name || "there"},\n\n${candidateName || "A candidate"} applied for ${jobTitle} at ${companyName}. Sign in to CareerConnect AI to review the application.\n\nCareerConnect AI`,
    html: `<p>Hello ${escapeHtml(name || "there")},</p><p><strong>${escapeHtml(candidateName || "A candidate")}</strong> applied for <strong>${escapeHtml(jobTitle)}</strong> at ${escapeHtml(companyName)}.</p><p>Sign in to CareerConnect AI to review the application.</p><p>CareerConnect AI</p>`
});

const sendApplicationStatus = ({ name, email, jobTitle, status }) => sendEmail({
    to: email,
    subject: `Application update: ${jobTitle}`,
    text: `Hello ${name || "there"},\n\nYour application for ${jobTitle} is now ${status.toLowerCase()}.\n\nCareerConnect AI`,
    html: `<p>Hello ${escapeHtml(name || "there")},</p><p>Your application for <strong>${escapeHtml(jobTitle)}</strong> is now <strong>${escapeHtml(status.toLowerCase())}</strong>.</p><p>CareerConnect AI</p>`
});

const sendRecruiterVerification = ({ name, email, companyName, status }) => sendEmail({
    to: email,
    subject: `Recruiter verification ${status.toLowerCase()}`,
    text: `Hello ${name || "there"},\n\nThe verification status for ${companyName} is now ${status.toLowerCase()}.\n\nCareerConnect AI`,
    html: `<p>Hello ${escapeHtml(name || "there")},</p><p>The verification status for <strong>${escapeHtml(companyName)}</strong> is now <strong>${escapeHtml(status.toLowerCase())}</strong>.</p><p>CareerConnect AI</p>`
});

const sendJobModeration = ({ name, email, jobTitle, status }) => sendEmail({
    to: email,
    subject: `Job post ${status.toLowerCase()}: ${jobTitle}`,
    text: `Hello ${name || "there"},\n\nYour job post “${jobTitle}” is now ${status.toLowerCase()}.\n\nCareerConnect AI`,
    html: `<p>Hello ${escapeHtml(name || "there")},</p><p>Your job post <strong>${escapeHtml(jobTitle)}</strong> is now <strong>${escapeHtml(status.toLowerCase())}</strong>.</p><p>CareerConnect AI</p>`
});

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendApplicationConfirmation,
    sendRecruiterNewApplication,
    sendApplicationStatus,
    sendRecruiterVerification,
    sendJobModeration
};
