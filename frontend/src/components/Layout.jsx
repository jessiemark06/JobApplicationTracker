import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(
        () => window.innerWidth >= 768 && localStorage.getItem("sidebarOpen") !== "false"
        );

    const toggleSidebar = () => {
        setSidebarOpen((currentState) => {
            const nextState = !currentState;
            localStorage.setItem("sidebarOpen", String(nextState));
            return nextState;
        });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-slate-950/40 md:hidden"
                />
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar
                    toggleSidebar={toggleSidebar}
                />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;