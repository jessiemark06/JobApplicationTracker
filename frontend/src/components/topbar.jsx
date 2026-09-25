import { useLocation } from "react-router-dom";

function Topbar({ toggleSidebar, sidebarOpen }) {

const location = useLocation();

    const getPageTitle = () => {
        if (location.pathname === "/") {
            return "Dashboard";
        }

        if (location.pathname === "/companies") {
            return "Companies";
        }

        if (location.pathname === "/applications") {
            return "Applications";
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

                {/* Burger Button */}
                <button
                    type="button"
                    onClick={toggleSidebar}
                    aria-label={
                        sidebarOpen
                            ? "Collapse sidebar"
                            : "Expand sidebar"
                    }
                    aria-expanded={sidebarOpen}
                    className="
                        p-2
                        rounded-lg
                        text-gray-600
                        hover:bg-gray-100
                        hover:text-gray-900
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
                    Dashboard
                </h2>

            </div>

            {/* Right side */}
            <div className="flex items-center">

                <div
                    className="
                        w-9
                        h-9
                        rounded-full
                        bg-blue-600
                        text-white
                        flex
                        items-center
                        justify-center
                        font-semibold
                    "
                >
                    J
                </div>

            </div>

        </header>
    );
}

export default Topbar;