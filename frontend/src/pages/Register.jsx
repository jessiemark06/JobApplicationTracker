import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { ArrowLeft, ArrowRight, BriefcaseBusiness } from "lucide-react";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [agreements, setAgreements] = useState([]);
    const [acceptedAgreements, setAcceptedAgreements] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [resending, setResending] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE_URL}/agreements`, { headers: { Accept: "application/json" } })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Could not load agreements.");
                setAgreements(data.agreements || []);
            })
            .catch((agreementError) => setError(agreementError.message));
    }, []);

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
                        agreement_slugs: acceptedAgreements,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed."
                );
            }

            setSuccess(data.message || "Account created. Check your email for a verification link.");

            setName("");
            setPassword("");
            setPasswordConfirmation("");

        } catch (registerError) {
            setError(
                registerError.message || "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setError("");
        setSuccess("");
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
            setSuccess(data.message);
        } catch (resendError) {
            setError(resendError.message || "Could not resend the verification email.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 py-10 font-sans">
            <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />

            <div className="relative w-full max-w-lg motion-safe:animate-fade-in-up">

                {/* Logo / Title */}
                <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-slate-900"><ArrowLeft size={16} aria-hidden="true" /> Back to home</Link>

                {/* Register Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xl shadow-slate-900/10 sm:p-9">

                    <div className="mb-6">
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/15"><BriefcaseBusiness size={21} aria-hidden="true" /></div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Create Account
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Build a clearer workflow for your job search.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            <p>{success}</p>
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={resending || !email}
                                className="mt-2 font-medium underline disabled:opacity-50"
                            >
                                {resending ? "Sending..." : "Resend verification email"}
                            </button>
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
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
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
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
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
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
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
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4">
                            <legend className="px-1 text-sm font-medium text-gray-700">Required agreements</legend>
                            <p className="text-xs text-gray-500">Read each agreement before accepting. Your acceptance and its version will be recorded.</p>
                            {agreements.map((agreement) => (
                                <label key={agreement.slug} className="block text-sm text-gray-700">
                                    <span className="flex items-start gap-2">
                                        <input
                                            type="checkbox"
                                            required={agreement.is_required}
                                            checked={acceptedAgreements.includes(agreement.slug)}
                                            onChange={(event) => setAcceptedAgreements((current) => event.target.checked
                                                ? [...current, agreement.slug]
                                                : current.filter((slug) => slug !== agreement.slug))}
                                        />
                                        <span><strong>{agreement.title}</strong> (version {agreement.version})</span>
                                    </span>
                                    <details className="ml-6 mt-1 text-xs text-gray-500">
                                        <summary className="cursor-pointer">View agreement</summary>
                                        <p className="mt-2 whitespace-pre-wrap">{agreement.content}</p>
                                    </details>
                                </label>
                            ))}
                        </fieldset>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Creating account..."
                                : <>Create Account <ArrowRight size={16} aria-hidden="true" /></>}
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