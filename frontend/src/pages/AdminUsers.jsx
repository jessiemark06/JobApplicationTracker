import { useEffect, useState } from "react";
import { Check, Pencil, Search, Trash2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

function AdminUsers() {
    const { token, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({ name: "", email: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadUsers() {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/users`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                    signal: controller.signal,
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Failed to load users.");
                setUsers(Array.isArray(data.users) ? data.users : []);
            } catch (loadError) {
                if (loadError.name !== "AbortError") setError(loadError.message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        loadUsers();
        return () => controller.abort();
    }, [token]);

    const filteredUsers = users.filter((item) =>
        `${item.name} ${item.email}`.toLowerCase().includes(search.trim().toLowerCase())
    );

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
                    Authorization: `Bearer ${token}`,
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
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to delete user.");
            setUsers((current) => current.filter((userItem) => userItem.id !== item.id));
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">User administration</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage registered accounts.</p>
                </div>
                <label className="relative block w-full sm:w-72">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search users"
                        aria-label="Search users"
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 focus:outline-none"
                    />
                </label>
            </div>

            {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 bg-slate-900 px-6 py-4">
                    <h2 className="font-semibold text-white">Registered users</h2>
                    <p className="mt-1 text-sm text-gray-300">{users.length} active {users.length === 1 ? "account" : "accounts"}</p>
                </div>
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-500">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">No users found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th scope="col" className="px-5 py-3 font-medium">Name</th>
                                    <th scope="col" className="px-5 py-3 font-medium">Email</th>
                                    <th scope="col" className="px-5 py-3 font-medium">Joined</th>
                                    <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((item) => {
                                    const isSelf = item.id === user?.id;
                                    const isEditing = editingId === item.id;
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/70">
                                            <td className="px-5 py-4 font-medium text-gray-900">
                                                {isEditing ? <input aria-label="User name" value={editValues.name} onChange={(event) => setEditValues({ ...editValues, name: event.target.value })} className="w-full rounded border border-gray-300 px-2 py-1" /> : item.name}
                                            </td>
                                            <td className="px-5 py-4 text-gray-600">
                                                {isEditing ? <input type="email" aria-label="User email" value={editValues.email} onChange={(event) => setEditValues({ ...editValues, email: event.target.value })} className="w-full rounded border border-gray-300 px-2 py-1" /> : item.email}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-gray-600">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <div className="flex justify-end gap-1">
                                                    {isEditing ? (
                                                        <>
                                                            <button type="button" onClick={() => saveUser(item.id)} aria-label={`Save ${item.name}`} className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"><Check size={17} /></button>
                                                            <button type="button" onClick={() => setEditingId(null)} aria-label="Cancel editing" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={17} /></button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button type="button" disabled={isSelf} onClick={() => startEditing(item)} aria-label={`Edit ${item.name}`} className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"><Pencil size={17} /></button>
                                                            <button type="button" disabled={isSelf} onClick={() => deleteUser(item)} aria-label={`Soft-delete ${item.name}`} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={17} /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default AdminUsers;