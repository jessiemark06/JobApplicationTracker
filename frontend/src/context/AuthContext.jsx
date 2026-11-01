import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [token, setToken] = useState(
        sessionStorage.getItem("token")
    );
    const [isLoading, setIsLoading] = useState(
        () => Boolean(sessionStorage.getItem("token"))
    );
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });


    useEffect(() => {
        const storedToken = sessionStorage.getItem("token");

        if (!storedToken) {
            return;
        }

        fetch(`${API_BASE_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${storedToken}`,
                Accept: "application/json",
            },
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error("Session expired");
                }

                return response.json();
            })
            .then((data) => setUser(data.user || data))
            .catch(() => {
                sessionStorage.removeItem("token");
                localStorage.removeItem("user");
                setToken(null);
                setUser(null);
            })
            .finally(() => setIsLoading(false));
    }, []);

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

        sessionStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setToken(data.token);
        setUser(data.user);
    };

    //logout
    const logout = () => {
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    //children
    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout,
                updateUser,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Keep the existing context hook API while the provider remains Fast Refresh compatible.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}