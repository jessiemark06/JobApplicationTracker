import Sidebar from "./sidebar";
import Topbar from "./topbar";

function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* Sidebar */}
            <Sidebar />

            {/* Right side */}
            <div className="flex-1 flex flex-col">

                {/* Topbar */}
                <Topbar />

                {/* Page content */}
                <main className="flex-1 p-6">
                    {children}
                </main>

            </div>

        </div>
    );
}

export default Layout;