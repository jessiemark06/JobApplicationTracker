import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowDown,
    ArrowRight,
    BellRing,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    ChartNoAxesCombined,
    Check,
    CheckCircle2,
    ClipboardList,
    Menu,
    X,
} from "lucide-react";

const applications = [
    { role: "Marketing Coordinator", company: "Northstar Studio", status: "Interview", tone: "bg-blue-50 text-blue-700" },
    { role: "Administrative Assistant", company: "Fieldwork Labs", status: "Applied", tone: "bg-gray-100 text-gray-700" },
    { role: "Customer Success Associate", company: "Common Ground", status: "Screening", tone: "bg-amber-50 text-amber-700" },
];

const features = [
    {
        icon: ClipboardList,
        title: "Application tracking",
        description: "Keep role details, application dates, contacts, and status history together in one organized place.",
    },
    {
        icon: CalendarDays,
        title: "Interviews & events",
        description: "Schedule interviews and recruitment events, review their history, and keep upcoming steps in view.",
    },
    {
        icon: ChartNoAxesCombined,
        title: "Application analytics",
        description: "Review your pipeline and application outcomes to understand how your search is progressing.",
    },
    {
        icon: CheckCircle2,
        title: "Skills & job requirements",
        description: "Compare the skills you have with role requirements and keep your learning priorities visible.",
    },
    {
        icon: BriefcaseBusiness,
        title: "Career tools",
        description: "Keep follow-ups, company research, and application documents close to the opportunities they support.",
    },
    {
        icon: BellRing,
        title: "Follow-up reminders",
        description: "Get in-app reminders for upcoming events and follow-ups so important next steps are easier to remember.",
    },
];

const steps = [
    {
        number: "01",
        title: "Add companies and applications",
        description: "Save the roles you are considering, along with company details and the information you need later.",
    },
    {
        number: "02",
        title: "Track progress and prepare",
        description: "Update each application as it moves forward, schedule interviews, and organize follow-ups.",
    },
    {
        number: "03",
        title: "Review and refine your search",
        description: "Use your pipeline and analytics to reflect on progress and decide where to focus next.",
    },
];

