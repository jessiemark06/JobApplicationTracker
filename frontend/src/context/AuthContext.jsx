import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );


    //login
    const login = async (email, password) => {

        const response = await fetch(
            "http://127.0.0.1:8000/api/login",
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

        setToken(data.token);
    };

    //logout
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    //children
    return (
        <AuthContext.Provider
            value={{
                token,
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