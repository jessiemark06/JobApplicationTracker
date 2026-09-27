import { createContext, useContext, useState } from "react";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });


    //login
    const login = async (email, password) => {

        const response = await fetch(
            `${API_BASE_URL}/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },

                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);
    };

    //logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    //children
    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}