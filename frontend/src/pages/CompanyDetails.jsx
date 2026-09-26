import { useEffect, useState } from "react";
import { ArrowLeft, Building2, ExternalLink, MapPin, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CompanyDetails() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCompany() {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/companies/edit/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load company.");
                }

                setCompany(data.company);
            } catch (loadError) {
                setError(loadError.message || "Failed to load company.");
            } finally {
                setLoading(false);
            }
        }

        loadCompany();
    }, [id, token]);

    if (loading) {
        return <div className="p-10 text-center text-sm text-gray-500">Loading company details...</div>;
    }

    if (error) {
        return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>;
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <button type="button" onClick={() => navigate("/companies")} className="cursor-pointer mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-slate-900">
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <Building2 size={24} />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">{company.name}</h1>
                            <p className="mt-1 text-sm text-gray-500">Company profile</p>
                        </div>
                    </div>
                </div>
                <button type="button" onClick={() => navigate(`/companies/edit/${company.id}`)} className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                    <Pencil size={17} />
                    Edit company
                </button>
            </div>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">Company information</h2>
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <dt className="text-xs font-medium uppercase text-gray-500">Location</dt>
                        <dd className="mt-1 inline-flex items-center gap-1 text-sm text-gray-900"><MapPin size={15} />{company.location || "Not provided"}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium uppercase text-gray-500">Website</dt>
                        <dd className="mt-1 text-sm">
                            {company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium text-blue-700 hover:text-blue-800">Visit website <ExternalLink size={14} /></a> : <span className="text-gray-500">Not provided</span>}
                        </dd>
                    </div>
                </dl>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="text-base font-semibold text-gray-900">Notes</h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">{company.notes || "No notes added."}</p>
            </section>
        </div>
    );
}

export default CompanyDetails;
