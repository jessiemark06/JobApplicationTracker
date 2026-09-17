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
            <h1>Companies</h1>

            {companies.map(company => (
                <div key={company.id}>
                    <h2>{company.name}</h2>
                    <p>{company.location}</p>
                </div>
            ))}
        </div>
    );
}

export default Companies;