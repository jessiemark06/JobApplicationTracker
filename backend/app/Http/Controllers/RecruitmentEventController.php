<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\RecruitmentEvent;
use App\Models\RecruitmentEventHistory;
use App\Services\UserNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecruitmentEventController extends Controller
{
    private const REMINDER_INTERVALS = [1440, 60, 15];

    public function index(Request $request)
    {
        $filters = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'event_type' => 'nullable|string|max:80',
            'status' => 'nullable|in:scheduled,completed,rescheduled,cancelled,missed',
            'company_id' => 'nullable|integer',
        ]);
        $events = $this->ownedEvents($request)
            ->with(['application.company', 'histories'])
            ->when($filters['from'] ?? null, fn ($query, $from) => $query->where('starts_at', '>=', Carbon::parse($from)->startOfDay()))
            ->when($filters['to'] ?? null, fn ($query, $to) => $query->where('starts_at', '<=', Carbon::parse($to)->endOfDay()))
            ->when($filters['event_type'] ?? null, fn ($query, $type) => $query->where('event_type', $type))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['company_id'] ?? null, fn ($query, $companyId) => $query->whereHas('application.company', fn ($company) => $company->whereKey($companyId)))
            ->orderBy('starts_at')
            ->get();

        return response()->json(['events' => $events]);
    }

    public function show(Request $request, int $id)
    {
        $event = $this->ownedEvents($request)
            ->with(['application.company', 'histories'])
            ->whereKey($id)
            ->first();

        return $event
            ? response()->json(['event' => $event])
            : response()->json(['message' => 'Event not found'], 404);
    }

    public function store(Request $request, UserNotificationService $notifications)
    {
        $data = $this->validatedEvent($request);
        $application = $this->ownedApplications($request)->whereKey($data['application_id'])->first();
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }
        $user = $request->user();
        $data['user_id'] = $user->id;
        $data['timezone'] = $data['timezone'] ?? $user->timezone ?? 'UTC';
        $data['reminder_intervals'] = $data['reminder_intervals']
            ?? ($user->notification_preferences['default_reminder_intervals'] ?? self::REMINDER_INTERVALS);

        $event = DB::transaction(function () use ($data, $notifications, $application, $user) {
            $event = RecruitmentEvent::create($data);
            RecruitmentEventHistory::create([
                'recruitment_event_id' => $event->id,
                'action' => 'created',
                'new_values' => $this->eventSnapshot($event),
            ]);
            $notifications->create(
                $user->id,
                'interview',
                'Recruitment event added',
                "{$event->event_type} added for {$application->job_title}.",
                $application->id,
                $event->id,
                '/interviews?event_id='.$event->id,
            );

            return $event;
        });

        return response()->json(['event' => $event->load('application.company', 'histories')], 201);
    }

    public function update(Request $request, int $id, UserNotificationService $notifications)
    {
        $event = $this->ownedEvents($request)->with('application.company')->whereKey($id)->first();
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }
        $data = $this->validatedEvent($request, true);
        $applicationId = $data['application_id'] ?? $event->application_id;
        $application = $this->ownedApplications($request)->whereKey($applicationId)->first();
        if (!$application) {
            return response()->json(['message' => 'Application not found'], 404);
        }
        $previousValues = $this->eventSnapshot($event);
        $startsChanged = isset($data['starts_at'])
            && !Carbon::parse($data['starts_at'])->utc()->equalTo($event->starts_at);
        if (isset($data['ends_at']) && $data['ends_at'] !== null) {
            $candidateStart = isset($data['starts_at'])
                ? Carbon::parse($data['starts_at'])
                : $event->starts_at;
            if (Carbon::parse($data['ends_at'])->lt($candidateStart)) {
                return response()->json(['message' => 'The event end must be after its start.'], 422);
            }
        }
        $statusExplicitlyChanged = isset($data['status']) && $data['status'] !== $event->status;

        if ($startsChanged && !$statusExplicitlyChanged && in_array($event->status, ['scheduled', 'rescheduled'], true)) {
            $data['status'] = 'rescheduled';
        }

        $event = DB::transaction(function () use ($event, $data, $previousValues, $startsChanged, $notifications, $application) {
            $event->update($data);
            $cancelledNow = $event->status === 'cancelled' && ($previousValues['status'] ?? null) !== 'cancelled';
            $action = $cancelledNow ? 'cancelled' : ($startsChanged ? 'rescheduled' : 'updated');
            RecruitmentEventHistory::create([
                'recruitment_event_id' => $event->id,
                'action' => $action,
                'previous_values' => $previousValues,
                'new_values' => $this->eventSnapshot($event),
            ]);

            if ($cancelledNow || $action === 'rescheduled') {
                $notifications->create(
                    $event->user_id,
                    'interview',
                    $action === 'cancelled' ? 'Recruitment event cancelled' : 'Recruitment event rescheduled',
                    "{$event->event_type} for {$application->job_title} was {$action}.",
                    $application->id,
                    $event->id,
                    '/interviews?event_id='.$event->id,
                );
            }

            return $event;
        });

        return response()->json(['event' => $event->load('application.company', 'histories')]);
    }

    private function validatedEvent(Request $request, bool $sometimes = false): array
    {
        $prefix = $sometimes ? 'sometimes|' : '';
        $data = $request->validate([
            'application_id' => $prefix.'required|integer',
            'event_type' => $prefix.'required|string|max:80',
            'starts_at' => $prefix.'required|date',
            'ends_at' => $prefix.'nullable|date',
            'timezone' => $prefix.'nullable|timezone',
            'mode' => $prefix.'nullable|in:online,onsite,phone',
            'location' => $prefix.'nullable|string|max:1000',
            'contact_name' => $prefix.'nullable|string|max:255',
            'contact_email' => $prefix.'nullable|email|max:255',
            'preparation_notes' => $prefix.'nullable|string|max:10000',
            'required_documents' => $prefix.'nullable|array|max:100',
            'required_documents.*' => 'required|string|max:255',
            'status' => $prefix.'in:scheduled,completed,rescheduled,cancelled,missed',
            'outcome' => $prefix.'nullable|string|max:10000',
            'event_notes' => $prefix.'nullable|string|max:10000',
            'reminder_intervals' => $prefix.'nullable|array|max:3',
            'reminder_intervals.*' => 'required|integer|in:1440,60,15',
        ]);
        if (isset($data['starts_at'], $data['ends_at']) && $data['ends_at'] !== null
            && Carbon::parse($data['ends_at'])->lt(Carbon::parse($data['starts_at']))) {
            throw ValidationException::withMessages([
                'ends_at' => 'The event end must be after its start.',
            ]);
        }
        if (isset($data['reminder_intervals'])) {
            $data['reminder_intervals'] = array_values(array_unique($data['reminder_intervals']));
        }

        return $data;
    }

    private function ownedEvents(Request $request)
    {
        return RecruitmentEvent::where('user_id', $request->user()->id);
    }

    private function ownedApplications(Request $request)
    {
        return Application::whereHas('company', fn ($query) => $query->where('user_id', $request->user()->id));
    }

    private function eventSnapshot(RecruitmentEvent $event): array
    {
        return $event->only([
            'application_id',
            'event_type',
            'starts_at',
            'ends_at',
            'timezone',
            'mode',
            'location',
            'status',
            'outcome',
        ]);
    }
}
