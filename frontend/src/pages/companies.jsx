import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Building2,
    Eye,
    ExternalLink,
    Globe,
    MapPin,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Companies() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadCompanies() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    "http://127.0.0.1:8000/api/companies",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to load companies.");
                }

                const data = await response.json();
                setCompanies(Array.isArray(data.companies) ? data.companies : []);
            } catch (loadError) {
                if (loadError.name !== "AbortError") {
                    setError(loadError.message || "Failed to load companies.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadCompanies();
        return () => controller.abort();
    }, [token, refreshKey]);

    const filteredCompanies = companies.filter((company) =>
        company.name.toLowerCase().includes(search.trim().toLowerCase())
    );
    const companiesWithWebsite = companies.filter((company) => company.website);
    const companiesWithLocation = companies.filter((company) => company.location);

    const handleDelete = async (company) => {
        if (!window.confirm(`Delete ${company.name}?`)) return;

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/companies/delete/${company.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to delete company.");
            }

            setCompanies((current) => current.filter((item) => item.id !== company.id));
        } catch (deleteError) {
            setError(deleteError.message || "Failed to delete company.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage the organizations on your job search list.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/companies/create")}
                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                    <Plus size={18} />
                    Add Company
                </button>
            </div>

           

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-900">Company directory</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {companies.length} {companies.length === 1 ? "company" : "companies"} saved
                        </p>
                    </div>

                    <label className="relative block w-full sm:w-72">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search companies"
                            aria-label="Search companies"
                            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </label>
                </div>

                {error ? (
                    <div className="p-8 text-center">
                        <p role="alert" className="text-sm text-red-600">{error}</p>
                        <button
                            type="button"
                            onClick={() => setRefreshKey((key) => key + 1)}
                            className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-800"
                        >
                            Try again
                        </button>
                    </div>
                ) : loading ? (
                    <div className="p-10 text-center text-sm text-gray-500" role="status">
                        Loading companies...
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <div className="p-10 text-center">
                        <Building2 size={30} className="mx-auto text-gray-400" aria-hidden="true" />
                        <p className="mt-3 font-medium text-gray-900">
                            {search ? "No matching companies" : "No companies yet"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {search ? "Try another company name." : "Add a company to start building your directory."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th scope="col" className="px-5 py-3 font-medium">Company</th>
                                    <th scope="col" className="px-5 py-3 font-medium">Location</th>
                                    <th scope="col" className="px-5 py-3 font-medium">Website</th>
                                    <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCompanies.map((company) => (
                                    <tr key={company.id} className="hover:bg-gray-50/70">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 font-medium text-gray-700">
                                                    {company.name.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="font-medium text-gray-900">{company.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">
                                            {company.location || "Not provided"}
                                        </td>
                                        <td className="px-5 py-4">
                                            {company.website ? (
                                                <a
                                                    href={company.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 font-medium text-blue-700 hover:text-blue-800"
                                                >
                                                    Visit website
                                                    <ExternalLink size={14} />
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">Not provided</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/companies/view/${company.id}`)}
                                                    aria-label={`View ${company.name}`}
                                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-slate-900"
                                                >
                                                    <Eye size={17} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/companies/edit/${company.id}`)}
                                                    aria-label={`Edit ${company.name}`}
                                                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-slate-900"
                                                >
                                                    <Pencil size={17} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(company)}
                                                    aria-label={`Delete ${company.name}`}
                                                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
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

export default Companies;