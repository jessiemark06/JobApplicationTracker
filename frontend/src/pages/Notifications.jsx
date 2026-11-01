import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/PageLoader";

const filters = [
    ["all", "All"], ["unread", "Unread"], ["interviews", "Interviews"], ["reminders", "Reminders"],
];

function Notifications() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [filter, setFilter] = useState("all");
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
        const response = await fetch(`${API_BASE_URL}/notifications?filter=${filter}&page=${page}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load notifications.");
        setNotifications(data.data || []);
        setLastPage(data.last_page || 1);
        } finally {
            setLoading(false);
        }
    }, [token, filter, page]);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                await loadNotifications();
            } catch (loadError) {
                setError(loadError.message);
            }
        }
        fetchNotifications();
    }, [loadNotifications]);

    const request = async (path, method = "POST") => {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not update notification.");
        return data;
    };

    const markAllRead = async () => {
        try {
            await request("/notifications/read-all");
            await loadNotifications();
        } catch (requestError) { setError(requestError.message); }
    };

    const openNotification = async (notification) => {
        try {
            if (!notification.read_at) await request(`/notifications/${notification.id}/read`);
            const destination = notification.destination
                || (notification.recruitment_event_id ? `/interviews?event_id=${notification.recruitment_event_id}` : `/applications/view/${notification.application_id}`);
            if (destination) navigate(destination);
        } catch (requestError) { setError(requestError.message); }
    };

    const dismiss = async (id) => {
        try {
            await request(`/notifications/${id}`, "DELETE");
            await loadNotifications();
        } catch (requestError) { setError(requestError.message); }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-5">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div><h1 className="text-2xl font-semibold text-gray-900">Notifications</h1><p className="mt-1 text-sm text-gray-500">Updates created from information entered in your tracker.</p></div>
                <button type="button" onClick={markAllRead} className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm">Mark all as read</button>
            </header>
            {error && <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <nav aria-label="Notification filters" className="flex flex-wrap gap-2">{filters.map(([value, label]) => <button key={value} type="button" onClick={() => { setPage(1); setFilter(value); }} aria-pressed={filter === value} className={`rounded-full px-4 py-2 text-sm ${filter === value ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-700"}`}>{label}</button>)}</nav>
            {loading ? <PageLoader message="Loading notifications..." /> : <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                {notifications.map((item) => <li key={item.id} className={`flex items-start gap-3 p-4 ${item.read_at ? "" : "bg-blue-50/60"}`}>
                    <span aria-label={item.read_at ? "Read" : "Unread"} className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${item.read_at ? "bg-gray-300" : "bg-blue-600"}`} />
                    <button type="button" onClick={() => openNotification(item)} className="min-w-0 flex-1 text-left">
                        <span className="block font-medium text-gray-900">{item.title}</span>
                        <span className="mt-1 block text-sm text-gray-600">{item.message}</span>
                        <span className="mt-1 block text-xs text-gray-500">{item.application?.company?.name ? `${item.application.company.name} · ` : ""}{new Date(item.created_at).toLocaleString()}</span>
                    </button>
                    <button type="button" onClick={() => dismiss(item.id)} className="cursor-pointer text-xs text-gray-500 hover:text-red-700">Dismiss</button>
                </li>)}
                {!notifications.length && <li className="p-8 text-center text-sm text-gray-500">No notifications in this view.</li>}
            </ul>}
            {lastPage > 1 && <div className="flex items-center justify-center gap-4"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50">Previous</button><span className="text-sm text-gray-500">Page {page} of {lastPage}</span><button type="button" disabled={page >= lastPage} onClick={() => setPage((value) => value + 1)} className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50">Next</button></div>}
        </div>
    );
}

export default Notifications;
