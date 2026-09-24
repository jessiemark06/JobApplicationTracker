 
import { Link } from "react-router-dom";

function Landing() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">

            {/* Navigation */}
            <nav className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            JobTrack
                        </h1>
                        <p className="text-xs text-gray-500">
                            Job Application Tracker
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="mx-auto max-w-7xl px-6 py-20">
                <div className="grid items-center gap-12 lg:grid-cols-2">

                    <div>
                        <span className="mb-4 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                            Job Application Tracker
                        </span>

                        <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
                            Keep your job applications
                            <span className="text-gray-500">
                                {" "}organized in one place.
                            </span>
                        </h2>

                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
                            JobTrack helps you manage companies, track your
                            applications, monitor application status, and stay
                            organized throughout your job search.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                               to="/login"
                                className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Start Tracking
                            </Link>
 
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    Applications
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Your application overview
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
                                12 Total
                            </div>
                        </div>

                        <div className="space-y-3">

                            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Junior Web Developer
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Tech Company
                                    </p>
                                </div>

                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                                    Applied
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Junior Full-Stack Developer
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Software Solutions
                                    </p>
                                </div>

                                <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-600">
                                    Interview
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Frontend Developer
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Digital Agency
                                    </p>
                                </div>

                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                                    Offer
                                </span>
                            </div>

                        </div>
                    </div>

                </div>
            </section>

            {/* Features */}
            <section className="border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-16">

                    <div className="mb-10">
                        <h3 className="text-2xl font-bold text-gray-900">
                            Everything you need to stay organized
                        </h3>

                        <p className="mt-2 text-gray-500">
                            Keep your job search information organized and easy
                            to manage.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                                +
                            </div>

                            <h4 className="font-semibold text-gray-900">
                                Track Applications
                            </h4>

                            <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                Record the jobs you've applied for and keep
                                important application information in one place.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                                ✓
                            </div>

                            <h4 className="font-semibold text-gray-900">
                                Monitor Status
                            </h4>

                            <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                Keep track of where each application is in your
                                job search process.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                                #
                            </div>

                            <h4 className="font-semibold text-gray-900">
                                Organize Companies
                            </h4>

                            <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                Store company information so you can easily
                                manage and review your job opportunities.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="border-t border-gray-200 bg-gray-50">
                <div className="mx-auto max-w-4xl px-6 py-16 text-center">

                    <h3 className="text-3xl font-bold text-gray-900">
                        Ready to organize your job search?
                    </h3>

                    <p className="mx-auto mt-3 max-w-xl text-gray-500">
                        Start managing your applications and keep your job
                        search organized with JobTrack.
                    </p>

                    <Link
                        to="/register"
                        className="mt-7 inline-block rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Create Your Account
                    </Link>

                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <p className="text-sm text-gray-500">
                        © 2026 JobTrack
                    </p>

                    <p className="text-sm text-gray-400">
                        Job Application Tracker
                    </p>
                </div>
            </footer>

        </div>
    );
}

export default Landing; 