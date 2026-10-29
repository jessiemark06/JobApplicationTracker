<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Company;
use App\Models\FollowUp;
use App\Models\RecruitmentEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InterviewAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_create_reschedule_and_cancel_owned_events_without_changing_application_status(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $application = $this->createApplicationFor($user);
        Sanctum::actingAs($user);

        $event = $this->postJson('/api/interviews', [
            'application_id' => $application->id,
            'event_type' => 'Technical interview',
            'starts_at' => now()->addDays(2)->toISOString(),
            'timezone' => 'Asia/Manila',
            'mode' => 'online',
            'location' => 'https://meet.example.test/room',
            'reminder_intervals' => [1440, 60],
        ])->assertCreated()
            ->assertJsonPath('event.application_id', $application->id)
            ->json('event');

        $newStart = now()->addDays(3)->toISOString();
        $this->putJson('/api/interviews/'.$event['id'], [
            'starts_at' => $newStart,
        ])->assertOk()->assertJsonPath('event.status', 'rescheduled');
        $this->assertDatabaseHas('recruitment_event_histories', [
            'recruitment_event_id' => $event['id'],
            'action' => 'rescheduled',
        ]);

        $this->putJson('/api/interviews/'.$event['id'], [
            'status' => 'cancelled',
        ])->assertOk()->assertJsonPath('event.status', 'cancelled');
        $this->assertDatabaseHas('recruitment_event_histories', [
            'recruitment_event_id' => $event['id'],
            'action' => 'cancelled',
        ]);
        $this->assertSame('Applied', $application->fresh()->status);
    }

    public function test_users_cannot_access_another_users_events_or_notifications(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $otherUser = User::factory()->create(['email_verified_at' => now()]);
        $application = $this->createApplicationFor($owner);
        Sanctum::actingAs($owner);
        $event = $this->postJson('/api/interviews', [
            'application_id' => $application->id,
            'event_type' => 'Recruiter call',
            'starts_at' => now()->addDay()->toISOString(),
            'reminder_intervals' => [],
        ])->assertCreated()->json('event');
        $notification = \App\Models\UserNotification::where('user_id', $owner->id)->firstOrFail();

        Sanctum::actingAs($otherUser);
        $this->getJson('/api/interviews/'.$event['id'])->assertNotFound();
        $this->getJson('/api/notifications')->assertOk()->assertJsonCount(0, 'data');
        $this->postJson('/api/notifications/'.$notification->id.'/read')->assertNotFound();
    }

    public function test_scheduler_creates_each_due_reminder_once_and_ignores_cancelled_events(): void
    {
        $this->travelTo(now()->startOfMinute());
        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->notification_preferences = [
            'email_interview_reminders' => true,
            'email_deadline_reminders' => false,
            'email_follow_up_reminders' => false,
        ];
        $user->save();
        $application = $this->createApplicationFor($user);
        $event = RecruitmentEvent::create([
            'user_id' => $user->id,
            'application_id' => $application->id,
            'event_type' => 'Initial interview',
            'starts_at' => now()->addMinutes(15)->addSeconds(20),
            'timezone' => 'UTC',
            'status' => 'scheduled',
            'reminder_intervals' => [15],
        ]);
        FollowUp::create([
            'application_id' => $application->id,
            'scheduled_at' => now()->subMinute(),
            'notes' => 'Check application update',
        ]);
        RecruitmentEvent::create([
            'user_id' => $user->id,
            'application_id' => $application->id,
            'event_type' => 'Cancelled call',
            'starts_at' => now()->addMinutes(15),
            'timezone' => 'UTC',
            'status' => 'cancelled',
            'reminder_intervals' => [15],
        ]);

        Artisan::call('jobtrack:process-reminders');
        Artisan::call('jobtrack:process-reminders');

        $this->assertDatabaseCount('event_reminder_deliveries', 1);
        $this->assertDatabaseHas('event_reminder_deliveries', [
            'recruitment_event_id' => $event->id,
            'email_status' => 'preview',
        ]);
        $this->assertDatabaseCount('follow_up_reminder_deliveries', 1);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $user->id,
            'type' => 'follow_up',
        ]);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $user->id,
            'recruitment_event_id' => $event->id,
            'type' => 'reminder',
        ]);
        $this->assertSame(1, \App\Models\UserNotification::where('type', 'reminder')->count());
        $this->travelBack();
    }

    public function test_profile_preferences_email_verification_and_password_reauthentication(): void
    {
        Notification::fake();
        $user = User::factory()->create([
            'email' => 'profile@example.test',
            'email_verified_at' => now(),
            'password' => 'old-password',
        ]);
        $currentToken = $user->createToken('profile-test');
        $otherToken = $user->createToken('other-session');
        $this->withToken($currentToken->plainTextToken);

        $this->putJson('/api/profile', [
            'name' => 'Profile Updated',
            'timezone' => 'Asia/Manila',
            'notification_preferences' => [
                'default_reminder_intervals' => [60, 15],
                'email_interview_reminders' => true,
                'email_deadline_reminders' => false,
                'email_follow_up_reminders' => false,
                'email_application_updates' => false,
            ],
        ])->assertOk()->assertJsonPath('user.name', 'Profile Updated');
        $this->assertSame('Asia/Manila', $user->fresh()->timezone);
        $this->assertSame([60, 15], $user->fresh()->notification_preferences['default_reminder_intervals']);

        $this->putJson('/api/profile/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertUnprocessable();
        $this->assertTrue(Hash::check('old-password', $user->fresh()->password));

        $this->putJson('/api/profile/password', [
            'current_password' => 'old-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk();
        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $otherToken->accessToken->id]);
        $this->assertDatabaseHas('personal_access_tokens', ['id' => $currentToken->accessToken->id]);

        $this->putJson('/api/profile', [
            'email' => 'changed@example.test',
        ])->assertOk()->assertJsonFragment(['email_verified_at' => null]);
        $this->assertNull($user->fresh()->email_verified_at);
        Notification::assertSentTo($user->fresh(), \App\Notifications\VerifyJobTrackEmail::class);
    }

    private function createApplicationFor(User $user): Application
    {
        $company = Company::create([
            'user_id' => $user->id,
            'name' => 'Test company',
            'location' => 'Remote',
        ]);

        return Application::create([
            'company_id' => $company->id,
            'job_title' => 'Software engineer',
            'status' => 'Applied',
        ]);
    }
}
