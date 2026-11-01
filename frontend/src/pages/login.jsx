 
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import { ArrowLeft, ArrowRight, BriefcaseBusiness } from "lucide-react";

function Login() {
    const navigate = useNavigate();

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificationRequired, setVerificationRequired] = useState(false);
    const [resending, setResending] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            await login(email, password);

            setMessage("Login successful!");
            setVerificationRequired(false);

            navigate("/dashboard");
        } catch (error) {
            setMessage(error.message);
            setVerificationRequired(error.message.toLowerCase().includes("verify your email"));
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/email/verification-notification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Could not resend the verification email.");
            setMessage(data.message);
        } catch (error) {
            setMessage(error.message || "Could not resend the verification email.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-10 font-sans">
            <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />

            <div className="relative w-full max-w-md motion-safe:animate-fade-in-up">

                {/* Back to Home */}
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-slate-900 cursor-pointer"
                >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Back to home
                </button>

                {/* Login Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xl shadow-slate-900/10 sm:p-9">

                    {/* Header */}
                    <div className="mb-6">
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/15"><BriefcaseBusiness size={21} aria-hidden="true" /></div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Continue organizing your next career move.
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
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Signing in..." : "Sign in"} {!loading && <ArrowRight size={16} aria-hidden="true" />}
                        </button>

                    </form>

                    {/* Message */}
                    {message && (
                        <p className="mt-4 text-center text-sm text-gray-600">
                            {message}
                        </p>
                    )}

                    {verificationRequired && (
                        <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={resending}
                            className="mt-3 w-full text-center text-sm font-medium text-blue-700 underline disabled:opacity-50"
                        >
                            {resending ? "Sending..." : "Resend verification email"}
                        </button>
                    )}

                    {/* Register */}
                    <div className="mt-6 border-t border-gray-100 pt-5 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/register")}
                                className="font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
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