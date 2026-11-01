import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, Pencil, Plus, Video } from "lucide-react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const eventTypes = [
    "Initial interview", "Technical interview", "HR interview", "Final interview",
    "Assessment or examination", "Recruiter call", "Job offer discussion",
    "Document submission deadline", "Other",
];
const statuses = ["scheduled", "completed", "rescheduled", "cancelled", "missed"];
const reminderOptions = [
    { minutes: 1440, label: "24 hours before" },
    { minutes: 60, label: "1 hour before" },
    { minutes: 15, label: "15 minutes before" },
];

function toLocalInput(value, timezone) {
    if (!value) return "";
    const date = new Date(value);
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone || "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function localInputToUtc(value, timezone) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
    if (!match) throw new Error("Enter a valid event date and time.");
    const [, year, month, day, hour, minute] = match.map(Number);
    const wallTime = Date.UTC(year, month - 1, day, hour, minute);
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });
    const parts = Object.fromEntries(formatter.formatToParts(new Date(wallTime)).map((part) => [part.type, part.value]));
    const representedTime = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
    const utc = new Date(wallTime - (representedTime - wallTime));
    const check = Object.fromEntries(formatter.formatToParts(utc).map((part) => [part.type, part.value]));
    if (Number(check.year) !== year || Number(check.month) !== month || Number(check.day) !== day || Number(check.hour) !== hour || Number(check.minute) !== minute) {
        throw new Error("That local time does not exist in the selected time zone because of a daylight-saving change.");
    }

    return utc.toISOString();
}

function emptyForm(applicationId = "") {
    return {
        application_id: applicationId,
        event_type: "Initial interview",
        custom_event_type: "",
        starts_at: "",
        ends_at: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        mode: "",
        location: "",
        contact_name: "",
        contact_email: "",
        preparation_notes: "",
        required_documents: "",
        status: "scheduled",
        outcome: "",
        event_notes: "",
        reminder_intervals: [1440, 60],
    };
}

function dateKey(value, timezone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone || "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date(value));
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}

