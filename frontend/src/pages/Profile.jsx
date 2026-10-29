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
    const { token, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", timezone: "UTC", notification_preferences: {} });
    const [password, setPassword] = useState({ current_password: "", password: "", password_confirmation: "" });
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

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

    if (!profile && !error) return <p className="p-8 text-center text-sm text-gray-500">Loading account settings...</p>;

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <header><h1 className="text-2xl font-semibold text-gray-900">Profile &amp; settings</h1><p className="mt-1 text-sm text-gray-500">Manage your account, event reminders, and email preferences.</p></header>
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
                    <button disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : "Save profile & preferences"}</button>
                </form>

                <form onSubmit={changePassword} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
                    <div><h2 className="font-semibold text-gray-900">Change password</h2><p className="mt-1 text-xs text-gray-500">Confirm your current password. Other active sessions will be revoked after a successful change.</p></div>
                    <label className="block text-sm text-gray-700">Current password<input required type="password" autoComplete="current-password" value={password.current_password} onChange={(event) => setPassword({ ...password, current_password: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <label className="block text-sm text-gray-700">New password<input required type="password" minLength={8} autoComplete="new-password" value={password.password} onChange={(event) => setPassword({ ...password, password: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /><span className="mt-1 block text-xs text-gray-500">At least 8 characters.</span></label>
                    <label className="block text-sm text-gray-700">Confirm new password<input required type="password" minLength={8} autoComplete="new-password" value={password.password_confirmation} onChange={(event) => setPassword({ ...password, password_confirmation: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                    <button disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Updating..." : "Change password"}</button>
                </form>
            </>}
        </div>
    );
}

export default Profile;
