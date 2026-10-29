<?php

namespace App\Services;

use App\Models\UserNotification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class UserNotificationService
{
    public function create(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?int $applicationId = null,
        ?int $eventId = null,
        ?string $destination = null,
        ?string $dedupeKey = null,
    ): UserNotification {
        if ($dedupeKey !== null) {
            return UserNotification::firstOrCreate(
                ['dedupe_key' => $dedupeKey],
                [
                    'user_id' => $userId,
                    'type' => $type,
                    'title' => $title,
                    'message' => $message,
                    'application_id' => $applicationId,
                    'recruitment_event_id' => $eventId,
                    'destination' => $destination,
                ],
            );
        }

        return UserNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'application_id' => $applicationId,
            'recruitment_event_id' => $eventId,
            'destination' => $destination,
        ]);
    }

    public function sendOptionalEmail(UserNotification $notification, User $user, string $preference): void
    {
        if (!$user->hasVerifiedEmail() || !($user->notification_preferences[$preference] ?? false)) {
            return;
        }

        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            $notification->update(['email_status' => 'preview']);
            return;
        }

        $destination = $notification->destination
            ? rtrim(config('app.frontend_url'), '/').'/#'. $notification->destination
            : rtrim(config('app.frontend_url'), '/').'/#/notifications';

        try {
            Mail::raw(
                "{$notification->title}\n\n{$notification->message}\n\nOpen in JobTrack: {$destination}",
                fn ($message) => $message->to($user->email)->subject("JobTrack: {$notification->title}"),
            );
            $notification->update([
                'email_status' => 'sent',
                'email_attempted_at' => now(),
                'email_error' => null,
            ]);
        } catch (Throwable $exception) {
            $notification->update([
                'email_status' => 'failed',
                'email_attempted_at' => now(),
                'email_error' => 'Email delivery failed. Check mail configuration.',
            ]);
            Log::warning('JobTrack notification email failed.', [
                'notification_id' => $notification->id,
                'exception' => $exception::class,
            ]);
        }
    }
}
