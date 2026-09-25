import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen((currentState) => !currentState);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} />

            <div className="flex min-w-0 flex-1 flex-col">
                        <Topbar
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
            />

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;