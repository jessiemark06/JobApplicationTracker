import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ApplicationDetails() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadApplication() {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/applications/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load application.");
                }

                setApplication(data.application);
            } catch (loadError) {
                setError(loadError.message || "Failed to load application.");
            } finally {
                setLoading(false);
            }
        }

        loadApplication();
    }, [id, token]);

    if (loading) {
        return <div className="p-10 text-center text-sm text-gray-500">Loading application details...</div>;
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <button type="button" onClick={() => navigate("/applications")} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-slate-900">
                        <ArrowLeft size={16} />
                        Back to applications
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-900">{application.job_title}</h1>
                    <p className="mt-1 text-sm text-gray-500">{application.company?.name || "Unknown company"}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{application.status}</span>
                    <button type="button" onClick={() => navigate(`/applications/edit/${application.id}`)} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Edit</button>
                </div>
            </div>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">Application information</h2>
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Company</dt><dd className="mt-1 text-sm text-gray-900">{application.company?.name || "Not provided"}</dd></div>
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Applied date</dt><dd className="mt-1 inline-flex items-center gap-1 text-sm text-gray-900">{application.applied_at ? <><CalendarDays size={15} />{application.applied_at}</> : "Not provided"}</dd></div>
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Contact name</dt><dd className="mt-1 text-sm text-gray-900">{application.contact_name || "Not provided"}</dd></div>
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Contact role</dt><dd className="mt-1 text-sm text-gray-900">{application.contact_role || "Not provided"}</dd></div>
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Contact email</dt><dd className="mt-1 text-sm text-gray-900">{application.contact_email || "Not provided"}</dd></div>
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Contact phone</dt><dd className="mt-1 text-sm text-gray-900">{application.contact_phone || "Not provided"}</dd></div>
                </dl>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">Notes and job posting</h2>
                {application.job_url && (
                    <a href={application.job_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800">
                        Open job posting
                        <ExternalLink size={15} />
                    </a>
                )}
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">{application.notes || "No notes added."}</p>
            </section>
        </div>
    );
}

export default ApplicationDetails;
