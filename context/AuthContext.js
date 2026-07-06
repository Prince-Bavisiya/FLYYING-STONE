"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const token = localStorage.getItem("token");
        const savedRole = localStorage.getItem("role");

        if (token) {
            setUser({ token });
            setRole(savedRole);
        }

        setLoading(false);

    }, []);

    const login = (token, role) => {

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        setUser({ token });
        setRole(role);

    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

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