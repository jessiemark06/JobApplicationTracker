import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const reminderChoices = [
    { value: 1440, label: "24 hours before" },
    { value: 60, label: "1 hour before" },
    { value: 15, label: "15 minutes before" },
];

const emailChoices = [
    ["email_interview_reminders", "Interview reminders"],
    ["email_deadline_reminders", "Recruitment deadlines"],
    ["email_follow_up_reminders", "Follow-up reminders"],
    ["email_application_updates", "Application status updates"],
];

function Profile() {
    const { token, user, updateUser, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", timezone: "UTC", notification_preferences: {} });
    const [password, setPassword] = useState({ current_password: "", password: "", password_confirmation: "" });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [consents, setConsents] = useState([]);
    const [deletionPassword, setDeletionPassword] = useState("");

    const headers = useMemo(() => ({
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
    }), [token]);

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await fetch(`${API_BASE_URL}/profile`, { headers });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Failed to load profile.");
                setProfile(data.user);
                setForm({
                    name: data.user.name,
                    email: data.user.email,
                    timezone: data.user.timezone || "UTC",
                    notification_preferences: data.user.notification_preferences,
                });
                const consentResponse = await fetch(`${API_BASE_URL}/privacy/consents`, { headers });
                const consentData = await consentResponse.json();
                if (!consentResponse.ok) throw new Error(consentData.message || "Failed to load consent records.");
                setConsents(consentData.consents || []);
            } catch (loadError) {
                setError(loadError.message);
            }
        }
        loadProfile();
    }, [headers]);

    const saveProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: "PUT",
                headers,
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Could not save profile.");
            setProfile(data.user);
            setForm({
                name: data.user.name,
                email: data.user.email,
                timezone: data.user.timezone,
                notification_preferences: data.user.notification_preferences,
            });
            updateUser(data.user);
            setMessage(data.message);
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(`${API_BASE_URL}/profile/password`, {
                method: "PUT",
                headers,
                body: JSON.stringify(password),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Could not change password.");
            setPassword({ current_password: "", password: "", password_confirmation: "" });
            setMessage(data.message);
        } catch (passwordError) {
            setError(passwordError.message);
        } finally {
            setSaving(false);
        }
    };

    const updatePreference = (key, value) => {
        setForm((current) => ({
            ...current,
            notification_preferences: {
                ...current.notification_preferences,
                [key]: value,
            },
        }));
    };

    const downloadFile = (content, type, filename) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    const escapeHtml = (value) => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const exportData = async (format = "html") => {
        setError("");
        try {
            const response = await fetch(`${API_BASE_URL}/privacy/export`, { headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Could not export your data.");
            if (format === "json") {
                downloadFile(JSON.stringify(data, null, 2), "application/json", "jobtrack-personal-data.json");
                setMessage("Your structured data export has been downloaded.");
                return;
            }

            const profileRows = Object.entries(data.profile || {})
                .filter(([key]) => key !== "notification_preferences")
                .map(([key, value]) => `<tr><th>${escapeHtml(key.replaceAll("_", " "))}</th><td>${escapeHtml(value || "Not provided")}</td></tr>`)
                .join("");
            const companies = (data.companies || []).map((company) => {
                const applications = (company.applications || []).map((application) => `<li><strong>${escapeHtml(application.job_title)}</strong> &mdash; ${escapeHtml(application.status)}${application.applied_at ? ` (${escapeHtml(application.applied_at)})` : ""}</li>`).join("");
                return `<article><h3>${escapeHtml(company.name)}</h3><p>${escapeHtml(company.location || "Location not provided")}</p>${applications ? `<ul>${applications}</ul>` : "<p>No applications recorded.</p>"}</article>`;
            }).join("") || "<p>No companies recorded.</p>";
            const agreements = (data.agreements || []).map((item) => `<li><strong>${escapeHtml(item.agreement.title)}</strong> (version ${escapeHtml(item.agreement.version)}) &mdash; accepted ${escapeHtml(new Date(item.accepted_at).toLocaleString())}</li>`).join("") || "<li>No agreements recorded.</li>";
            const report = `<!doctype html><html><head><meta charset="utf-8"><title>JobTrack personal data</title><style>body{font-family:Arial,sans-serif;line-height:1.5;color:#172033;max-width:900px;margin:40px auto;padding:0 24px}h1{color:#0f172a}h2{border-bottom:1px solid #dbe1ea;padding-bottom:8px;margin-top:32px}h3{margin-bottom:4px}table{border-collapse:collapse;width:100%;margin-top:16px}th,td{text-align:left;border:1px solid #dbe1ea;padding:10px}th{background:#f1f5f9;text-transform:capitalize}article{border:1px solid #dbe1ea;border-radius:8px;padding:14px;margin:12px 0}small{color:#64748b}</style></head><body><h1>JobTrack personal data report</h1><small>Exported ${escapeHtml(new Date(data.exported_at).toLocaleString())}</small><h2>Profile</h2><table>${profileRows}</table><h2>Companies and applications</h2>${companies}<h2>Agreements</h2><ul>${agreements}</ul></body></html>`;
            downloadFile(report, "text/html", "jobtrack-personal-data.html");
            setMessage("Your readable personal data report has been downloaded.");
        } catch (exportError) {
            setError(exportError.message);
        }
    };

    const deleteAccount = async (event) => {
        event.preventDefault();
        if (!window.confirm("Delete your account and personal data? This cannot be undone.")) return;
        setSaving(true);
        setError("");
        try {
            const response = await fetch(`${API_BASE_URL}/privacy/account`, {
                method: "DELETE",
                headers,
                body: JSON.stringify({ password: deletionPassword }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Could not delete your account.");
            logout();
            window.location.href = "/";
        } catch (deleteError) {
            setError(deleteError.message);
        } finally {
            setSaving(false);
        }
    };

    if (!profile && !error) return <p className="p-8 text-center text-sm text-gray-500">Loading account settings...</p>;

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <header><h1 className="text-2xl font-semibold text-gray-900">Profile</h1><p className="mt-1 text-sm text-gray-500">Manage your account, event reminders, and email preferences.</p></header>
            {error && <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {message && <div role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
            {profile && <>
                <form onSubmit={saveProfile} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
                    <div><h2 className="font-semibold text-gray-900">Profile information</h2><p className="mt-1 text-xs text-gray-500">Changing your email address requires verifying it again.</p></div>
                    <label className="block text-sm text-gray-700">Full name<input required maxLength={255} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm text-gray-700">Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /><span className="mt-1 block text-xs text-gray-500">{profile.email_verified_at ? "Verified" : "Not verified"}</span></label>
                    <label className="block text-sm text-gray-700">Preferred time zone<input required value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })} placeholder="Asia/Manila" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /><span className="mt-1 block text-xs text-gray-500">Use an IANA zone such as Asia/Manila or America/New_York.</span></label>
                    <fieldset>
                        <legend className="text-sm font-medium text-gray-700">Default event reminders</legend>
                        <div className="mt-2 flex flex-wrap gap-4">{reminderChoices.map((choice) => <label key={choice.value} className="inline-flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={(form.notification_preferences.default_reminder_intervals || []).includes(choice.value)} onChange={(event) => {
                            const current = form.notification_preferences.default_reminder_intervals || [];
                            updatePreference("default_reminder_intervals", event.target.checked ? [...current, choice.value] : current.filter((value) => value !== choice.value));
                        }} />{choice.label}</label>)}</div>
                    </fieldset>
                    <fieldset>
                        <legend className="text-sm font-medium text-gray-700">Optional email notifications</legend>
                        <p className="mt-1 text-xs text-gray-500">Only sent to your verified account email. Preferences are off by default. Local log/array mailers create previews rather than real email.</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">{emailChoices.map(([key, label]) => <label key={key} className="inline-flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={Boolean(form.notification_preferences[key])} onChange={(event) => updatePreference(key, event.target.checked)} />{label}</label>)}</div>
                    </fieldset>
                    <button disabled={saving} className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : "Save profile & preferences"}</button>
                </form>

                <form onSubmit={changePassword} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
                    <div><h2 className="font-semibold text-gray-900">Change password</h2><p className="mt-1 text-xs text-gray-500">Confirm your current password. Other active sessions will be revoked after a successful change.</p></div>
                    <label className="block text-sm text-gray-700">Current password<input required type="password" autoComplete="current-password" value={password.current_password} onChange={(event) => setPassword({ ...password, current_password: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm text-gray-700">New password<input required type="password" minLength={8} autoComplete="new-password" value={password.password} onChange={(event) => setPassword({ ...password, password: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /><span className="mt-1 block text-xs text-gray-500">At least 8 characters.</span></label>
                    <label className="block text-sm text-gray-700">Confirm new password<input required type="password" minLength={8} autoComplete="new-password" value={password.password_confirmation} onChange={(event) => setPassword({ ...password, password_confirmation: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <button disabled={saving} className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Updating..." : "Change password"}</button>
                </form>

                <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
                    <div><h2 className="font-semibold text-gray-900">Privacy and agreements</h2><p className="mt-1 text-xs text-gray-500">Review your recorded agreement versions or exercise your data rights.</p></div>
                    <div className="space-y-2">
                        {consents.map((consent) => <div key={consent.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"><span>{consent.agreement.title} <span className="text-gray-500">v{consent.agreement.version}</span></span><span className="text-xs text-gray-500">{new Date(consent.accepted_at).toLocaleString()}</span></div>)}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => exportData("html")} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Download readable report</button>
                        {user?.email?.toLowerCase() === "jessiemarkbaronda06@gmail.com" && (
                            <button type="button" onClick={() => exportData("json")} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-gray-50">Download JSON backup</button>
                        )}
                    </div>
                    <form onSubmit={deleteAccount} className="border-t border-gray-200 pt-4">
                        <label className="block text-sm text-gray-700">Confirm password to delete account<input required type="password" value={deletionPassword} onChange={(event) => setDeletionPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                        <button disabled={saving} className="cursor-pointer mt-3 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">Delete account and personal data</button>
                    </form>
                </section>
            </>}
        </div>
    );
}

export default Profile;
