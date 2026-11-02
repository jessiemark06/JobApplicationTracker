import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Activity,
    Check,
    ClipboardList,
    Pencil,
    Search,
    Settings,
    Trash2,
    Users,
    X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "users", label: "User management", icon: Users },
    { id: "settings", label: "System settings", icon: Settings },
];

function Metric({ label, value, note, icon: Icon }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-2.5 text-slate-700">
                    <Icon size={20} aria-hidden="true" />
                </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">{note}</p>
        </div>
    );
}

function AdminUsers() {
    const { token, user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [overview, setOverview] = useState(null);
    const activeTab = tabs.some((tab) => tab.id === searchParams.get("tab"))
        ? searchParams.get("tab")
        : "overview";
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({ name: "", email: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadAdminData() {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/users`, {
                    headers: { Authorization: "Bearer " + token, Accept: "application/json" },
                    signal: controller.signal,
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Failed to load admin data.");
                setUsers(Array.isArray(data.users) ? data.users : []);
                setOverview(data.overview || null);
            } catch (loadError) {
                if (loadError.name !== "AbortError") setError(loadError.message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        loadAdminData();
        return () => controller.abort();
    }, [token]);

    const filteredUsers = useMemo(() => users.filter((item) =>
        `${item.name} ${item.email}`.toLowerCase().includes(search.trim().toLowerCase())
    ), [search, users]);

    const startEditing = (item) => {
        setEditingId(item.id);
        setEditValues({ name: item.name, email: item.email });
        setError("");
    };

    const saveUser = async (id) => {
        setError("");
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + token,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editValues),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to update user.");
            setUsers((current) => current.map((item) => item.id === id ? data.user : item));
            setEditingId(null);
        } catch (saveError) {
            setError(saveError.message);
        }
    };

    const deleteUser = async (item) => {
        if (!window.confirm(`Soft-delete ${item.name}'s account?`)) return;
        setError("");
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${item.id}`, {
                method: "DELETE",
                headers: { Authorization: "Bearer " + token, Accept: "application/json" },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to delete user.");
            setUsers((current) => current.filter((userItem) => userItem.id !== item.id));
            setOverview((current) => current ? { ...current, total_users: current.total_users - 1 } : current);
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    const statusCounts = Object.entries(overview?.applications_by_status || {});
    const maxStatusCount = Math.max(...statusCounts.map(([, count]) => Number(count)), 1);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-medium text-blue-700">Administration</p>
                <h1 className="mt-1 text-2xl font-semibold text-gray-900">System management</h1>
                <p className="mt-1 text-sm text-gray-500">Monitor platform performance and manage JobTrack accounts.</p>
            </div>

            <nav className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2" aria-label="Admin sections">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setSearchParams({ tab: id })}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === id ? "bg-slate-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                        <Icon size={17} aria-hidden="true" />
                        {label}
                    </button>
                ))}
            </nav>

            {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            {loading ? (
                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">Loading system data...</div>
            ) : activeTab === "overview" ? (
                <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <Metric label="Total users" value={overview?.total_users ?? users.length} note="Registered accounts" icon={Users} />
                        <Metric label="Verified users" value={overview?.verified_users ?? "—"} note="Email verification completed" icon={Check} />
                        <Metric label="New users" value={overview?.new_users ?? "—"} note="Registered in the last 30 days" icon={Activity} />
                        <Metric label="Companies tracked" value={overview?.total_companies ?? "—"} note="Across all accounts" icon={ClipboardList} />
                        <Metric label="Applications tracked" value={overview?.total_applications ?? "—"} note="Across all accounts" icon={ClipboardList} />
                    </div>

                    <section className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="font-semibold text-gray-900">Application performance</h2>
                        <p className="mt-1 text-sm text-gray-500">Platform-wide application pipeline by current status.</p>
                        <div className="mt-6 space-y-4">
                            {statusCounts.length === 0 ? <p className="text-sm text-gray-500">No application data yet.</p> : statusCounts.map(([status, count]) => (
                                <div key={status}>
                                    <div className="mb-1 flex justify-between text-sm">
                                        <span className="text-gray-700">{status}</span>
                                        <span className="font-medium text-gray-900">{count}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100">
                                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${(Number(count) / maxStatusCount) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            ) : activeTab === "settings" ? (
                <section className="rounded-xl border border-gray-200 bg-white p-6">
                    <h2 className="font-semibold text-gray-900">System settings</h2>
                    <p className="mt-1 text-sm text-gray-500">Review the platform-wide controls currently enforced by the application.</p>
                    <div className="mt-6 divide-y divide-gray-100">
                        <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div><p className="font-medium text-gray-900">Account verification</p><p className="text-sm text-gray-500">Users must verify their email before using protected features.</p></div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Enabled</span>
                        </div>
                        <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div><p className="font-medium text-gray-900">User data isolation</p><p className="text-sm text-gray-500">Applications and companies remain private to each account.</p></div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Enabled</span>
                        </div>
                        <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div><p className="font-medium text-gray-900">Administrator account</p><p className="text-sm text-gray-500">{user?.email}</p></div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Protected</span>
                        </div>
                    </div>
                    <p className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">Environment-level settings such as mail delivery, API URL, and scheduled jobs should be changed in the backend deployment configuration.</p>
                </section>
            ) : (
                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="flex flex-col gap-4 border-b border-gray-200 bg-slate-900 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div><h2 className="font-semibold text-white">Registered users</h2><p className="mt-1 text-sm text-gray-300">{users.length} active {users.length === 1 ? "account" : "accounts"}</p></div>
                        <label className="relative block w-full sm:w-72">
                            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" aria-label="Search users" className="w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-gray-400 focus:outline-none" />
                        </label>
                    </div>
                    {filteredUsers.length === 0 ? <div className="p-10 text-center text-sm text-gray-500">No users found.</div> : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Email</th><th className="px-5 py-3 font-medium">Joined</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((item) => {
                                        const isSelf = item.id === user?.id;
                                        const isEditing = editingId === item.id;
                                        return <tr key={item.id} className="hover:bg-gray-50/70">
                                            <td className="px-5 py-4 font-medium text-gray-900">{isEditing ? <input aria-label="User name" value={editValues.name} onChange={(event) => setEditValues({ ...editValues, name: event.target.value })} className="w-full rounded border border-gray-300 px-2 py-1" /> : item.name}</td>
                                            <td className="px-5 py-4 text-gray-600">{isEditing ? <input type="email" aria-label="User email" value={editValues.email} onChange={(event) => setEditValues({ ...editValues, email: event.target.value })} className="w-full rounded border border-gray-300 px-2 py-1" /> : item.email}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-gray-600">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="whitespace-nowrap px-5 py-4"><div className="flex justify-end gap-1">
                                                {isEditing ? <><button type="button" onClick={() => saveUser(item.id)} aria-label={`Save ${item.name}`} className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"><Check size={17} /></button><button type="button" onClick={() => setEditingId(null)} aria-label="Cancel editing" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={17} /></button></> : <><button type="button" disabled={isSelf} onClick={() => startEditing(item)} aria-label={`Edit ${item.name}`} className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"><Pencil size={17} /></button><button type="button" disabled={isSelf} onClick={() => deleteUser(item)} aria-label={`Soft-delete ${item.name}`} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={17} /></button></>}
                                            </div></td>
                                        </tr>;
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

export default AdminUsers;
