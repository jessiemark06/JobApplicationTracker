import people from "../assets/people.png";

function Sidebar() {
    return (
        <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">

           <div className="mb-10">
                <div className="flex items-center gap-3">
                    <img
                        src={people}
                        alt="JobTrack"
                        className="w-10 h-10 object-contain"
                    />

                    <div>
                        <h1 className="text-2xl font-bold">
                            JobTrack
                        </h1>

                    </div>
                </div>
                
                        <p className="text-sm text-slate-400 mt-1">
                            Job Application Tracker
                        </p>
            </div> 
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