import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const statuses = ["Applied", "Screening", "Interview", "Offer", "Rejected", "Withdrawn"];

const emptyForm = {
    company_id: "",
    job_title: "",
    status: "Applied",
    applied_at: "",
    job_url: "",
    contact_name: "",
    contact_role: "",
    contact_email: "",
    contact_phone: "",
    notes: "",
};

function AddApplication() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const editing = Boolean(id);
    const [companies, setCompanies] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadFormData() {
            try {
                const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
                const companiesResponse = await fetch("http://127.0.0.1:8000/api/companies", { headers });
                const companiesData = await companiesResponse.json();
                if (!companiesResponse.ok) throw new Error(companiesData.message || "Failed to load companies.");
                const loadedCompanies = Array.isArray(companiesData.companies) ? companiesData.companies : [];
                setCompanies(loadedCompanies);

                if (editing) {
                    const applicationResponse = await fetch(`http://127.0.0.1:8000/api/applications/${id}`, { headers });
                    const applicationData = await applicationResponse.json();
                    if (!applicationResponse.ok) throw new Error(applicationData.message || "Failed to load application.");
                    const application = applicationData.application;
                    setForm({
                        company_id: application.company_id?.toString() || "",
                        job_title: application.job_title || "",
                        status: application.status || "Applied",
                        applied_at: application.applied_at || "",
                        job_url: application.job_url || "",
                        contact_name: application.contact_name || "",
                        contact_role: application.contact_role || "",
                        contact_email: application.contact_email || "",
                        contact_phone: application.contact_phone || "",
                        notes: application.notes || "",
                    });
                } else if (loadedCompanies.length > 0) {
                    setForm((current) => ({ ...current, company_id: loadedCompanies[0].id.toString() }));
                }
            } catch (loadError) {
                setError(loadError.message || "Failed to load application form.");
            } finally {
                setLoading(false);
            }
        }

        loadFormData();
    }, [token, id, editing]);

    const handleChange = (event) => {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const endpoint = editing
                ? `http://127.0.0.1:8000/api/applications/${id}`
                : "http://127.0.0.1:8000/api/applications";
            const response = await fetch(endpoint, {
                method: editing ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...form, company_id: Number(form.company_id) }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to save application.");
            navigate("/applications");
        } catch (saveError) {
            setError(saveError.message || "Failed to save application.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-sm text-gray-500">Loading application...</div>;
    }

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">{editing ? "Edit Application" : "Add Application"}</h1>
                <p className="mt-1 text-sm text-gray-500">Record the role, company, and progress details.</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <label className="text-sm font-medium text-gray-700">Company
                            <select name="company_id" value={form.company_id} onChange={handleChange} required className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 font-normal focus:border-slate-900 focus:outline-none">
                                <option value="">Select company</option>
                                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700">Job title
                            <input name="job_title" value={form.job_title} onChange={handleChange} required placeholder="e.g. Frontend Developer" className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 font-normal focus:border-slate-900 focus:outline-none" />
                        </label>
                        <label className="text-sm font-medium text-gray-700">Status
                            <select name="status" value={form.status} onChange={handleChange} required className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 font-normal focus:border-slate-900 focus:outline-none">
                                {statuses.map((status) => <option key={status}>{status}</option>)}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-gray-700">Applied date
                            <input type="date" name="applied_at" value={form.applied_at} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 font-normal focus:border-slate-900 focus:outline-none" />
                        </label>
                    </div>

                    <label className="block text-sm font-medium text-gray-700">Job posting URL
                        <input type="url" name="job_url" value={form.job_url} onChange={handleChange} placeholder="https://..." className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 font-normal focus:border-slate-900 focus:outline-none" />
                    </label>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <label className="text-sm font-medium text-gray-700">Contact name
                            <input name="contact_name" value={form.contact_name} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 font-normal focus:border-slate-900 focus:outline-none" />
                        </label>
                        <label className="text-sm font-medium text-gray-700">Contact role
                            <input name="contact_role" value={form.contact_role} onChange={handleChange} placeholder="e.g. Recruiter" className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 font-normal focus:border-slate-900 focus:outline-none" />
                        </label>
                        <label className="text-sm font-medium text-gray-700">Contact email
                            <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 font-normal focus:border-slate-900 focus:outline-none" />
                        </label>
                        <label className="text-sm font-medium text-gray-700">Contact phone
                            <input name="contact_phone" value={form.contact_phone} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 font-normal focus:border-slate-900 focus:outline-none" />
                        </label>
                    </div>

                    <label className="block text-sm font-medium text-gray-700">Notes
                        <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" className="mt-1.5 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 font-normal focus:border-slate-900 focus:outline-none" />
                    </label>

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                        <button type="button" onClick={() => navigate("/applications")} className="cursor-pointer rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200">Cancel</button>
                        <button type="submit" disabled={saving || companies.length === 0} className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving..." : editing ? "Save changes" : "Save application"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddApplication;
