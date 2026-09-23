import { useEffect, useState } from "react";
import authService from "../services/authService";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const expireSession = () => {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
            setLoading(false);
        };

        window.addEventListener("careerconnect:session-expired", expireSession);
        return () => window.removeEventListener("careerconnect:session-expired", expireSession);
    }, []);

    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await authService.getCurrentUser();
                setUser(response.user);
            } catch (error) {
                console.error("Failed to load user:", error);

                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const response = await authService.login({
            email,
            password
        });

        localStorage.setItem("token", response.token);

        setToken(response.token);
        setUser(response.user);

        return response;
    };

    const register = async (userData) => {
        return await authService.register(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!token
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
