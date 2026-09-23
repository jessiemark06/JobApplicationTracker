 
import { useEffect, useState } from "react";

function Companies() {
    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://127.0.0.1:8000/api/companies", {
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
    }, []);

    const filteredCompanies = companies.filter((company) =>
        company.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Companies
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Keep track of the companies you're applying to.
                    </p>
                </div>

                <button
                    className="
                        inline-flex items-center justify-center
                        px-4 py-2.5
                        bg-blue-600
                        text-white
                        text-sm font-medium
                        rounded-lg
                        hover:bg-blue-700
                        transition
                    "
                >
                    <span className="text-lg mr-2 leading-none">+</span>
                    Add Company
                </button>

            </div>


            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* Total Companies */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                Total Companies
                            </p>

                            <p className="text-2xl font-semibold text-gray-900 mt-2">
                                {companies.length}
                            </p>
                        </div>

                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                    d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14M9 9h1m-1 4h1m4-4h1m-1 4h1"
                                />
                            </svg>
                        </div>

                    </div>

                </div>


                {/* With Website */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                With Website
                            </p>

                            <p className="text-2xl font-semibold text-gray-900 mt-2">
                                {companies.filter((company) => company.website).length}
                            </p>
                        </div>

                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-emerald-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                    d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.2-2.4 3.5-5.6 3.5-9S14.2 5.4 12 3m0 18c-2.2-2.4-3.5-5.6-3.5-9S9.8 5.4 12 3M3.5 9h17M3.5 15h17"
                                />
                            </svg>
                        </div>

                    </div>

                </div>


                {/* Locations */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                Locations
                            </p>

                            <p className="text-2xl font-semibold text-gray-900 mt-2">
                                {
                                    new Set(
                                        companies
                                            .filter((company) => company.location)
                                            .map((company) => company.location)
                                    ).size
                                }
                            </p>
                        </div>

                        <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-violet-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                    d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"
                                />
                                <circle
                                    cx="12"
                                    cy="9"
                                    r="2.2"
                                    strokeWidth="1.8"
                                />
                            </svg>
                        </div>

                    </div>

                </div>

            </div>


            {/* Companies Section */}
            <div className="bg-white border border-gray-200 rounded-xl">

                {/* Section Header */}
                <div className="px-6 py-5 border-b border-gray-200">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Company List
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                View and manage your saved companies.
                            </p>
                        </div>


                        {/* Search */}
                        <div className="relative w-full md:w-72">

                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                                />
                            </svg>

                            <input
                                type="text"
                                placeholder="Search companies"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="
                                    w-full
                                    pl-9 pr-4 py-2.5
                                    text-sm
                                    border border-gray-200
                                    rounded-lg
                                    bg-gray-50
                                    outline-none
                                    focus:bg-white
                                    focus:ring-2
                                    focus:ring-blue-500/20
                                    focus:border-blue-500
                                    transition
                                "
                            />

                        </div>

                    </div>

                </div>


                {/* Company List */}
                <div className="p-6">

                    {filteredCompanies.length > 0 ? (

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                            {filteredCompanies.map((company) => (

                                <div
                                    key={company.id}
                                    className="
                                        group
                                        border border-gray-200
                                        rounded-xl
                                        p-5
                                        hover:border-blue-200
                                        hover:shadow-sm
                                        transition
                                    "
                                >

                                    {/* Company Info */}
                                    <div className="flex items-center gap-4">

                                        <div className="
                                            w-11 h-11
                                            rounded-lg
                                            bg-gray-100
                                            flex items-center justify-center
                                            shrink-0
                                        ">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {company.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>


                                        <div className="min-w-0">

                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {company.name}
                                            </h3>

                                            <p className="text-sm text-gray-500 mt-0.5 truncate">
                                                {company.location ||
                                                    "Location not specified"}
                                            </p>

                                        </div>

                                    </div>


                                    {/* Details */}
                                    <div className="mt-5 pt-4 border-t border-gray-100">

                                        <div className="flex items-center justify-between">

                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Website
                                            </span>

                                            {company.website ? (
                                                <span className="
                                                    inline-flex
                                                    items-center
                                                    px-2 py-1
                                                    rounded-md
                                                    bg-emerald-50
                                                    text-emerald-700
                                                    text-xs font-medium
                                                ">
                                                    Available
                                                </span>
                                            ) : (
                                                <span className="
                                                    inline-flex
                                                    items-center
                                                    px-2 py-1
                                                    rounded-md
                                                    bg-gray-100
                                                    text-gray-500
                                                    text-xs font-medium
                                                ">
                                                    Not added
                                                </span>
                                            )}

                                        </div>


                                        {/* Website Button */}
                                        {company.website && (

                                            <a
                                                href={company.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="
                                                    mt-4
                                                    flex items-center justify-center
                                                    w-full
                                                    px-4 py-2
                                                    border border-gray-200
                                                    rounded-lg
                                                    text-sm font-medium
                                                    text-gray-700
                                                    hover:bg-gray-50
                                                    hover:text-blue-600
                                                    transition
                                                "
                                            >
                                                View Website

                                                <svg
                                                    className="w-4 h-4 ml-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-5-9h7m0 0v7m0-7L11 13"
                                                    />
                                                </svg>

                                            </a>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        /* Empty State */
                        <div className="py-16 text-center">

                            <div className="
                                w-12 h-12
                                mx-auto
                                rounded-lg
                                bg-gray-100
                                flex items-center justify-center
                            ">
                                <svg
                                    className="w-6 h-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.8"
                                        d="M3 21h18M5 21V7a2 2 0 012-2h10a2 2 0 012 2v14M9 9h1m-1 4h1m4-4h1m-1 4h1"
                                    />
                                </svg>
                            </div>

                            <h3 className="mt-4 text-base font-semibold text-gray-900">
                                No companies found
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                {search
                                    ? "Try adjusting your search."
                                    : "Add your first company to get started."}
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}

export default Companies;
 
