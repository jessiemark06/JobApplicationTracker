import { NavLink } from "react-router-dom";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
    Activity,
    LayoutDashboard,
    Building2,
    BriefcaseBusiness,
    ClipboardList,
    LogOut,
    Users,
    ChartNoAxesCombined,
    CalendarDays,
    UserRound,
    Bell,
    Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function Sidebar({ isOpen, onClose }) {

    const { token, user, logout } = useAuth();
    const location = useLocation();
    const isAdmin = user?.email?.toLowerCase() === "jessiemarkbaronda06@gmail.com";
    const [logoutOpen, setLogoutOpen] = useState(false);

    const handleNavigation = () => {
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/logout`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok && response.status !== 401) {
                throw new Error("Could not notify the server about logout.");
            }

            logout();
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
            logout();
            window.location.href = "/";
        }
    };

    return (
        <aside
            className={`
                fixed
                inset-y-0
                left-0
                shrink-0
                h-screen
                overflow-y-auto
                bg-slate-900
                text-white
                transition-[width,transform]
                duration-300
                z-40
                flex
                flex-col
                transition-[width,transform]
                md:sticky
                md:top-0
                md:translate-x-0
                ${isOpen ? "w-72 p-6 translate-x-0" : "w-20 p-3 -translate-x-full md:translate-x-0"}
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

                    <BriefcaseBusiness
                        aria-hidden="true"
                        size={24}
                        className="shrink-0"
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
            <nav className="space-y-2" onClick={handleNavigation}>

                {!isAdmin && (
                <>
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

      <NavLink
                    to="/interviews"
                    className={({ isActive }) => `
                        flex items-center px-4 py-3 rounded-lg transition
                        ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                        ${!isOpen ? "justify-center" : ""}
                    `}
                    title={!isOpen ? "Interviews & Events" : ""}
                >
                    <CalendarDays size={20} />
                    {isOpen && <span className="ml-3">Interviews &amp; Events</span>}
                </NavLink>


                <NavLink
                    to="/career-tools"
                    className={({ isActive }) => `
                        flex items-center
                        px-4 py-3
                        rounded-lg
                        transition
                        ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                        ${!isOpen ? "justify-center" : ""}
                    `}
                    title={!isOpen ? "Career tools" : ""}
                >
                    <ChartNoAxesCombined size={20} />
                    {isOpen && <span className="ml-3">Career tools</span>}
                </NavLink>

          
                <NavLink
                    to="/notifications"
                    className={({ isActive }) => `
                        flex items-center px-4 py-3 rounded-lg transition
                        ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                        ${!isOpen ? "justify-center" : ""}
                    `}
                    title={!isOpen ? "Notifications" : ""}
                >
                    <Bell size={20} />
                    {isOpen && <span className="ml-3">Notifications</span>}
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) => `
                        flex items-center px-4 py-3 rounded-lg transition
                        ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                        ${!isOpen ? "justify-center" : ""}
                    `}
                    title={!isOpen ? "Profile & settings" : ""}
                >
                    <UserRound size={20} />
                    {isOpen && <span className="ml-3">Profile</span>}
                </NavLink>
                </>
                )}

                {isAdmin && (
                    <>
                    <NavLink
                            to="/admin?tab=overview"
                            className={() => `
                            flex items-center
                            px-4 py-3
                            rounded-lg
                            transition
                            ${location.search === "?tab=overview" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                            ${!isOpen ? "justify-center" : ""}
                        `}
                        title={!isOpen ? "Admin overview" : ""}
                    >
                        <Activity size={20} />
                        {isOpen && <span className="ml-3">Admin overview</span>}
                    </NavLink>
                    <NavLink
                        to="/admin?tab=users"
                        className={() => `flex items-center px-4 py-3 rounded-lg transition ${location.search === "?tab=users" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"} ${!isOpen ? "justify-center" : ""}`}
                        title={!isOpen ? "User management" : ""}
                    >
                        <Users size={20} />
                        {isOpen && <span className="ml-3">User management</span>}
                    </NavLink>
                    <NavLink
                        to="/admin?tab=settings"
                        className={() => `flex items-center px-4 py-3 rounded-lg transition ${location.search === "?tab=settings" ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"} ${!isOpen ? "justify-center" : ""}`}
                        title={!isOpen ? "System settings" : ""}
                    >
                        <Settings size={20} />
                        {isOpen && <span className="ml-3">System settings</span>}
                    </NavLink>
                    </>
                )}

            </nav>

            {/* Logout */}
            <div className="mt-auto pt-6">

                <button
                    onClick={() => setLogoutOpen(true)}
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

            {logoutOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="logout-title">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-900 shadow-2xl">
                        <h2 id="logout-title" className="text-lg font-semibold">Log out of JobTrack?</h2>
                        <p className="mt-2 text-sm text-gray-600">You will need to sign in again to access your account.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setLogoutOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="button" onClick={handleLogout} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Log out</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </aside>
    );
}

export default Sidebar;