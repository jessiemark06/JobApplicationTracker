import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Building2, ExternalLink, MapPin, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

function CompanyDetails() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [company, setCompany] = useState(null);
    const [entry, setEntry] = useState({ category: "note", content: "", source_url: "", source_date: "" });
    const [error, setError] = useState("");

    const loadCompany = useCallback(async () => {
        const response = await fetch(`${API_BASE_URL}/companies/edit/${id}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load company.");
        setCompany(data.company);
    }, [id, token]);

    useEffect(() => {
        async function fetchCompany() {
            try {
                await loadCompany();
            } catch (loadError) {
                setError(loadError.message);
            }
        }

        fetchCompany();
    }, [loadCompany]);

    const addResearchEntry = async (event) => {
        event.preventDefault();
        setError("");
        try {
            const response = await fetch(`${API_BASE_URL}/companies/${id}/research`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({ ...entry, source_date: entry.source_date || null, source_url: entry.source_url || null }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to save research entry.");
            setEntry({ category: "note", content: "", source_url: "", source_date: "" });
            await loadCompany();
        } catch (saveError) {
            setError(saveError.message);
        }
    };

    if (!company && !error) return <div className="p-10 text-center text-sm text-gray-500">Loading company details...</div>;
    if (!company) return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>;

    const categoryLabels = { recruitment: "Recruitment details", interview: "Interview experience", salary: "Reported salary", note: "Personal note" };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <button type="button" onClick={() => navigate("/companies")} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-slate-900"><ArrowLeft size={16} /> Back</button>
                    <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Building2 size={24} /></span>
                        <div><h1 className="text-2xl font-semibold text-gray-900">{company.name}</h1><p className="mt-1 text-sm text-gray-500">Personal company research profile</p></div>
                    </div>
                </div>
                <button type="button" onClick={() => navigate(`/companies/edit/${company.id}`)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"><Pencil size={17} /> Edit company</button>
            </div>
            {error && <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">Company information</h2>
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Location</dt><dd className="mt-1 inline-flex items-center gap-1 text-sm text-gray-900"><MapPin size={15} />{company.location || "Not provided"}</dd></div>
                    <div><dt className="text-xs font-medium uppercase text-gray-500">Website / careers page</dt><dd className="mt-1 text-sm">{company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium text-blue-700">Visit website <ExternalLink size={14} /></a> : <span className="text-gray-500">Not provided</span>}</dd></div>
                </dl>
                <h3 className="mt-6 text-sm font-semibold text-gray-900">Application instructions</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{company.application_instructions || "No instructions saved."}</p>
                <h3 className="mt-5 text-sm font-semibold text-gray-900">Recruitment notes</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{company.recruitment_notes || "No recruitment notes saved."}</p>
                <h3 className="mt-5 text-sm font-semibold text-gray-900">Company notes</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{company.notes || "No notes saved."}</p>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">My research and observations</h2>
                <p className="mt-1 text-xs text-gray-500">Personal notes are not externally verified or shared with other users.</p>
                <form onSubmit={addResearchEntry} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm text-gray-700">Entry type
                        <select value={entry.category} onChange={(event) => setEntry({ ...entry, category: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                            <option value="note">Personal note</option><option value="recruitment">Recruitment detail</option><option value="interview">Interview experience</option><option value="salary">Reported salary</option>
                        </select>
                    </label>
                    <label className="text-sm text-gray-700">Source date (optional)
                        <input type="date" value={entry.source_date} onChange={(event) => setEntry({ ...entry, source_date: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </label>
                    <label className="sm:col-span-2 text-sm text-gray-700">Details
                        <textarea required value={entry.content} onChange={(event) => setEntry({ ...entry, content: event.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Include salary range, interview stages, assessment type, or observations." />
                    </label>
                    <label className="sm:col-span-2 text-sm text-gray-700">Source URL (optional)
                        <input type="url" value={entry.source_url} onChange={(event) => setEntry({ ...entry, source_url: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="https://" />
                    </label>
                    <button className="justify-self-start rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save research note</button>
                </form>
                <ul className="mt-5 space-y-3">
                    {(company.research_entries || []).map((item) => (
                        <li key={item.id} className="rounded-lg bg-gray-50 p-4">
                            <div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-gray-900">{categoryLabels[item.category] || item.category}</strong><span className="text-xs text-gray-500">{item.source_date || new Date(item.created_at).toLocaleDateString()}</span></div>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.content}</p>
                            {item.source_url && <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-700">Source <ExternalLink size={12} /></a>}
                        </li>
                    ))}
                    {!company.research_entries?.length && <li className="text-sm text-gray-500">No research has been recorded.</li>}
                </ul>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">Applications with this company</h2>
                <ul className="mt-4 divide-y divide-gray-100">
                    {(company.applications || []).map((application) => (
                        <li key={application.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                            <button onClick={() => navigate(`/applications/view/${application.id}`)} className="text-left text-sm font-medium text-blue-700 hover:underline">{application.job_title}</button>
                            <span className="text-sm text-gray-600">{application.status}</span>
                        </li>
                    ))}
                    {!company.applications?.length && <li className="py-3 text-sm text-gray-500">No applications recorded.</li>}
                </ul>
            </section>
        </div>
    );
}

export default CompanyDetails;
