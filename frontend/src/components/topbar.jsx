function Topbar() {
    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">

            <div>
                <h2 className="text-lg font-semibold text-gray-800">
                    Job Application Tracker
                </h2>
            </div>

            <div className="flex items-center gap-4">

                <span className="text-sm text-gray-600">
                    Jessie
                </span>

                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    J
                </div>

            </div>

        </header>
    );
}

export default Topbar;