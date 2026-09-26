import { useNavigate } from "react-router-dom";
import { ArrowRight, ClipboardList } from "lucide-react";

function Applications() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Keep your opportunities and hiring progress in one place.
                </p>
            </div>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex flex-col gap-1 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-900">Application pipeline</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Roles, stages, interview dates, and outcomes
                        </p>
                    </div>
                    <span className="mt-2 inline-flex w-fit items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 sm:mt-0">
                        Not connected
                    </span>
                </div>

                <div className="px-5 py-16 text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <ClipboardList size={26} aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-gray-900">
                        Application records aren&apos;t available yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
                        The current backend supports company profiles, but it does not yet store job applications. Company records will remain available in your directory.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/companies")}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        View companies
                        <ArrowRight size={16} />
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Applications;