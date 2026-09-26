 
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function AddCompany() {
    const navigate = useNavigate();
    const { id } = useParams();
    const editing = Boolean(id);

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        website: "",
        notes: "",
    });

    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(editing);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!editing) return;

        async function loadCompany() {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/api/companies/edit/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            Accept: "application/json",
                        },
                    }
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load company.");
                }

                setFormData({
                    name: data.company.name || "",
                    location: data.company.location || "",
                    website: data.company.website || "",
                    notes: data.company.notes || "",
                });
            } catch (loadError) {
                setError(loadError.message || "Failed to load company.");
            } finally {
                setFormLoading(false);
            }
        }

        loadCompany();
    }, [editing, id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                editing
                    ? `http://127.0.0.1:8000/api/companies/update/${id}`
                    : "http://127.0.0.1:8000/api/companies",
                {
                    method: editing ? "PUT" : "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to add company.");
                return;
            }

            navigate(editing ? "/companies" : "/dashboard");

        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (formLoading) {
        return <div className="p-10 text-center text-sm text-gray-500">Loading company...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">

            {/* Page Header */}
            <div className="mb-6">

        

                <h1 className="text-2xl font-semibold text-gray-900">
                    {editing ? "Edit Company" : "Add Company"}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    {editing ? "Update the company information in your tracker." : "Add a new company to your job application tracker."}
                </p>

            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

                <div className="p-6">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Company Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Enter the basic information about the company.
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="mt-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-5"
                    >

                        {/* Company Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Company Name
                            </label>

                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Accenture"
                                required
                                className="
                                    w-full
                                    px-4 py-2.5
                                    border border-gray-300
                                    rounded-lg
                                    text-sm
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    focus:border-blue-500
                                "
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label
                                htmlFor="location"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Location
                            </label>

                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Makati City, Metro Manila"
                                className="
                                    w-full
                                    px-4 py-2.5
                                    border border-gray-300
                                    rounded-lg
                                    text-sm
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    focus:border-blue-500
                                "
                            />
                        </div>

                        {/* Website */}
                        <div>
                            <label
                                htmlFor="website"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Website
                            </label>

                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://company.com"
                                className="
                                    w-full
                                    px-4 py-2.5
                                    border border-gray-300
                                    rounded-lg
                                    text-sm
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    focus:border-blue-500
                                "
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label
                                htmlFor="notes"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Notes
                            </label>

                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Add any notes about this company..."
                                className="
                                    w-full
                                    px-4 py-2.5
                                    border border-gray-300
                                    rounded-lg
                                    text-sm
                                    resize-none
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    focus:border-blue-500
                                "
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">

                            <button
                                type="button"
                                onClick={() => navigate(editing ? "/companies" : "/dashboard")}
                                className="
                                    px-4 py-2.5
                                    text-sm font-medium
                                    text-gray-700
                                    bg-gray-100
                                    rounded-lg
                                    hover:bg-gray-200
                                    transition
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    px-4 py-2.5
                                    bg-slate-900
                                    text-white
                                    text-sm font-medium
                                    rounded-lg
                                    cursor-pointer
                                    hover:bg-slate-800
                                    transition
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                {loading ? "Saving..." : editing ? "Save Changes" : "Save Company"}
                            </button>

                        </div>

                    </form>

                </div>
            </div>

        </div>
    );
}

export default AddCompany; 
