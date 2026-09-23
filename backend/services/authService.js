const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const authService = {

    async register({ name, email, password, role }) {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const normalizedName = String(name || "").trim();

        if (!normalizedName || normalizedName.length > 100) {
            throw new Error("Name must be between 1 and 100 characters");
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 150) {
            throw new Error("Enter a valid email address");
        }
        if (typeof password !== "string" || password.length < 8) {
            throw new Error("Password must be at least 8 characters");
        }
        if (!["CANDIDATE", "RECRUITER"].includes(role)) {
            throw new Error(role === "ADMIN" ? "Admin registration is not allowed" : "Invalid role");
        }

        const existingUser = await User.findByEmail(normalizedEmail);

        if (existingUser) {
            throw new Error("Email already registered");
        }

        const roleId = await User.findRoleId(role);

        if (!roleId) {
            throw new Error("Invalid role");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
            roleId
        });

        return {
            id: userId,
            name: normalizedName,
            email: normalizedEmail,
            role
        };
    },


    async login({ email, password }) {
        const user = await User.findByEmail(String(email || "").trim().toLowerCase());

        if (!user) {
            throw new Error("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            throw new Error("Invalid email or password");
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }
};

module.exports = authService;
