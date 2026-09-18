function Sidebar() {
    return (
        <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">

            {/* Logo */}
            <div className="mb-10">
                <h1 className="text-2xl font-bold">
                    JobTrack
                </h1>

                <p className="text-sm text-slate-400 mt-1">
                    Job Application Tracker
                </p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">

                <a
                    href="#"
                    className="block px-4 py-3 rounded-lg bg-slate-800"
                >
                    Dashboard
                </a>

                <a
                    href="#"
                    className="block px-4 py-3 rounded-lg hover:bg-slate-800"
                >
                    Companies
                </a>

                <a
                    href="#"
                    className="block px-4 py-3 rounded-lg hover:bg-slate-800"
                >
                    Applications
                </a>

            </nav>

        </aside>
    );
}

export default Sidebar;