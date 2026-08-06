"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import axios from "axios";

// Automatically send cookies with all axios requests
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const checkSession = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/auth/me?t=${Date.now()}`);
                if (res.data.success) {
                    setUser(res.data.user);
                    setRole(res.data.user.role);
                    
                    // Keep in localStorage for client-side routing & UI convenience
                    localStorage.setItem("role", res.data.user.role);
                    localStorage.setItem("name", res.data.user.name || "");
                    localStorage.setItem("email", res.data.user.email || "");
                } else {
                    setUser(null);
                    setRole("");
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    localStorage.removeItem("name");
                    localStorage.removeItem("email");
                }
            } catch (error) {
                setUser(null);
                setRole("");
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("name");
                localStorage.removeItem("email");
            } finally {
                setLoading(false);
            }
        };

        checkSession();

    }, []);

    const login = (token, role, userData) => {

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        if (userData) {
            localStorage.setItem("name", userData.name || "");
            localStorage.setItem("email", userData.email || "");
        }

        setUser(userData || { token });
        setRole(role);

    };

    const logout = async () => {

        try {
            await axios.post("http://localhost:5000/api/auth/logout");
        } catch (error) {
            console.error("Logout request failed", error);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("phone");

        sessionStorage.removeItem("bag"); // ✅ bag clear

        setUser(null);
        setRole("");

        window.location.href = "/";

    };

    return (
        <AuthContext.Provider value={{ user, role, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);