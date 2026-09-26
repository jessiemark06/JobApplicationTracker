import people from "../assets/people.png";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    ClipboardList,
    LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Sidebar({ isOpen }) {

    const { token, logout } = useAuth();

    const handleLogout = async () => {
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
                logout();
                window.location.href = "/";
            }

        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <aside
            className={`
                sticky
                top-0
                shrink-0
                h-screen
                overflow-y-auto
                bg-slate-900
                text-white
                transition-[width]
                duration-300
                z-40
                flex
                flex-col
                ${isOpen ? "w-72 p-6" : "w-20 p-3"}
            `}
        >

            {/* Logo / Brand */}
            <div className="mb-10">

                <div
                    className={`
                        flex items-center
                        ${isOpen ? "gap-3" : "justify-center"}
                    `}
                >

                    <img
                        src={people}
                        alt="JobTrack"
                        className="w-10 h-10 object-contain"
                    />

                    {isOpen && (
                        <div>
                            <h1 className="text-2xl font-bold">
                                JobTrack
                            </h1>
                        </div>
                    )}

                </div>

                {isOpen && (
                    <p className="text-sm text-slate-400 mt-1">
                        Job Application Tracker
                    </p>
                )}

            </div>

            {/* Navigation */}
            <nav className="space-y-2">

                {/* Dashboard */}
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `
                        flex items-center
                        px-4 py-3
                        rounded-lg
                        transition
                        ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                        ${!isOpen ? "justify-center" : ""}
                    `}
                    title={!isOpen ? "Dashboard" : ""}
                >
                    <LayoutDashboard size={20} />

                    {isOpen && (
                        <span className="ml-3">
                            Dashboard
                        </span>
                    )}
                </NavLink>

                {/* Companies */}
                <NavLink
                    to="/companies"
                    end
                    className={({ isActive }) => `
                        flex items-center
                        px-4 py-3
                        rounded-lg
                        transition
                        ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                        ${!isOpen ? "justify-center" : ""}
                    `}
                    title={!isOpen ? "Companies" : ""}
                >
                    <Building2 size={20} />

                    {isOpen && (
                        <span className="ml-3">
                            Companies
                        </span>
                    )}
                </NavLink>

                {/* Applications */}
                <NavLink
                    to="/applications"
                    className={({ isActive }) => `
                        flex items-center
                        px-4 py-3
                        rounded-lg
                        transition
                        ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                        ${!isOpen ? "justify-center" : ""}
                    `}
                    title={!isOpen ? "Applications" : ""}
                >
                    <ClipboardList size={20} />

                    {isOpen && (
                        <span className="ml-3">
                            Applications
                        </span>
                    )}
                </NavLink>

            </nav>

            {/* Logout */}
            <div className="mt-auto pt-6">

                <button
                    onClick={handleLogout}
                    className={`
                        w-full
                        flex
                        items-center
                        px-4
                        py-3
                        rounded-lg
                        text-slate-300
                        hover:bg-red-500/10
                        hover:text-red-400
                        transition
                        cursor-pointer
                        ${!isOpen ? "justify-center" : ""}
                    `}
                    title={!isOpen ? "Logout" : ""}
                >
                    <LogOut size={20} />

                    {isOpen && (
                        <span className="ml-3">
                            Logout
                        </span>
                    )}
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;