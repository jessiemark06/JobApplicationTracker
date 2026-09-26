 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import {
    Building2,
    Briefcase,
    MapPin,
    Plus,
    ExternalLink,
} from "lucide-react";

function Dashboard() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
    const token = localStorage.getItem("token");
    const API_BASE_URL = "http://127.0.0.1:8000/api";

    // Get companies
    fetch(`${API_BASE_URL}/companies`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch companies");
            }

            return response.json();
        })
        .then((data) => {
            setCompanies(data.companies);
        })
        .catch((error) => {
            console.error(error);
        });

    // Get applications
    fetch(`${API_BASE_URL}/applications`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch applications");
            }

            return response.json();
        })
        .then((data) => {
            setApplications(data.applications);
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
            setLoading(false);
        });
}, []);

    const companiesWithWebsite = companies.filter(
        (company) => company.website
    );

    const companiesWithLocation = companies.filter(
        (company) => company.location
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        A quick overview of the companies in your job search.
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500" role="status">
                    Loading companies...
                </div>
            </div>
        );
    }

    return (
        <div>

            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Dashboard
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        A quick overview of the companies in your job search.
                    </p>
                </div>

                <button onClick={() => navigate("/companies/create")} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer">
                    <Plus size={18} />
                    Add Company
                </button>

            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                Total Companies
                            </p>

                            <p className="text-2xl font-semibold text-gray-900 mt-2">
                                {companies.length}
                            </p>
                        </div>

                        <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Building2 size={21} />
                        </div>

                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                Application
                            </p>

                            <p className="text-2xl font-semibold text-gray-900 mt-2">
                                {applications.length}
                            </p>
                        </div>

                        <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Briefcase size={21} />
                        </div>

                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                Locations
                            </p>

                            <p className="text-2xl font-semibold text-gray-900 mt-2">
                                {companiesWithLocation.length}
                            </p>
                        </div>

                        <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <MapPin size={21} />
                        </div>

                    </div>
                </div>

            </div>

            {/* Company List */}
            <div className="bg-white border border-gray-200 rounded-xl ">

                <div className="p-6 border-b border-gray-200 bg-slate-900 rounded-t-lg">

                    <div className="flex items-center justify-between gap-4 ">

                        <div>
                            <h2 className="text-base font-semibold text-white">
                                Your companies
                            </h2>

                            <p className="text-sm text-gray-300 mt-1">
                                Your saved company profiles at a glance.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/companies")}
                            className="cursor-pointer text-sm font-medium text-white hover:text-gray-300"
                        >
                            View all companies
                        </button>

                    </div>

                </div>

                <div className="p-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                        {companies.slice(0, 3).map((company) => (

                            <div
                                key={company.id}
                                className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition"
                            >

                                <div className="flex items-start gap-3">

                                    <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-medium">
                                        {company.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {company.name}
                                        </h3>

                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                            <MapPin size={14} />
                                            {company.location || "No location"}
                                        </p>
                                    </div>

                                </div>

                                <div className="border-t border-gray-100 mt-5 pt-4">

                                    <div className="flex items-center justify-between mb-3">

                                        <span className="text-xs font-medium text-gray-500 uppercase">
                                            Website
                                        </span>

                                        {company.website ? (
                                            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">
                                                Available
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                                                None
                                            </span>
                                        )}

                                    </div>

                                    {company.website && (
                                        <a
                                            href={company.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                        >
                                            View Website
                                            <ExternalLink size={15} />
                                        </a>
                                    )}

                                </div>

                            </div>

                        ))}

                    </div>

                    {companies.length === 0 && (
                        <div className="text-center py-12">

                            <Building2
                                size={32}
                                className="mx-auto text-gray-400"
                            />

                            <p className="text-gray-500 mt-3">
                                No companies found.
                            </p>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}

export default Dashboard;