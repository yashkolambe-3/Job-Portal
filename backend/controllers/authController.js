const authService = require("../services/authService");
const emailService = require("../services/emailService");

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password and role are required"
            });
        }

        const user = await authService.register({
            name,
            email,
            password,
            role
        });

        void emailService.sendWelcomeEmail(user);

        return res.status(201).json({
            message: "Registration successful",
            user
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.message === "Email already registered") {
            return res.status(409).json({
                message: error.message
            });
        }

        if (error.message === "Invalid role" || error.message === "Admin registration is not allowed") {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.message.startsWith("Name must") || error.message.startsWith("Enter a valid email") || error.message.startsWith("Password must")) {
            return res.status(400).json({ message: error.message });
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Email already registered" });
        }

        return res.status(500).json({
            message: "Registration failed"
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const result = await authService.login({
            email,
            password
        });

        return res.status(200).json({
            message: "Login successful",
            ...result
        });

    } catch (error) {
        console.error("Login error:", error);

        if (error.message === "Invalid email or password") {
            return res.status(401).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Login failed"
        });
    }
};


module.exports = {
    register,
    login
};