function Interviews() {
    const { token } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const requestedApplicationId = query.get("application_id") || "";
    const requestedEventId = query.get("event_id");
    const [events, setEvents] = useState([]);
    const [applications, setApplications] = useState([]);
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState(() => emptyForm(requestedApplicationId));
    const [editingId, setEditingId] = useState(null);
    const [eventTypeFilter, setEventTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [companyFilter, setCompanyFilter] = useState("all");
    const [range, setRange] = useState("upcoming");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const headers = useMemo(() => ({
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
    }), [token]);

    const loadData = useCallback(async () => {
        const [eventResponse, applicationResponse, profileResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/interviews`, { headers }),
            fetch(`${API_BASE_URL}/applications`, { headers }),
            fetch(`${API_BASE_URL}/profile`, { headers }),
        ]);
        const [eventData, applicationData, profileData] = await Promise.all([
            eventResponse.json(), applicationResponse.json(), profileResponse.json(),
        ]);
        if (!eventResponse.ok) throw new Error(eventData.message || "Failed to load events.");
        if (!applicationResponse.ok) throw new Error(applicationData.message || "Failed to load applications.");
        if (!profileResponse.ok) throw new Error(profileData.message || "Failed to load profile settings.");
        setEvents(eventData.events || []);
        setApplications(applicationData.applications || []);
        setProfile(profileData.user);
        if (!editingId) {
            setForm((current) => ({ ...current, timezone: profileData.user.timezone || current.timezone }));
        }
    }, [headers, editingId, setEvents, setApplications, setProfile, setForm]);

    useEffect(() => {
        async function fetchEvents() {
            try {
                await loadData();
            } catch (loadError) {
                setError(loadError.message);
            }
        }
        fetchEvents();
    }, [loadData]);

    useEffect(() => {
        if (!requestedEventId || !events.length) return;

        const eventElement = document.getElementById(`recruitment-event-${requestedEventId}`);
        if (!eventElement) return;

        window.setTimeout(() => {
            eventElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 0);
    }, [requestedEventId, events]);

    const filteredEvents = useMemo(() => {
        const now = new Date();
        const timezone = profile?.timezone || "UTC";
        const today = dateKey(now, timezone);
        const todayUtc = new Date(`${today}T00:00:00Z`);
        const weekStart = new Date(todayUtc);
        weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
        const monthStart = `${today.slice(0, 7)}-01`;
        const nextMonthStart = new Date(`${monthStart}T00:00:00Z`);
        nextMonthStart.setUTCMonth(nextMonthStart.getUTCMonth() + 1);
        const nextMonth = nextMonthStart.toISOString().slice(0, 10);

        return events.filter((event) => {
            const starts = new Date(event.starts_at);
            const eventDate = dateKey(event.starts_at, timezone);
            if (eventTypeFilter !== "all" && event.event_type !== eventTypeFilter) return false;
            if (statusFilter !== "all" && event.status !== statusFilter) return false;
            if (companyFilter !== "all" && String(event.application?.company_id) !== companyFilter) return false;
            const activeRange = requestedEventId ? "all" : range;
            if (activeRange === "upcoming" && (starts < now || ["cancelled", "completed", "missed"].includes(event.status))) return false;
            if (activeRange === "today" && eventDate !== today) return false;
            if (activeRange === "week" && (eventDate < weekStart.toISOString().slice(0, 10) || eventDate >= weekEnd.toISOString().slice(0, 10))) return false;
            if (activeRange === "month" && (eventDate < monthStart || eventDate >= nextMonth)) return false;
            if (activeRange === "past" && starts >= now) return false;
            return true;
        });
    }, [events, eventTypeFilter, statusFilter, companyFilter, range, requestedEventId, profile?.timezone]);

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");
        try {
            const selectedType = form.event_type === "Other" ? form.custom_event_type.trim() : form.event_type;
            const payload = {
                ...form,
                event_type: selectedType,
                application_id: Number(!editingId && requestedApplicationId ? requestedApplicationId : form.application_id),
                starts_at: localInputToUtc(form.starts_at, form.timezone),
                ends_at: form.ends_at ? localInputToUtc(form.ends_at, form.timezone) : null,
                mode: form.mode || null,
                contact_email: form.contact_email || null,
                required_documents: form.required_documents.split(",").map((item) => item.trim()).filter(Boolean),
            };
            delete payload.custom_event_type;
            const response = await fetch(`${API_BASE_URL}/interviews${editingId ? `/${editingId}` : ""}`, {
                method: editingId ? "PUT" : "POST",
                headers,
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Could not save event.");
            const resetForm = emptyForm(requestedApplicationId);
            resetForm.timezone = profile?.timezone || resetForm.timezone;
            setForm(resetForm);
            setEditingId(null);
            setMessage(editingId ? "Event updated." : "Event scheduled.");
            await loadData();
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    };

    const editEvent = (event) => {
        const isCustom = !eventTypes.slice(0, -1).includes(event.event_type);
        setEditingId(event.id);
        setForm({
            ...emptyForm(),
            application_id: String(event.application_id),
            event_type: isCustom ? "Other" : event.event_type,
            custom_event_type: isCustom ? event.event_type : "",
            starts_at: toLocalInput(event.starts_at, event.timezone),
            ends_at: toLocalInput(event.ends_at, event.timezone),
            timezone: event.timezone || profile?.timezone || "UTC",
            mode: event.mode || "",
            location: event.location || "",
            contact_name: event.contact_name || "",
            contact_email: event.contact_email || "",
            preparation_notes: event.preparation_notes || "",
            required_documents: (event.required_documents || []).join(", "),
            status: event.status,
            outcome: event.outcome || "",
            event_notes: event.event_notes || "",
            reminder_intervals: event.reminder_intervals || [],
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const updateStatus = async (event, status) => {
        setError("");
        try {
            const response = await fetch(`${API_BASE_URL}/interviews/${event.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ status }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Could not update event.");
            setMessage(`Event marked ${status}.`);
            await loadData();
        } catch (updateError) {
            setError(updateError.message);
        }
    };

    const dateDisplay = (value, timezone) => new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: profile?.timezone || timezone || "UTC",
    });

    const focusedEvent = events.find((event) => String(event.id) === requestedEventId);

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <header>
                <h1 className="text-2xl font-semibold text-gray-900">Interviews &amp; Events</h1>
                <p className="mt-1 text-sm text-gray-500">Schedule and prepare for recruitment activities. Events are based on information you enter.</p>
            </header>
            {error && <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {message && <div role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
            {focusedEvent && <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                <strong>{focusedEvent.event_type}</strong> · {focusedEvent.application?.job_title} · {dateDisplay(focusedEvent.starts_at, focusedEvent.timezone)}
            </div>}

            <section className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div><h2 className="text-lg font-semibold text-gray-900">{editingId ? "Edit event" : "Schedule an event"}</h2><p className="text-xs text-gray-500">Reminders are generated by the backend scheduler when configured.</p></div>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm()); }} className="cursor-pointer text-sm text-gray-600">Cancel edit</button>}
                </div>
                <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="text-sm text-gray-700 md:col-span-2">Job application
                        <select required value={!editingId && requestedApplicationId ? requestedApplicationId : form.application_id} onChange={(event) => setForm({ ...form, application_id: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                            <option value="">Select an application</option>
                            {applications.map((application) => <option key={application.id} value={application.id}>{application.job_title} · {application.company?.name}</option>)}
                        </select>
                    </label>
                    <label className="text-sm text-gray-700">Event type
                        <select value={form.event_type} onChange={(event) => setForm({ ...form, event_type: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">{eventTypes.map((type) => <option key={type}>{type}</option>)}</select>
                    </label>
                    {form.event_type === "Other" && <label className="text-sm text-gray-700">Custom event type
                        <input required value={form.custom_event_type} onChange={(event) => setForm({ ...form, custom_event_type: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </label>}
                    <label className="text-sm text-gray-700">Start date &amp; time
                        <input required type="datetime-local" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </label>
                    <label className="text-sm text-gray-700">End date &amp; time (optional)
                        <input type="datetime-local" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </label>
                    <label className="text-sm text-gray-700">Time zone
                        <input required value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })} placeholder="Asia/Manila" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </label>
                    <label className="text-sm text-gray-700">Interview mode
                        <select value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="">Not specified</option><option value="online">Online</option><option value="onsite">Onsite</option><option value="phone">Phone</option></select>
                    </label>
                    <label className="text-sm text-gray-700">{form.mode === "onsite" ? "Venue / address" : "Meeting link / venue"}
                        <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder={form.mode === "online" ? "https://" : ""} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </label>
                    <label className="text-sm text-gray-700">Recruiter / contact name
                        <input value={form.contact_name} onChange={(event) => setForm({ ...form, contact_name: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </label>
                    <label className="text-sm text-gray-700">Contact email (optional)
                        <input type="email" value={form.contact_email} onChange={(event) => setForm({ ...form, contact_email: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </label>
                    <label className="text-sm text-gray-700 md:col-span-2">Preparation notes
                        <textarea rows={3} value={form.preparation_notes} onChange={(event) => setForm({ ...form, preparation_notes: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </label>
                    <label className="text-sm text-gray-700 md:col-span-2">Required documents / checklist (comma separated)
                        <input value={form.required_documents} onChange={(event) => setForm({ ...form, required_documents: event.target.value })} placeholder="Resume, portfolio, ID" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </label>
                    {editingId && <>
                        <label className="text-sm text-gray-700">Event status
                            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                        </label>
                        <label className="text-sm text-gray-700">Outcome
                            <input value={form.outcome} onChange={(event) => setForm({ ...form, outcome: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                        </label>
                    </>}
                    <label className="text-sm text-gray-700 md:col-span-2">Event notes
                        <textarea rows={2} value={form.event_notes} onChange={(event) => setForm({ ...form, event_notes: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                    </label>
                    <fieldset className="md:col-span-2">
                        <legend className="text-sm font-medium text-gray-700">Reminder intervals</legend>
                        <div className="mt-2 flex flex-wrap gap-4">{reminderOptions.map((option) => <label key={option.minutes} className="inline-flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.reminder_intervals.includes(option.minutes)} onChange={(event) => setForm({ ...form, reminder_intervals: event.target.checked ? [...form.reminder_intervals, option.minutes] : form.reminder_intervals.filter((item) => item !== option.minutes) })} />{option.label}</label>)}</div>
                    </fieldset>
                    <button disabled={saving} className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 md:col-span-2 md:justify-self-start"><Plus size={16} />{saving ? "Saving..." : editingId ? "Save changes" : "Schedule event"}</button>
                </form>
            </section>

            <section className="space-y-4">
                <div className="flex flex-wrap gap-3">
                    <select aria-label="Event date range" value={requestedEventId ? "all" : range} onChange={(event) => setRange(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="upcoming">Upcoming</option><option value="today">Today</option><option value="week">This week</option><option value="month">This month</option><option value="past">Past events</option><option value="all">All events</option></select>
                    <select aria-label="Filter by event type" value={eventTypeFilter} onChange={(event) => setEventTypeFilter(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="all">All event types</option>{[...new Set(events.map((item) => item.event_type))].map((type) => <option key={type}>{type}</option>)}</select>
                    <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="all">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                    <select aria-label="Filter by company" value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="all">All companies</option>{[...new Map(applications.map((application) => [application.company?.id, application.company])).values()].filter(Boolean).map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select>
                </div>
                {filteredEvents.map((event) => {
                    const overdue = event.status === "scheduled" && new Date(event.starts_at) < new Date();
                    return <article id={`recruitment-event-${event.id}`} key={event.id} className={`rounded-xl border bg-white p-5 transition-colors ${overdue ? "border-amber-300" : "border-gray-200"} ${String(event.id) === requestedEventId ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-200" : ""}`}>
                        <div className="flex flex-col justify-between gap-4 sm:flex-row">
                            <div>
                                <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-gray-900">{event.event_type}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-700">{event.status}</span>{overdue && <span className="text-xs font-medium text-amber-700">Past due</span>}</div>
                                <p className="mt-1 text-sm text-gray-600">{event.application?.job_title} · {event.application?.company?.name}</p>
                                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500"><span className="inline-flex items-center gap-1"><CalendarDays size={15} />{dateDisplay(event.starts_at, event.timezone)}</span>{event.ends_at && <span className="inline-flex items-center gap-1"><Clock3 size={15} />Ends {dateDisplay(event.ends_at, event.timezone)}</span>}{event.mode && <span className="inline-flex items-center gap-1"><Video size={15} />{event.mode}</span>}{event.location && <span className="inline-flex items-center gap-1 break-all"><MapPin size={15} />{event.location}</span>}<span className="text-xs">Your time zone: {profile?.timezone || event.timezone}</span></p>
                                {event.preparation_notes && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">{event.preparation_notes}</p>}
                                {!!event.required_documents?.length && <p className="mt-2 text-sm text-gray-600">Checklist: {event.required_documents.join(", ")}</p>}
                                {event.outcome && <p className="mt-2 text-sm text-gray-600">Outcome: {event.outcome}</p>}
                            </div>
                            <div className="flex flex-wrap items-start gap-2">
                                <button type="button" onClick={() => navigate(`/applications/view/${event.application_id}`)} className="text-sm text-blue-700 hover:underline">Application</button>
                                <button type="button" onClick={() => editEvent(event)} className="cursor-pointer inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm"><Pencil size={14} />Edit</button>
                                {event.status !== "completed" && event.status !== "cancelled" && <button type="button" onClick={() => updateStatus(event, "completed")} className="cursor-pointer rounded bg-emerald-700 px-3 py-1.5 text-sm text-white">Complete</button>}
                                {event.status !== "cancelled" && event.status !== "completed" && <button type="button" onClick={() => updateStatus(event, "cancelled")} className="cursor-pointer rounded border border-red-300 px-3 py-1.5 text-sm text-red-700">Cancel</button>}
                            </div>
                        </div>
                        {!!event.histories?.length && <details className="mt-4 border-t border-gray-100 pt-3"><summary className="cursor-pointer text-xs text-gray-500">Event history ({event.histories.length})</summary><ul className="mt-2 space-y-1">{event.histories.map((history) => <li key={history.id} className="text-xs text-gray-500">{history.action} · {new Date(history.created_at).toLocaleString()}</li>)}</ul></details>}
                    </article>;
                })}
                {!filteredEvents.length && <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">No events match this view. Schedule an interview or recruitment event above.</div>}
            </section>
        </div>
    );
}

export default Interviews;
