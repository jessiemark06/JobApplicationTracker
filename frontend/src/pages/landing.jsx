
import { Link } from "react-router-dom";
import {
    ArrowRight,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    ClipboardList,
    Clock3,
    TrendingUp,
    ChartNoAxesCombined,
    Sparkles,
} from "lucide-react";

const applications = [
    {
        role: "Frontend Developer",
        company: "Tech Solutions Inc.",
        initials: "TS",
        color: "bg-indigo-100 text-indigo-700",
        status: "Interview",
        statusStyle: "bg-amber-50 text-amber-700 ring-amber-600/20",
        date: "Oct 20, 2026",
    },
    {
        role: "Junior Software Engineer",
        company: "Digital Innovations",
        initials: "DI",
        color: "bg-sky-100 text-sky-700",
        status: "Applied",
        statusStyle: "bg-blue-50 text-blue-700 ring-blue-600/20",
        date: "Oct 18, 2026",
    },
    {
        role: "Web Developer",
        company: "Creative Labs",
        initials: "CL",
        color: "bg-emerald-100 text-emerald-700",
        status: "Offer",
        statusStyle: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        date: "Oct 16, 2026",
    },
];

function Landing() {
    return (
        <div className="min-h-screen overflow-hidden bg-white font-sans text-slate-900">

            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

                    <Link to="/" className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                            <BriefcaseBusiness size={22} />
                        </div>

                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                                JobTrack<span className="text-indigo-600">.</span>
                            </h1>
                            <p className="text-xs font-medium text-slate-500">
                                Your career, organized.
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
                        >
                            Log in
                        </Link>

                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 sm:px-5"
                        >
                            Get started
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <main>
                <section className="relative">
                    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
                        <div className="absolute -right-40 -top-32 h-96 w-96 rounded-full bg-indigo-100/70 blur-3xl" />
                        <div className="absolute -left-40 top-48 h-80 w-80 rounded-full bg-sky-100/60 blur-3xl" />
                    </div>

                    <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">

                        {/* Hero copy */}
                        <div>
                            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-2 text-sm font-semibold text-indigo-700">
                                <Sparkles size={16} />
                                A smarter way to job hunt
                            </div>

                            <h2 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                Your next opportunity,
                                <span className="mt-2 block text-indigo-600">
                                    all in one place.
                                </span>
                            </h2>

                            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                                Job searching is easier when everything is
                                organized. Track applications, manage company
                                details, and keep every opportunity moving
                                forward with JobTrack.
                            </p>

                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-1 hover:bg-indigo-700"
                                >
                                    Start tracking for free
                                    <ArrowRight size={18} />
                                </Link>

                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"
                                >
                                    I already have an account
                                </Link>
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle2 size={17} className="text-emerald-500" />
                                    Organized applications
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle2 size={17} className="text-emerald-500" />
                                    Easy status tracking
                                </span>
                            </div>
                        </div>

                        {/* Dashboard preview */}
                        <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
                            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-200/60 via-white to-sky-200/60 blur-2xl" />

                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

                                {/* Dashboard header */}
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                                <BriefcaseBusiness size={18} />
                                            </div>
                                            <h3 className="font-bold text-slate-900">
                                                Dashboard
                                            </h3>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            Here's your job search overview
                                        </p>
                                    </div>

                                    <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                        ● Active
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 p-4 sm:gap-4 sm:p-6">
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                                        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                                            <ClipboardList size={17} />
                                        </div>
                                        <p className="text-2xl font-extrabold text-slate-900">
                                            12
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Applications
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                                        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                            <Clock3 size={17} />
                                        </div>
                                        <p className="text-2xl font-extrabold text-slate-900">
                                            4
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            In progress
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                                        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                            <TrendingUp size={17} />
                                        </div>
                                        <p className="text-2xl font-extrabold text-slate-900">
                                            2
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Offers
                                        </p>
                                    </div>
                                </div>

                                {/* Application list */}
                                <div className="px-4 pb-5 sm:px-6 sm:pb-7">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-900">
                                                Recent applications
                                            </h4>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Keep an eye on your opportunities
                                            </p>
                                        </div>
                                        <ClipboardList
                                            size={19}
                                            className="text-slate-400"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        {applications.map((app) => (
                                            <div
                                                key={app.role}
                                                className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/30 sm:gap-4 sm:p-4"
                                            >
                                                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${app.color}`}>
                                                    {app.initials}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-bold text-slate-800">
                                                        {app.role}
                                                    </p>
                                                    <p className="mt-1 truncate text-xs text-slate-500">
                                                        {app.company}
                                                    </p>
                                                    <p className="mt-1.5 text-[11px] text-slate-400">
                                                        {app.date}
                                                    </p>
                                                </div>

                                                <span className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-bold ring-1 ring-inset sm:text-xs ${app.statusStyle}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-700">
                                        <ChartNoAxesCombined size={16} />
                                        Your job search, at a glance
                                    </div>
                                </div>
                            </div>

                            {/* Floating company card */}
                            <div className="absolute -left-4 top-24 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl shadow-slate-900/10 sm:flex lg:-left-10">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                    <CheckCircle2 size={21} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">
                                        Stay organized
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        One step at a time
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="border-t border-slate-100 bg-slate-50/70">
                    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">

                        <div className="mx-auto mb-14 max-w-2xl text-center">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                                Everything in one place
                            </span>

                            <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                                Make your job search
                                <span className="text-indigo-600"> less stressful.</span>
                            </h3>

                            <p className="mt-4 leading-7 text-slate-600">
                                Spend less time organizing spreadsheets and
                                more time preparing for your next opportunity.
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            <FeatureCard
                                icon={<ClipboardList size={23} />}
                                number="01"
                                title="Track applications"
                                description="Keep job titles, application dates, and important details organized in one convenient place."
                            />

                            <FeatureCard
                                icon={<ChartNoAxesCombined size={23} />}
                                number="02"
                                title="Monitor progress"
                                description="See which opportunities are applied, in progress, or leading toward an offer."
                            />

                            <FeatureCard
                                icon={<Building2 size={23} />}
                                number="03"
                                title="Manage companies"
                                description="Keep company information connected to your applications for easier follow-ups."
                            />
                        </div>
                    </div>
                </section>

                {/* Call to action */}
                <section className="px-5 py-20 sm:px-8 sm:py-24">
                    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-14 text-center sm:px-12 sm:py-20">
                        <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-36 -left-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

                        <div className="relative">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-indigo-300">
                                <BriefcaseBusiness size={27} />
                            </div>

                            <h3 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Your next opportunity starts with a plan.
                            </h3>

                            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
                                Bring your job applications together and take
                                control of your career journey with JobTrack.
                            </p>

                            <Link
                                to="/register"
                                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-indigo-700 transition hover:-translate-y-1 hover:bg-indigo-50"
                            >
                                Create your account
                                <ArrowRight size={17} />
                            </Link>

                            <p className="mt-4 text-xs text-slate-400">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                                >
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                            <BriefcaseBusiness size={16} />
                        </div>
                        <span className="font-extrabold tracking-tight text-slate-900">
                            JobTrack<span className="text-indigo-600">.</span>
                        </span>
                    </Link>

                    <p className="text-sm text-slate-500">
                        Organize your search. Focus on your future.
                    </p>

                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} JobTrack. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, number, title, description }) {
    return (
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5 sm:p-8">
            <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    {icon}
                </div>
                <span className="text-sm font-bold tracking-widest text-slate-300">
                    {number}
                </span>
            </div>

            <h4 className="mt-6 text-lg font-bold text-slate-900">
                {title}
            </h4>

            <p className="mt-3 text-sm leading-7 text-slate-600">
                {description}
            </p>
        </div>
    );
}

export default Landing;
