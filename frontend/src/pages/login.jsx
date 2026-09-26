 
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            await login(email, password);

            setMessage("Login successful!");

            navigate("/dashboard");
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Back to Home */}
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900 cursor-pointer"
                >
                    <span className="text-lg">←</span>
                    Back 
                </button>

                {/* Login Card */}
                <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">

                    {/* Header */}
                    <div className="mb-6">
                        <p className="text-sm font-semibold text-blue-600 mb-2">
                            JobTrack
                        </p>

                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Login to your JobTrack account.
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin}>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 cursor-pointer"
                        >
                            Login
                        </button>

                    </form>

                    {/* Message */}
                    {message && (
                        <p className="mt-4 text-center text-sm text-gray-600">
                            {message}
                        </p>
                    )}

                    {/* Register */}
                    <div className="mt-6 border-t border-gray-100 pt-5 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/register")}
                                className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                                Create one
                            </button>
                        </p>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login; 