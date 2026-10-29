import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

function Topbar({ toggleSidebar }) {
    const profileRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [showProfile, setShowProfile] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadUnreadCount = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            if (!response.ok) return;
            const data = await response.json();
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error("Could not load notification count:", error);
        }
    }, [token]);

    useEffect(() => {
        const initialLoad = window.setTimeout(loadUnreadCount, 0);
        const refreshInterval = window.setInterval(loadUnreadCount, 60000);
        window.addEventListener("focus", loadUnreadCount);
        return () => {
            window.clearTimeout(initialLoad);
            window.clearInterval(refreshInterval);
            window.removeEventListener("focus", loadUnreadCount);
        };
    }, [loadUnreadCount]);

    const getInitial = () => {
        if (!user?.name) {
            return "?";
        }

        return user.name.charAt(0).toUpperCase();
    };

    useEffect(() => {
            const handleClickOutside = (event) => {
                if (
                    profileRef.current &&
                    !profileRef.current.contains(event.target)
                ) {
                    setShowProfile(false);
                }
            };

                document.addEventListener("mousedown", handleClickOutside);

                return () => {
                    document.removeEventListener("mousedown", handleClickOutside);
                };
            }, []);


    const getPageTitle = () => {

        if (location.pathname === "/dashboard") {
            return "Dashboard";
        }

        if (location.pathname === "/companies") {
            return "Companies";
        }

        if (location.pathname === "/companies/create") {
            return "Add Company";
        }

        if (location.pathname.startsWith("/companies/edit/")) {
            return "Edit Company";
        }

        if (location.pathname.startsWith("/companies/view/")) {
            return "Company Details";
        }

        if (location.pathname === "/applications") {
            return "Applications";
        }

        if (location.pathname === "/career-tools") {
            return "Career tools";
        }

        if (location.pathname === "/interviews") return "Interviews & Events";
        if (location.pathname === "/notifications") return "Notifications";
        if (location.pathname === "/profile") return "Profile & settings";

        if (location.pathname === "/applications/create") {
            return "Add Application";
        }

        if (location.pathname.startsWith("/applications/edit/")) {
            return "Edit Application";
        }

        if (location.pathname.startsWith("/applications/view/")) {
            return "Application Details";
        }

        return "JobTrack";
    };

    return (
        <header
            className="
                sticky
                top-0
                z-10
                h-16
                shrink-0
                bg-white
                border-b
                border-gray-200
                flex
                items-center
                justify-between
                px-6
            "
        >

            {/* Left side */}
            <div className="flex items-center gap-4">

                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="
                        p-2
                        rounded-lg
                        text-slate-900
                        hover:bg-slate-100
                        transition
                        cursor-pointer
                    "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                </button>

                <h2 className="text-lg font-semibold text-gray-800">
                    {getPageTitle()}
                </h2>

            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                <button type="button" onClick={() => navigate("/notifications")} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100">
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs leading-5 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
                </button>
                <div ref={profileRef} className="relative">

                {/* User Avatar */}
                <button
                    type="button"
                    onClick={() => setShowProfile(!showProfile)}
                    className="
                        w-9
                        h-9
                        rounded-full
                        bg-slate-800
                        text-white
                        flex
                        items-center
                        justify-center
                        font-semibold
                        cursor-pointer
                        hover:bg-slate-700
                        transition
                    "
                >
                    {getInitial()}
                </button>

                {/* Profile Modal */}
                {showProfile && (
                    <div
                        className="
                            absolute
                            right-0
                            top-12
                            w-72
                            bg-white
                            border
                            border-gray-200
                            rounded-xl
                            shadow-lg
                            p-5
                            z-50
                        "
                    >

                        {/* User Header */}
                        <div className="flex items-center gap-3 pb-4 border-b">

                            <div
                                className="
                                    w-12
                                    h-12
                                    rounded-full
                                    bg-slate-800
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                    font-semibold
                                    text-lg
                                "
                            >
                                {getInitial()}
                            </div>

                            <div>
                                <p className="font-semibold text-gray-800">
                                    {user?.name}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {user?.email}
                                </p>
                            </div>

                        </div>

                        {/* User Details */}
                        <div className="py-4 space-y-3">

                            <div>
                                <p className="text-xs text-gray-500">
                                    Name
                                </p>

                                <p className="text-sm font-medium text-gray-800">
                                    {user?.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">
                                    Email
                                </p>

                                <p className="text-sm font-medium text-gray-800">
                                    {user?.email}
                                </p>
                            </div>

                        </div>
                        <button type="button" onClick={() => { setShowProfile(false); navigate("/profile"); }} className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200">Profile &amp; settings</button>

                    </div>
                )}

            </div>
            </div>

        </header>
    );
}

export default Topbar;