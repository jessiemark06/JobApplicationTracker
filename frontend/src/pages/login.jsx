import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
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
                setMessage(data.message || "Login failed");
                return;
            }

            localStorage.setItem("token", data.token);

            setMessage("Login successful!");

             navigate("/companies");

        } catch (error) {
            console.error(error);
            setMessage("Something went wrong.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">

            <div className="w-full max-w-md bg-white rounded-xl shadow p-8">

                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back
                </h1>

                <p className="text-gray-500 mt-2 mb-6">
                    Login to your JobTrack account.
                </p>

                <form onSubmit={handleLogin}>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Login
                    </button>

                </form>

                {message && (
                    <p className="mt-4 text-sm text-gray-600">
                        {message}
                    </p>
                )}

            </div>

        </div>
    );
}

export default Login;