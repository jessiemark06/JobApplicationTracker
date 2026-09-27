import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Topbar({ toggleSidebar, sidebarOpen }) {
    const profileRef = useRef(null);
    const location = useLocation();
    const { user } = useAuth();
    const [showProfile, setShowProfile] = useState(false);

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
            <div
                ref={profileRef}
                className="relative"
            >

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

                    </div>
                )}

            </div>

        </header>
    );
}

export default Topbar;