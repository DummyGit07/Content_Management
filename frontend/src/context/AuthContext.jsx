import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, fetchCurrentUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // Check token on initial load / page refresh
    useEffect(() => {
        async function initAuth() {
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                try {
                    const userData = await fetchCurrentUser(savedToken);
                    setUser(userData);
                    setToken(savedToken);
                } catch (err) {
                    console.error("Token expired or invalid:", err);
                    logout();
                }
            }
            setLoading(false);
        }
        initAuth();
    }, []);

    // Login handler
    async function login(userName, userPassword) {
        const data = await loginUser(userName, userPassword);
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);

        // Fetch user details immediately after login
        const userData = await fetchCurrentUser(data.access_token);
        setUser(userData);
    }

    // Logout handler
    function logout() {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook for consuming auth in any component
export function useAuth() {
    return useContext(AuthContext);
}