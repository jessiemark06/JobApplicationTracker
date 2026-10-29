import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Download, ExternalLink, FileUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

function ApplicationDetails() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [application, setApplication] = useState(null);
    const [documentType, setDocumentType] = useState("resume");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const loadApplication = useCallback(async () => {
        const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load application.");
        setApplication(data.application);
    }, [id, token]);

    useEffect(() => {
        async function fetchApplication() {
            try {
                await loadApplication();
            } catch (loadError) {
                setError(loadError.message);
            }
        }

        fetchApplication();
    }, [loadApplication]);

    const uploadDocument = async (event) => {
        event.preventDefault();
        if (!file) return;
        setBusy(true);
        setError("");
        try {
            const body = new FormData();
            body.append("type", documentType);
            body.append("file", file);
            const response = await fetch(`${API_BASE_URL}/applications/${id}/documents`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                body,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to upload document.");
            setFile(null);
            await loadApplication();
        } catch (uploadError) {
            setError(uploadError.message);
        } finally {
            setBusy(false);
        }
    };

    const downloadDocument = async (document) => {
        try {
            const response = await fetch(`${API_BASE_URL}/documents/${document.id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to download document.");
            }
            const url = URL.createObjectURL(await response.blob());
            const link = window.document.createElement("a");
            link.href = url;
            link.download = document.original_name;
            link.click();
            URL.revokeObjectURL(url);
        } catch (downloadError) {
            setError(downloadError.message);
        }
    };

    if (!application && !error) {
        return <div className="p-10 text-center text-sm text-gray-500">Loading application details...</div>;
    }
    if (!application) {
        return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>;
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <button type="button" onClick={() => navigate("/applications")} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-slate-900">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-900">{application.job_title}</h1>
                    <p className="mt-1 text-sm text-gray-500">{application.company?.name || "Unknown company"}</p>
                    <button type="button" onClick={() => navigate(`/interviews?application_id=${application.id}`)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-gray-50">
                        <CalendarDays size={16} /> Schedule an interview or event
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{application.status}</span>
                    <button type="button" onClick={() => navigate(`/applications/edit/${application.id}`)} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Edit</button>
                </div>
            </div>

            {error && <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">Application information</h2>
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Company</dt><dd className="mt-1 text-sm text-gray-900">{application.company?.name || "Not provided"}</dd></div>
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Applied date</dt><dd className="mt-1 inline-flex items-center gap-1 text-sm text-gray-900">{application.applied_at ? <><CalendarDays size={15} />{application.applied_at}</> : "Not provided"}</dd></div>
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Application source</dt><dd className="mt-1 text-sm text-gray-900">{application.source || "Not recorded"}</dd></div>
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Contact</dt><dd className="mt-1 text-sm text-gray-900">{application.contact_name || "Not provided"}{application.contact_email ? ` · ${application.contact_email}` : ""}</dd></div>
                </dl>
                {application.job_url && <a href={application.job_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700">Open job posting <ExternalLink size={15} /></a>}
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">{application.notes || "No notes added."}</p>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">Saved job description</h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">{application.job_description || "No job description saved."}</p>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">Status history</h2>
                <ol className="mt-4 space-y-4">
                    {(application.status_history || []).map((history) => (
                        <li key={history.id} className="border-l-2 border-slate-200 pl-4">
                            <p className="text-sm font-medium text-gray-900">{history.previous_status ? `${history.previous_status} → ` : ""}{history.new_status}</p>
                            <p className="text-xs text-gray-500">{new Date(history.recorded_at).toLocaleString()}</p>
                            {history.notes && <p className="mt-1 text-sm text-gray-600">{history.notes}</p>}
                        </li>
                    ))}
                    {!application.status_history?.length && <li className="text-sm text-gray-500">No recorded history.</li>}
                </ol>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-gray-900">Interviews &amp; recruitment events</h2>
                    <button type="button" onClick={() => navigate(`/interviews?application_id=${application.id}`)} className="text-sm font-medium text-blue-700 hover:underline">Add event</button>
                </div>
                <ul className="mt-4 divide-y divide-gray-100">
                    {(application.recruitment_events || []).filter((item) => !["cancelled", "completed"].includes(item.status)).map((item) => (
                        <li key={item.id} className="py-3">
                            <p className="text-sm font-medium text-gray-900">{item.event_type} · <span className="capitalize">{item.status}</span></p>
                            <p className="mt-1 text-xs text-gray-500">{new Date(item.starts_at).toLocaleString(undefined, { timeZone: user?.timezone || item.timezone || "UTC" })}{item.mode ? ` · ${item.mode}` : ""}</p>
                            {item.location && <p className="mt-1 break-all text-sm text-blue-700">{item.location}</p>}
                            {item.preparation_notes && <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{item.preparation_notes}</p>}
                        </li>
                    ))}
                    {!application.recruitment_events?.some((item) => !["cancelled", "completed"].includes(item.status)) && <li className="py-3 text-sm text-gray-500">No upcoming events recorded.</li>}
                </ul>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-2"><FileUp size={18} /><h2 className="text-base font-semibold text-gray-900">Resume and documents</h2></div>
                <p className="mt-1 text-xs text-gray-500">Private files are limited to PDF, DOC, DOCX, or TXT up to 10 MB.</p>
                <form onSubmit={uploadDocument} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="text-sm text-gray-700">Document type
                        <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="mt-1 block rounded-lg border border-gray-300 px-3 py-2">
                            <option value="resume">Resume</option><option value="job_description">Job description</option><option value="other">Other</option>
                        </select>
                    </label>
                    <label className="min-w-0 flex-1 text-sm text-gray-700">Choose document
                        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm" required />
                    </label>
                    <button disabled={busy || !file} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? "Uploading..." : "Upload version"}</button>
                </form>
                <ul className="mt-5 divide-y divide-gray-100">
                    {(application.documents || []).map((document) => (
                        <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                            <div><p className="text-sm font-medium text-gray-900">{document.original_name}</p><p className="text-xs text-gray-500">{document.type.replace("_", " ")} · Uploaded {new Date(document.created_at).toLocaleDateString()}</p></div>
                            <button type="button" onClick={() => downloadDocument(document)} className="inline-flex items-center gap-2 text-sm text-blue-700"><Download size={15} /> Download</button>
                        </li>
                    ))}
                    {!application.documents?.length && <li className="py-3 text-sm text-gray-500">No files attached.</li>}
                </ul>
            </section>
        </div>
    );
}

export default ApplicationDetails;
