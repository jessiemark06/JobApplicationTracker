function Topbar() {

    const handleLogout = async () => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/logout",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (response.ok) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
 
    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">

            <div>
                <h2 className="text-lg font-semibold text-gray-800">
                    Job Application Tracker
                </h2>
            </div>

            <div className="flex items-center gap-4">
 

                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    J
                </div>

                    <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-red-600 transition"
                >
                    Logout
                </button>
            </div>

        </header>
    );
}

export default Topbar;