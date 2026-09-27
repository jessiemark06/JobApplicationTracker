import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (password !== passwordConfirmation) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        password_confirmation: passwordConfirmation,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed."
                );
            }

            setSuccess("Account created successfully.");

            setName("");
            setEmail("");
            setPassword("");
            setPasswordConfirmation("");

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (registerError) {
            setError(
                registerError.message || "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Logo / Title */}
                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-slate-900">
                        JobTrack
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Create your account
                    </p>

                </div>

                {/* Register Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Create Account
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Start tracking your job applications.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Enter your name"
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="Enter your email"
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                required
                                minLength={8}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Minimum 8 characters.
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Confirm Password
                            </label>

                            <input
                                id="password_confirmation"
                                type="password"
                                value={passwordConfirmation}
                                onChange={(event) =>
                                    setPasswordConfirmation(
                                        event.target.value
                                    )
                                }
                                placeholder="Confirm your password"
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 transition"
                        >
                            {loading
                                ? "Creating account..."
                                : "Create Account"}
                        </button>

                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-slate-900 hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;