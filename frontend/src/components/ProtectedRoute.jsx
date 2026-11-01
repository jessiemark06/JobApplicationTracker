import { Navigate } from "react-router-dom";
import {useAuth} from "../context/AuthContext";

function ProtectedRoute({ children }) {
      const { token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50" role="status">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-slate-900" />
                    Checking your session...
                </div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;