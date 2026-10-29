<?php

namespace App\Console\Commands;

use App\Models\EventReminderDelivery;
use App\Models\FollowUp;
use App\Models\FollowUpReminderDelivery;
use App\Models\RecruitmentEvent;
use App\Models\UserNotification;
use App\Services\UserNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ProcessJobTrackReminders extends Command
{
    protected $signature = 'jobtrack:process-reminders';

    protected $description = 'Create due in-app interview and follow-up reminders';

    public function handle(UserNotificationService $notifications): int
    {
        $now = now()->utc();
        $this->processEventReminders($now, $notifications);
        $this->processFollowUpReminders($now, $notifications);

        return self::SUCCESS;
    }

    private function processEventReminders(Carbon $now, UserNotificationService $notifications): void
    {
        $events = RecruitmentEvent::with(['application.company', 'user'])
            ->whereIn('status', ['scheduled', 'rescheduled'])
            ->where('starts_at', '>', $now)
            ->where('starts_at', '<=', $now->copy()->addDay())
            ->get();

        foreach ($events as $event) {
            $intervals = array_values(array_intersect([1440, 60, 15], $event->reminder_intervals ?? []));
            foreach ($intervals as $minutes) {
                $targetTime = $event->starts_at->copy()->subMinutes($minutes);
                if ($targetTime->lte($now->copy()->subMinute()) || $targetTime->gte($now->copy()->addMinute())) {
                    continue;
                }

                $delivery = DB::transaction(function () use ($event, $minutes, $notifications) {
                    $delivery = EventReminderDelivery::firstOrCreate(
                        [
                            'recruitment_event_id' => $event->id,
                            'event_starts_at' => $event->starts_at,
                            'minutes_before' => $minutes,
                        ],
                        ['email_status' => 'pending'],
                    );
                    if (!$delivery->wasRecentlyCreated) {
                        return null;
                    }

                    $application = $event->application;
                    $notification = $notifications->create(
                        $event->user_id,
                        'reminder',
                        $minutes === 1440 ? 'Event tomorrow' : "Event in {$minutes} minutes",
                        "{$event->event_type} for {$application->job_title} at {$application->company->name}.",
                        $application->id,
                        $event->id,
                        '/interviews?event_id='.$event->id,
                        "event-reminder:{$event->id}:{$event->starts_at->timestamp}:{$minutes}",
                    );
                    $delivery->update(['notification_id' => $notification->id]);

                    return $delivery;
                });

                if ($delivery) {
                    $this->sendReminderEmail($delivery, $event);
                }
            }
        }
    }

    private function sendReminderEmail(EventReminderDelivery $delivery, RecruitmentEvent $event): void
    {
        $preferences = $event->user->notification_preferences ?? [];
        $isDeadline = str_contains(strtolower($event->event_type), 'deadline')
            || str_contains(strtolower($event->event_type), 'assessment');
        $categoryPreference = $isDeadline
            ? 'email_deadline_reminders'
            : 'email_interview_reminders';

        if (!$event->user->hasVerifiedEmail() || !($preferences[$categoryPreference] ?? false)) {
            $delivery->update(['email_status' => 'not_requested']);
            return;
        }

        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            $delivery->update(['email_status' => 'preview']);
            return;
        }

        $application = $event->application;
        $timezone = $event->timezone ?: $event->user->timezone ?: 'UTC';
        $dateTime = $event->starts_at->copy()->setTimezone($timezone)->format('Y-m-d H:i T');
        $destination = rtrim(config('app.frontend_url'), '/').'/#/interviews?event_id='.$event->id;
        $body = implode("\n", [
            "JobTrack reminder: {$event->event_type}",
            "Company: {$application->company->name}",
            "Role: {$application->job_title}",
            "When: {$dateTime}",
            'Mode: '.($event->mode ?: 'Not specified'),
            'Location or meeting link: '.($event->location ?: 'Not provided'),
            "Open in JobTrack: {$destination}",
        ]);

        try {
            Mail::raw($body, function ($message) use ($event) {
                $message->to($event->user->email)
                    ->subject("JobTrack reminder: {$event->event_type}");
            });
            $delivery->update([
                'email_status' => 'sent',
                'email_attempted_at' => now(),
                'email_error' => null,
            ]);
        } catch (Throwable $exception) {
            $delivery->update([
                'email_status' => 'failed',
                'email_attempted_at' => now(),
                'email_error' => 'Email delivery failed. Check mail configuration.',
            ]);
            Log::warning('JobTrack event reminder email failed.', [
                'reminder_delivery_id' => $delivery->id,
                'exception' => $exception::class,
            ]);
        }
    }

    private function processFollowUpReminders(Carbon $now, UserNotificationService $notifications): void
    {
        FollowUp::with('application.company.user')
            ->whereNull('completed_at')
            ->where('scheduled_at', '<=', $now)
            ->whereHas('application.company.user', function ($query) {
                $query->whereNotNull('id');
            })
            ->chunkById(100, function ($followUps) use ($notifications) {
                foreach ($followUps as $followUp) {
                    $application = $followUp->application;
                    $userId = $application->company->user_id;
                    $delivery = DB::transaction(function () use ($followUp, $application, $userId, $notifications) {
                        $delivery = FollowUpReminderDelivery::firstOrCreate(
                            ['follow_up_id' => $followUp->id, 'scheduled_at' => $followUp->scheduled_at],
                            ['email_status' => 'pending'],
                        );
                        if (!$delivery->wasRecentlyCreated) {
                            return null;
                        }
                        $notification = $notifications->create(
                            $userId,
                            'follow_up',
                            'Follow-up is due',
                            "Your follow-up for {$application->job_title} at {$application->company->name} is due.",
                            $application->id,
                            null,
                            '/career-tools',
                            "follow-up-due:{$followUp->id}:{$followUp->scheduled_at->timestamp}",
                        );
                        $delivery->update(['notification_id' => $notification->id]);

                        return $delivery;
                    });
                    if ($delivery) {
                        $this->sendFollowUpEmail($delivery, $followUp);
                    }
                }
            });
    }

    private function sendFollowUpEmail(FollowUpReminderDelivery $delivery, FollowUp $followUp): void
    {
        $user = $followUp->application->company->user;
        $preferences = $user->notification_preferences ?? [];
        if (!$user->hasVerifiedEmail() || !($preferences['email_follow_up_reminders'] ?? false)) {
            $delivery->update(['email_status' => 'not_requested']);
            return;
        }
        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            $delivery->update(['email_status' => 'preview']);
            return;
        }
        $application = $followUp->application;
        $destination = rtrim(config('app.frontend_url'), '/').'/#/career-tools';

        try {
            Mail::raw(
                "JobTrack follow-up reminder\nCompany: {$application->company->name}\nRole: {$application->job_title}\nOpen in JobTrack: {$destination}",
                fn ($message) => $message->to($user->email)->subject('JobTrack follow-up is due'),
            );
            $delivery->update(['email_status' => 'sent', 'email_attempted_at' => now()]);
        } catch (Throwable $exception) {
            $delivery->update([
                'email_status' => 'failed',
                'email_attempted_at' => now(),
                'email_error' => 'Email delivery failed. Check mail configuration.',
            ]);
            Log::warning('JobTrack follow-up reminder email failed.', [
                'reminder_delivery_id' => $delivery->id,
                'exception' => $exception::class,
            ]);
        }
    }
}
