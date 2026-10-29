import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const tabs = ["Analytics", "Follow-ups", "Skills & target jobs"];
const skillStatuses = [
    { value: "have_experience", label: "Have experience" },
    { value: "learning", label: "Currently learning" },
    { value: "need_to_learn", label: "Need to learn" },
];

function localDateTime(value) {
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
}

function CareerTools() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(tabs[0]);
    const [period, setPeriod] = useState("90");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");
    const [analytics, setAnalytics] = useState(null);
    const [followUps, setFollowUps] = useState([]);
    const [skills, setSkills] = useState([]);
    const [requirements, setRequirements] = useState([]);
    const [applications, setApplications] = useState([]);
    const [error, setError] = useState("");
    const [followUpForm, setFollowUpForm] = useState({ application_id: "", scheduled_at: "", notes: "" });
    const [skillForm, setSkillForm] = useState({ name: "", status: "need_to_learn", target_date: "", evidence_url: "" });
    const [jobForm, setJobForm] = useState({ application_id: "", job_title: "", company_name: "", description: "", required_skills: "" });

    const api = useCallback(async (path, options = {}) => {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
                ...options.headers,
            },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "The request failed.");
        return data;
    }, [token]);

    const reload = useCallback(async () => {
        setError("");
        try {
            const params = new URLSearchParams();
            if (period === "custom") {
                if (customFrom) params.set("from", customFrom);
                if (customTo) params.set("to", customTo);
            } else if (period !== "all") {
                const from = new Date();
                from.setDate(from.getDate() - Number(period));
                params.set("from", from.toISOString().slice(0, 10));
                params.set("to", new Date().toISOString().slice(0, 10));
            }
            const [analyticsData, followUpData, skillData, requirementData, applicationData] = await Promise.all([
                api(`/analytics?${params.toString()}`),
                api("/follow-ups"),
                api("/skills"),
                api("/job-requirements"),
                api("/applications"),
            ]);
            setAnalytics(analyticsData);
            setFollowUps(followUpData.follow_ups);
            setSkills(skillData.skills);
            setRequirements(requirementData.requirements);
            setApplications(applicationData.applications);
        } catch (loadError) {
            setError(loadError.message);
        }
    }, [api, period, customFrom, customTo]);

    useEffect(() => {
        async function loadCareerTools() {
            await reload();
        }

        loadCareerTools();
    }, [reload]);

    const requiredSkillSummary = useMemo(() => {
        const counts = new Map();
        requirements.forEach((job) => (job.required_skills || []).forEach((name) => {
            const normalized = name.trim().toLowerCase();
            if (normalized) {
                const current = counts.get(normalized) || { name, count: 0 };
                current.count += 1;
                counts.set(normalized, current);
            }
        }));
        return [...counts.values()].sort((first, second) => second.count - first.count);
    }, [requirements]);

    const submitFollowUp = async (event) => {
        event.preventDefault();
        setError("");
        try {
            await api("/follow-ups", {
                method: "POST",
                body: JSON.stringify({ ...followUpForm, scheduled_at: new Date(followUpForm.scheduled_at).toISOString(), application_id: Number(followUpForm.application_id) }),
            });
            setFollowUpForm({ application_id: "", scheduled_at: "", notes: "" });
            await reload();
        } catch (saveError) { setError(saveError.message); }
    };

    const addGapToRoadmap = async (name) => {
        try {
            await api("/skills", {
                method: "POST",
                body: JSON.stringify({ name, status: "need_to_learn" }),
            });
            await reload();
        } catch (saveError) { setError(saveError.message); }
    };

    const deleteJob = async (id) => {
        try {
            await api(`/job-requirements/${id}`, { method: "DELETE" });
            await reload();
        } catch (saveError) { setError(saveError.message); }
    };

    const completeFollowUp = async (id) => {
        try {
            await api(`/follow-ups/${id}/complete`, { method: "POST" });
            await reload();
        } catch (saveError) { setError(saveError.message); }
    };

    const rescheduleFollowUp = async (followUp) => {
        const scheduledAt = document.getElementById(`follow-up-date-${followUp.id}`)?.value;
        if (!scheduledAt) return;
        try {
            await api(`/follow-ups/${followUp.id}`, {
                method: "PUT",
                body: JSON.stringify({ scheduled_at: new Date(scheduledAt).toISOString() }),
            });
            await reload();
        } catch (saveError) { setError(saveError.message); }
    };

    const submitSkill = async (event) => {
        event.preventDefault();
        setError("");
        try {
            await api("/skills", { method: "POST", body: JSON.stringify({ ...skillForm, target_date: skillForm.target_date || null, evidence_url: skillForm.evidence_url || null }) });
            setSkillForm({ name: "", status: "need_to_learn", target_date: "", evidence_url: "" });
            await reload();
        } catch (saveError) { setError(saveError.message); }
    };

    const updateSkill = async (skill, updates) => {
        try {
            await api(`/skills/${skill.id}`, { method: "PUT", body: JSON.stringify(updates) });
            await reload();
        } catch (saveError) { setError(saveError.message); }
    };

    const deleteSkill = async (id) => {
        try {
            await api(`/skills/${id}`, { method: "DELETE" });
            await reload();
        } catch (saveError) { setError(saveError.message); }
    };

    const submitJob = async (event) => {
        event.preventDefault();
        setError("");
        try {
            await api("/job-requirements", {
                method: "POST",
                body: JSON.stringify({
                    ...jobForm,
                    application_id: jobForm.application_id ? Number(jobForm.application_id) : null,
                    required_skills: jobForm.required_skills.split(",").map((skill) => skill.trim()).filter(Boolean),
                }),
            });
            setJobForm({ application_id: "", job_title: "", company_name: "", description: "", required_skills: "" });
            await reload();
        } catch (saveError) { setError(saveError.message); }
    };

    const copyTemplate = async (followUp) => {
        const template = followUp.message_template || `Hello ${followUp.application?.contact_name || "there"},\n\nI wanted to follow up regarding my application for ${followUp.application?.job_title} at ${followUp.application?.company?.name}. I remain interested and would appreciate any update you can share.\n\nThank you.`;
        try {
            await navigator.clipboard.writeText(template);
            setError("Follow-up message copied. It has not been sent.");
        } catch {
            setError("Could not copy the follow-up message. Check browser clipboard permissions.");
        }
    };

    const saveTemplate = async (followUp) => {
        const messageTemplate = document.getElementById(`follow-up-template-${followUp.id}`)?.value || "";
        try {
            await api(`/follow-ups/${followUp.id}`, {
                method: "PUT",
                body: JSON.stringify({ message_template: messageTemplate }),
            });
            await reload();
        } catch (saveError) { setError(saveError.message); }
    };

    const barList = (items) => {
        const entries = Object.entries(items || {});
        const max = Math.max(1, ...entries.map(([, count]) => count));
        return entries.length ? <ul className="mt-3 space-y-3">{entries.map(([label, count]) => (
            <li key={label}>
                <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="text-gray-500">{count}</span></div>
                <div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-slate-700" style={{ width: `${(count / max) * 100}%` }} /></div>
            </li>
        ))}</ul> : <p className="mt-3 text-sm text-gray-500">No application data for this period.</p>;
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Career tools</h1>
                <p className="mt-1 text-sm text-gray-500">Track progress, follow-ups, skills, and job requirements.</p>
            </div>
            <nav aria-label="Career tools sections" className="flex flex-wrap gap-2 border-b border-gray-200">
                {tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? "page" : undefined} className={`px-4 py-3 text-sm font-medium ${activeTab === tab ? "border-b-2 border-slate-900 text-slate-900" : "text-gray-500 hover:text-gray-900"}`}>{tab}</button>)}
            </nav>
            {error && <div role="alert" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{error}</div>}

            {activeTab === "Analytics" && (
                <section className="space-y-5">
                    <label className="text-sm font-medium text-gray-700">Application period
                        <select value={period} onChange={(event) => setPeriod(event.target.value)} className="ml-3 rounded-lg border border-gray-300 px-3 py-2">
                            <option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last year</option><option value="custom">Custom range</option><option value="all">All time</option>
                        </select>
                    </label>
                    {period === "custom" && <div className="inline-flex flex-wrap items-center gap-3">
                        <label className="text-sm text-gray-700">From<input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} className="ml-2 rounded-lg border border-gray-300 px-3 py-2" /></label>
                        <label className="text-sm text-gray-700">To<input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} className="ml-2 rounded-lg border border-gray-300 px-3 py-2" /></label>
                    </div>}
                    {analytics && <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Metric title="Applications" value={analytics.total} note="Applications in selected period" />
                            <Metric title="Interview rate" value={`${analytics.interview_rate}%`} note={`${analytics.interview_sample} eligible applications · reached interview stage`} />
                            <Metric title="Response rate" value={`${analytics.response_rate}%`} note={`${analytics.response_sample} eligible applications · recorded response statuses`} />
                            <Metric title="Avg. response wait" value={analytics.average_response_days === null ? "—" : `${analytics.average_response_days} days`} note={`${analytics.response_time_sample} responses with usable dates`} />
                            <Metric title="Avg. stage transition" value={analytics.average_stage_transition_days === null ? "—" : `${analytics.average_stage_transition_days} days`} note={`${analytics.stage_transition_sample} consecutive recorded stages`} />
                        </div>
                        <div className="grid gap-5 lg:grid-cols-2">
                            <Chart title="Applications by status" items={analytics.statuses} render={barList} />
                            <Chart title="Current outcomes" items={analytics.outcomes} render={barList} />
                            <Chart title="Most common stage before rejection" items={analytics.rejection_stages} render={barList} />
                            <Chart title="By company" items={analytics.by_company} render={barList} />
                            <Chart title="By job title" items={analytics.by_job_title} render={barList} />
                            <Chart title="By application source" items={analytics.by_source} render={barList} />
                        </div>
                        <p className="text-xs text-gray-500">Interview rate = distinct eligible applications that reached Interview ÷ eligible applications. Response rate = eligible applications currently in Screening, Interview, Offer, or Rejected ÷ eligible applications. Withdrawn applications are excluded from these rates; missing dates are not inferred.</p>
                    </>}
                </section>
            )}

            {activeTab === "Follow-ups" && (
                <section className="space-y-5">
                    <form onSubmit={submitFollowUp} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-5 md:grid-cols-4">
                        <label className="text-sm text-gray-700 md:col-span-2">Application
                            <select required value={followUpForm.application_id} onChange={(event) => setFollowUpForm({ ...followUpForm, application_id: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="">Select an application</option>{applications.map((application) => <option key={application.id} value={application.id}>{application.job_title} · {application.company?.name}</option>)}</select>
                        </label>
                        <label className="text-sm text-gray-700">Follow-up date
                            <input required type="datetime-local" value={followUpForm.scheduled_at} onChange={(event) => setFollowUpForm({ ...followUpForm, scheduled_at: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                        </label>
                        <label className="text-sm text-gray-700">Notes
                            <input value={followUpForm.notes} onChange={(event) => setFollowUpForm({ ...followUpForm, notes: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                        </label>
                        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white md:col-span-4 md:justify-self-start">Schedule follow-up</button>
                    </form>
                    <div className="space-y-3">
                        {followUps.filter((followUp) => !followUp.completed_at).map((followUp) => {
                            const scheduled = new Date(followUp.scheduled_at);
                            const isToday = scheduled.toDateString() === new Date().toDateString();
                            const overdue = !isToday && scheduled < new Date();
                            return <article key={followUp.id} className="rounded-xl border border-gray-200 bg-white p-5">
                                <div className="flex flex-wrap justify-between gap-3">
                                    <div><h2 className="font-semibold text-gray-900">{followUp.application?.job_title} · {followUp.application?.company?.name}</h2><p className="mt-1 text-sm text-gray-500">{followUp.application?.status} · {isToday ? "Today" : overdue ? "Overdue" : "Upcoming"} · {scheduled.toLocaleString()}</p>{followUp.notes && <p className="mt-2 text-sm text-gray-600">{followUp.notes}</p>}{followUps.filter((item) => item.application_id === followUp.application_id && item.completed_at).sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0] && <p className="mt-1 text-xs text-gray-500">Last completed follow-up: {new Date(followUps.filter((item) => item.application_id === followUp.application_id && item.completed_at).sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0].completed_at).toLocaleDateString()}</p>}</div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button onClick={() => navigate(`/applications/view/${followUp.application?.id}`)} type="button" className="text-sm text-blue-700 hover:underline">View application</button>
                                        <button onClick={() => copyTemplate(followUp)} type="button" className="rounded border border-gray-300 px-3 py-1.5 text-sm">Copy message</button>
                                        <button onClick={() => completeFollowUp(followUp.id)} type="button" className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white">Complete</button>
                                    </div>
                                </div>
                                <label className="mt-4 block text-xs text-gray-600">Editable message template (copying does not send)
                                    <textarea id={`follow-up-template-${followUp.id}`} defaultValue={followUp.message_template || ""} rows={3} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder={`Hello ${followUp.application?.contact_name || "there"}, I wanted to follow up about ${followUp.application?.job_title} at ${followUp.application?.company?.name}.`} />
                                </label>
                                <button type="button" onClick={() => saveTemplate(followUp)} className="mt-2 rounded border border-gray-300 px-3 py-1.5 text-sm">Save template</button>
                                <div className="mt-4 flex flex-wrap items-end gap-2"><label className="text-xs text-gray-600">Reschedule<input id={`follow-up-date-${followUp.id}`} type="datetime-local" defaultValue={localDateTime(followUp.scheduled_at)} className="mt-1 block rounded border border-gray-300 px-2 py-1.5 text-sm" /></label><button type="button" onClick={() => rescheduleFollowUp(followUp)} className="rounded border border-gray-300 px-3 py-1.5 text-sm">Save date</button></div>
                            </article>;
                        })}
                        {!followUps.some((followUp) => !followUp.completed_at) && <p className="rounded-lg bg-white p-5 text-sm text-gray-500">No pending follow-ups. Add one when you choose a date to check in.</p>}
                    </div>
                    {followUps.some((followUp) => followUp.completed_at) && <section className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="font-semibold">Completed follow-ups</h2>{followUps.filter((item) => item.completed_at).map((item) => <p key={item.id} className="mt-2 text-sm text-gray-500">{item.application?.job_title} · {new Date(item.completed_at).toLocaleDateString()}</p>)}</section>}
                    <section className="rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="font-semibold text-gray-900">Applications awaiting a response</h2>
                    {applications.filter((application) => ["Applied", "Screening", "Interview"].includes(application.status)).map((application) => {
                        const lastFollowUp = followUps.filter((item) => item.application_id === application.id && item.completed_at).sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];
                        return <div key={application.id} className="mt-3 flex flex-wrap justify-between gap-2 border-t border-gray-100 pt-3 text-sm">
                            <button type="button" onClick={() => navigate(`/applications/view/${application.id}`)} className="text-left text-blue-700 hover:underline">{application.job_title} · {application.company?.name}</button>
                            <span className="text-gray-500">{application.status}{lastFollowUp ? ` · Last follow-up ${new Date(lastFollowUp.completed_at).toLocaleDateString()}` : " · No completed follow-up"}</span>
                        </div>;
                    })}
                    {!applications.some((application) => ["Applied", "Screening", "Interview"].includes(application.status)) && <p className="mt-2 text-sm text-gray-500">No applications awaiting a response.</p>}
                    </section>
                </section>
            )}

            {activeTab === "Skills & target jobs" && (
                <section className="grid gap-5 lg:grid-cols-2">
                    <div className="space-y-4">
                        <form onSubmit={submitSkill} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="font-semibold text-gray-900">My skills and roadmap</h2>
                            <label className="block text-sm text-gray-700">Skill<input required value={skillForm.name} onChange={(event) => setSkillForm({ ...skillForm, name: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="text-sm text-gray-700">Progress<select value={skillForm.status} onChange={(event) => setSkillForm({ ...skillForm, status: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">{skillStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
                                <label className="text-sm text-gray-700">Target date<input type="date" value={skillForm.target_date} onChange={(event) => setSkillForm({ ...skillForm, target_date: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                            </div>
                            <label className="block text-sm text-gray-700">Portfolio / certificate evidence URL<input type="url" value={skillForm.evidence_url} onChange={(event) => setSkillForm({ ...skillForm, evidence_url: event.target.value })} placeholder="https://" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Add skill</button>
                        </form>
                        {skills.map((skill) => <div key={skill.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4">
                            <div className="min-w-0 flex-1"><p className="font-medium text-gray-900">{skill.name}</p>{skill.evidence_url && <a href={skill.evidence_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700">Evidence</a>}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <input id={`skill-date-${skill.id}`} type="date" defaultValue={skill.target_date || ""} aria-label={`Target date for ${skill.name}`} className="rounded border border-gray-300 px-2 py-1 text-sm" />
                                    <input id={`skill-evidence-${skill.id}`} type="url" defaultValue={skill.evidence_url || ""} aria-label={`Evidence URL for ${skill.name}`} placeholder="Evidence URL" className="min-w-0 rounded border border-gray-300 px-2 py-1 text-sm" />
                                    <button type="button" onClick={() => updateSkill(skill, { target_date: document.getElementById(`skill-date-${skill.id}`).value || null, evidence_url: document.getElementById(`skill-evidence-${skill.id}`).value || null })} className="rounded border border-gray-300 px-2 py-1 text-xs">Save roadmap</button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select aria-label={`Progress for ${skill.name}`} value={skill.status} onChange={(event) => updateSkill(skill, { status: event.target.value })} className="rounded border border-gray-300 px-2 py-1 text-sm">{skillStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>
                                <button type="button" onClick={() => deleteSkill(skill.id)} className="text-xs text-red-700">Remove</button>
                            </div>
                        </div>)}
                        {!skills.length && <p className="text-sm text-gray-500">Add your current or planned skills to compare against target roles.</p>}
                    </div>
                    <div className="space-y-4">
                        <form onSubmit={submitJob} className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="font-semibold text-gray-900">Save target job requirements</h2>
                            <p className="text-xs text-gray-500">Manual skill entry; matches are keyword comparisons, not a qualification assessment.</p>
                            <label className="block text-sm text-gray-700">Job title<input required value={jobForm.job_title} onChange={(event) => setJobForm({ ...jobForm, job_title: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="text-sm text-gray-700">Company<input value={jobForm.company_name} onChange={(event) => setJobForm({ ...jobForm, company_name: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                                <label className="text-sm text-gray-700">Link application (optional)<select value={jobForm.application_id} onChange={(event) => setJobForm({ ...jobForm, application_id: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="">Not linked</option>{applications.map((application) => <option key={application.id} value={application.id}>{application.job_title} · {application.company?.name}</option>)}</select></label>
                            </div>
                            <label className="block text-sm text-gray-700">Required skills (comma separated)<input required value={jobForm.required_skills} onChange={(event) => setJobForm({ ...jobForm, required_skills: event.target.value })} placeholder="React, SQL, accessibility" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                            <label className="block text-sm text-gray-700">Job description<textarea value={jobForm.description} onChange={(event) => setJobForm({ ...jobForm, description: event.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
                            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save target job</button>
                        </form>
                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="font-semibold text-gray-900">Most requested skills</h2>
                            <ul className="mt-3 space-y-2">{requiredSkillSummary.map((item) => {
                                const profileSkill = skills.find((skill) => skill.name.trim().toLowerCase() === item.name.toLowerCase());
                                return <li key={item.name} className="flex flex-wrap justify-between gap-2 text-sm"><span>{item.name}{profileSkill?.status === "have_experience" ? " · in your skills" : profileSkill?.status === "learning" ? " · learning" : " · gap"}</span><span className="text-gray-500">{item.count} job{item.count === 1 ? "" : "s"}</span>{!profileSkill && <button type="button" onClick={() => addGapToRoadmap(item.name)} className="text-xs text-blue-700 hover:underline">Add to learning roadmap</button>}</li>;
                            })}</ul>
                            {!requiredSkillSummary.length && <p className="mt-2 text-sm text-gray-500">Save job requirements to see recurring skills and gaps.</p>}
                        </section>
                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="font-semibold text-gray-900">Saved target jobs</h2>
                            {requirements.map((job) => {
                                const ownedNames = new Set(skills.map((skill) => skill.name.trim().toLowerCase()));
                                const matched = job.required_skills.filter((name) => ownedNames.has(name.trim().toLowerCase()));
                                const missing = job.required_skills.filter((name) => !ownedNames.has(name.trim().toLowerCase()));
                                return <article key={job.id} className="mt-4 border-t border-gray-100 pt-3"><div className="flex justify-between gap-2"><h3 className="text-sm font-medium">{job.job_title}{job.company_name ? ` · ${job.company_name}` : ""}</h3><button type="button" onClick={() => deleteJob(job.id)} className="text-xs text-red-700">Remove</button></div><p className="mt-1 text-xs text-gray-600">Keyword matches: {matched.join(", ") || "None"} · Not in skill list: {missing.join(", ") || "None"}</p><p className="mt-1 text-xs text-gray-500">This is not a full assessment of experience or suitability.</p></article>;
                            })}
                        </section>
                    </div>
                </section>
            )}
        </div>
    );
}

function Metric({ title, value, note }) {
    return <article className="rounded-xl border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">{title}</p><p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-500">{note}</p></article>;
}

function Chart({ title, items, render }) {
    return <section className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="font-semibold text-gray-900">{title}</h2>{render(items)}</section>;
}

export default CareerTools;
