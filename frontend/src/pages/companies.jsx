import { useEffect, useState } from "react";

function Companies() {
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/companies")
            .then(response => response.json())
            .then(data => {
                setCompanies(data.companies);
            });
    }, []);

    return (
        <div>

            {/* Page heading */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Companies
                </h1>

                <p className="text-gray-500 mt-2">
                    Manage the companies you are applying to.
                </p>
            </div>

            {/* Company cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {companies.map(company => (
                    <div
                        key={company.id}
                        className="bg-white rounded-xl border p-6 hover:shadow-md transition"
                    >

                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                            <span className="text-blue-700 font-bold text-lg">
                                {company.name.charAt(0)}
                            </span>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900">
                            {company.name}
                        </h2>

                        <p className="text-gray-500 mt-2">
                            {company.location || "Location not specified"}
                        </p>

                        {company.website && (
                            <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-4 text-blue-600 hover:text-blue-800"
                            >
                                Visit website →
                            </a>
                        )}

                    </div>
                ))}

            </div>

        </div>
    );
}

export default Companies;