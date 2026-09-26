import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ClipboardList, Eye, ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const statuses = ["Applied", "Screening", "Interview", "Offer", "Rejected", "Withdrawn"];

function Applications() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
            const [applicationsResponse, companiesResponse] = await Promise.all([
                fetch("http://127.0.0.1:8000/api/applications", { headers }),
                fetch("http://127.0.0.1:8000/api/companies", { headers }),
            ]);

            if (!applicationsResponse.ok || !companiesResponse.ok) {
                throw new Error("Failed to load applications.");
            }

            const applicationsData = await applicationsResponse.json();
            const companiesData = await companiesResponse.json();
            setApplications(Array.isArray(applicationsData.applications) ? applicationsData.applications : []);
            setCompanies(Array.isArray(companiesData.companies) ? companiesData.companies : []);
        } catch (loadError) {
            setError(loadError.message || "Failed to load applications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token]);

    const filteredApplications = applications.filter((application) => {
        const query = search.trim().toLowerCase();
        const matchesSearch = !query ||
            application.job_title.toLowerCase().includes(query) ||
            application.company?.name?.toLowerCase().includes(query);
        const matchesStatus = statusFilter === "All" || application.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this application?")) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/applications/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (!response.ok) throw new Error("Failed to delete application.");
            setApplications((current) => current.filter((application) => application.id !== id));
        } catch (deleteError) {
            setError(deleteError.message || "Failed to delete application.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
                    <p className="mt-1 text-sm text-gray-500">Track every role from application to outcome.</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/applications/create")}
                    disabled={companies.length === 0}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus size={18} />
                    Add Application
                </button>
            </div>

            {companies.length === 0 && !loading && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Add a company before creating an application.
                    <button type="button" onClick={() => navigate("/companies/create")} className="ml-2 font-semibold underline">Add company</button>
                </div>
            )}

            {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex flex-col flex flex-col p-6 border-b border-gray-200 bg-slate-900 rounded-t-lg sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-white">Application pipeline</h2>
                        <p className="mt-1 text-sm text-gray-300">{applications.length} {applications.length === 1 ? "application" : "applications"} saved</p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <label className="relative block sm:w-64">
                            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search roles or companies" aria-label="Search applications" className="bg-white text-gray-900 w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none"/>
                        </label>
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        aria-label="Filter by status"
                        className="bg-white text-gray-900 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
                    >
                        <option>All</option>

                        {statuses.map((status) => (
                            <option key={status}>{status}</option>
                        ))}
                    </select>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-sm text-gray-500">Loading applications...</div>
                ) : filteredApplications.length === 0 ? (
                    <div className="p-12 text-center">
                        <ClipboardList size={32} className="mx-auto text-gray-400" />
                        <p className="mt-3 font-medium text-gray-900">No applications found</p>
                        <p className="mt-1 text-sm text-gray-500">Create an application to start tracking your job search.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th scope="col" className="px-5 py-3 font-medium">Role</th>
                                    <th scope="col" className="px-5 py-3 font-medium">Company</th>
                                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                                    <th scope="col" className="px-5 py-3 font-medium">Applied</th>
                                    <th scope="col" className="px-5 py-3 font-medium">Contact</th>
                                    <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredApplications.map((application) => (
                                    <tr key={application.id} className="hover:bg-gray-50/70">
                                        <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">{application.job_title}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">{application.company?.name || "Unknown company"}</td>
                                        <td className="whitespace-nowrap px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{application.status}</span></td>
                                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">{application.applied_at ? <span className="inline-flex items-center gap-1"><CalendarDays size={14} />{application.applied_at}</span> : "Not provided"}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">{application.contact_name || "Not provided"}</td>
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                <button type="button" onClick={() => navigate(`/applications/view/${application.id}`)} aria-label={`View ${application.job_title}`} className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-green-200 hover:text-blue-900"><Eye size={17} /></button>
                                                {application.job_url && <a href={application.job_url} target="_blank" rel="noopener noreferrer" aria-label="Open job posting" className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 hover:text-slate-900"><ExternalLink size={17} /></a>}
                                                <button type="button" onClick={() => navigate(`/applications/edit/${application.id}`)} aria-label={`Edit ${application.job_title}`} className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-blue-200 hover:text-gray-600"><Pencil size={17} /></button>
                                                <button type="button" onClick={() => handleDelete(application.id)} aria-label={`Delete ${application.job_title}`} className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Applications;