function Landing() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 12);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (event, sectionId) => {
        event.preventDefault();
        setMenuOpen(false);

        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                    : "smooth",
                block: "start",
            });
        }
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-white font-sans text-gray-900">
            <header className={`fixed inset-x-0 top-0 z-50 border-b bg-white/90 backdrop-blur-xl transition-shadow duration-300 ${isScrolled ? "border-gray-200 shadow-lg shadow-slate-900/10" : "border-transparent"}`}>
                <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
                    <Link to="/" className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <BriefcaseBusiness size={21} aria-hidden="true" />
                        </span>
                        <span>
                            <span className="block text-lg font-bold tracking-tight text-slate-900">JobTrack</span>
                            <span className="block text-xs text-gray-500">Job Application Tracker</span>
                        </span>
                    </Link>

                    <div className="hidden items-center gap-7 md:flex">
                        <a href="#features" onClick={(event) => scrollToSection(event, "features")} className="text-sm font-medium text-gray-600 transition hover:text-slate-900 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900">Features</a>
                        <a href="#how-it-works" onClick={(event) => scrollToSection(event, "how-it-works")} className="text-sm font-medium text-gray-600 transition hover:text-slate-900 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900">How it works</a>
                        <a href="#about" onClick={(event) => scrollToSection(event, "about")} className="text-sm font-medium text-gray-600 transition hover:text-slate-900 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900">About</a>
                    </div>

                    <div className="hidden items-center gap-2 md:flex">
                        <Link to="/login" className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Log in</Link>
                        <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
                            Get started <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>

                    <button
                        type="button"
                        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-900 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 md:hidden"
                    >
                        {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
                    </button>
                </nav>

                {menuOpen && (
                    <div id="mobile-navigation" className="border-t border-gray-200 bg-white px-5 py-4 shadow-lg md:hidden">
                        <div className="mx-auto flex max-w-7xl flex-col gap-1">
                            <a href="#features" onClick={(event) => scrollToSection(event, "features")} className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900">Features</a>
                            <a href="#how-it-works" onClick={(event) => scrollToSection(event, "how-it-works")} className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900">How it works</a>
                            <a href="#about" onClick={(event) => scrollToSection(event, "about")} className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900">About</a>
                            <div className="mt-2 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                                <Link to="/login" onClick={() => setMenuOpen(false)} className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Log in</Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)} className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Get started</Link>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="pt-[76px]">
                <section className="relative isolate overflow-hidden bg-gray-50">
                    <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl motion-safe:animate-pulse" />
                    <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl motion-safe:animate-pulse [animation-delay:1.5s]" />
                    <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-24">
                        <div className="motion-safe:animate-fade-in-up">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm">
                                <BriefcaseBusiness size={16} aria-hidden="true" />
                                <span className="h-2 w-2 rounded-full bg-blue-600 motion-safe:animate-pulse" />
                                A clearer way to manage your search
                            </div>
                            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
                                Make your next career move with a plan.
                            </h1>
                            <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
                                Organize applications, prepare for interviews, and keep your job search moving forward—all in one focused workspace.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link to="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
                                    Get started <ArrowRight size={17} aria-hidden="true" />
                                </Link>
                                <a href="#features" onClick={(event) => scrollToSection(event, "features")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-gray-400 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">
                                    Explore features <ArrowDown size={16} aria-hidden="true" />
                                </a>
                            </div>
                            <p className="mt-5 text-sm text-gray-500">
                                Already have an account? <Link to="/login" className="font-semibold text-slate-900 underline decoration-gray-300 underline-offset-4 hover:decoration-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Log in</Link>
                            </p>
                        </div>

                        <div aria-label="Illustrative JobTrack application dashboard preview" className="mx-auto w-full max-w-2xl motion-safe:animate-fade-in-up [animation-delay:150ms]">
                            <div className="motion-safe:animate-float overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl shadow-slate-900/10">
                                <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-slate-900 px-4 py-4 text-white sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                                            <BriefcaseBusiness size={18} aria-hidden="true" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold">Dashboard</p>
                                            <p className="mt-0.5 text-xs text-gray-300">Your job search at a glance</p>
                                        </div>
                                    </div>
                                    <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-100 sm:inline-flex">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-300" /> Your workspace
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
                                    <PreviewStat icon={Building2} label="Companies" />
                                    <PreviewStat icon={ClipboardList} label="Applications" />
                                    <PreviewStat icon={CalendarDays} label="Next event" className="col-span-2 sm:col-span-1" />
                                </div>
                                <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <div>
                                            <h2 className="text-sm font-semibold text-slate-900">Application pipeline</h2>
                                            <p className="mt-1 text-xs text-gray-500">Keep each opportunity and next step together.</p>
                                        </div>
                                        <span className="hidden rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 sm:inline-flex">View applications</span>
                                    </div>
                                    <div className="overflow-hidden rounded-lg border border-gray-200">
                                        {applications.map((application, index) => (
                                            <div key={application.role} className={`flex items-center justify-between gap-3 px-3 py-3 sm:px-4 ${index > 0 ? "border-t border-gray-100" : ""}`}>
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-slate-700">
                                                        {application.company.split(" ").map((word) => word[0]).join("").slice(0, 2)}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">{application.role}</p>
                                                        <p className="mt-0.5 truncate text-xs text-gray-500">{application.company}</p>
                                                    </div>
                                                </div>
                                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium sm:text-xs ${application.tone}`}>{application.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-xs text-blue-900 sm:text-sm">
                                        <CalendarDays size={16} className="shrink-0 text-blue-700" aria-hidden="true" />
                                        <span>Interviews and follow-ups stay connected to your applications.</span>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 text-center text-xs text-gray-500">A preview of the tools available in your JobTrack workspace.</p>
                        </div>
                    </div>
                </section>

                <section id="features" className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8">
                        <SectionHeading eyebrow="Tools for your job search" title="Everything you need to stay organized" description="Keep the moving parts of your search connected, from the first application to the next follow-up." />
                        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map(({ icon: Icon, title, description }, index) => (
                                <article key={title} style={{ animationDelay: `${index * 70}ms` }} className="group motion-safe:animate-fade-in-up rounded-xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/10 sm:p-7">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-slate-900 transition group-hover:bg-slate-900 group-hover:text-white">
                                        <Icon size={21} aria-hidden="true" />
                                    </span>
                                    <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="scroll-mt-24 border-y border-gray-200 bg-gray-50 py-16 sm:py-20 lg:py-24">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8">
                        <SectionHeading eyebrow="A simple workflow" title="From scattered details to a clear next step" description="Build a repeatable routine around your job search, one small step at a time." />
                        <ol className="mt-10 grid gap-4 md:grid-cols-3">
                            {steps.map((step, index) => (
                                <li key={step.number} style={{ animationDelay: `${index * 100}ms` }} className="motion-safe:animate-fade-in-up rounded-xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-7">
                                    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-900 px-2 text-sm font-semibold text-white">{step.number}</span>
                                    <h3 className="mt-5 text-base font-semibold text-slate-900">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-gray-600">{step.description}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section id="about" className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
                    <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Built for early career journeys</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Make room for the work that moves you forward.</h2>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
                            <p className="text-base leading-7 text-gray-700">
                                When you are a student, fresh graduate, or starting your career, each application can bring new details to manage. JobTrack gives you a practical place to organize opportunities, prepare for conversations, and reflect on your progress—without losing sight of your next step.
                            </p>
                            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                                <Benefit>Keep job details easy to find</Benefit>
                                <Benefit>Prepare for interviews with context</Benefit>
                                <Benefit>Remember follow-ups and events</Benefit>
                                <Benefit>Review your search in one place</Benefit>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:pb-24">
                    <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-slate-900 px-6 py-12 text-center sm:px-12 sm:py-16">
                        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">Give your job search a little more structure.</h2>
                        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-300">Create your JobTrack account and bring your opportunities, interviews, and follow-ups together.</p>
                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link to="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                                Get started <ArrowRight size={17} aria-hidden="true" />
                            </Link>
                            <Link to="/login" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Log in</Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
                    <Link to="/" className="inline-flex w-fit items-center gap-2 rounded-lg text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white"><BriefcaseBusiness size={16} aria-hidden="true" /></span>
                        <span className="font-bold tracking-tight">JobTrack</span>
                    </Link>
                    <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                        <a href="#features" onClick={(event) => scrollToSection(event, "features")} className="text-gray-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Features</a>
                        <a href="#how-it-works" onClick={(event) => scrollToSection(event, "how-it-works")} className="text-gray-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">How it works</a>
                        <Link to="/login" className="text-gray-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Log in</Link>
                        <Link to="/register" className="text-gray-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Create account</Link>
                    </nav>
                    <p className="text-xs text-gray-500">© {new Date().getFullYear()} JobTrack</p>
                </div>
            </footer>
        </div>
    );
}

function PreviewStat({ icon: Icon, label, className = "" }) {
    return (
        <div className={`rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4 ${className}`}>
            <div className="flex items-center gap-2 text-slate-700">
                <Icon size={17} aria-hidden="true" />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-500">Your {label.toLowerCase()}</p>
        </div>
    );
}

function SectionHeading({ eyebrow, title, description }) {
    return (
        <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
            <p className="mt-4 text-base leading-7 text-gray-600">{description}</p>
        </div>
    );
}

function Benefit({ children }) {
    return (
        <li className="flex items-start gap-2 text-sm leading-6 text-gray-700">
            <Check size={17} className="mt-0.5 shrink-0 text-blue-700" aria-hidden="true" />
            <span>{children}</span>
        </li>
    );
}

export default Landing;
