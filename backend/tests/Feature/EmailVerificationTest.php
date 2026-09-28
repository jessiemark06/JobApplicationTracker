<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyJobTrackEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_sends_verification_email_and_does_not_verify_user(): void
    {
        Notification::fake();

        $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'new-user@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()->assertJsonPath('message', 'Account created. Check your email for a verification link before signing in.');

        $user = User::where('email', 'new-user@example.com')->firstOrFail();
        $this->assertNull($user->email_verified_at);
        Notification::assertSentTo($user, VerifyJobTrackEmail::class);

        $mail = (new VerifyJobTrackEmail())->toMail($user);
        $this->assertSame('Verify your JobTrack email address', $mail->subject);
        $this->assertSame('emails.jobtrack-verify', $mail->view);
        $this->assertSame('New User', $mail->viewData['name']);
        $html = view($mail->view, $mail->viewData)->render();
        $this->assertStringContainsString(e($mail->viewData['verificationUrl']), $html);
        $this->assertStringNotContainsString($mail->viewData['verificationUrl'], strip_tags($html));
    }

    public function test_unverified_user_cannot_log_in_and_signed_link_verifies_email(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'unverified@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertForbidden()->assertJsonPath('email_verified', false);

        \Laravel\Sanctum\Sanctum::actingAs($user);
        $this->getJson('/api/companies')->assertForbidden();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(30),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())],
        );

        $this->get($verificationUrl)->assertOk()->assertSee('Email verified');
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_verification_page_redirects_to_frontend_home_page(): void
    {
        config()->set('app.frontend_url', 'https://jobtrack.vercel.app');

        $user = User::factory()->unverified()->create([
            'email' => 'home-page@example.com',
            'password' => 'password123',
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(30),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())],
        );

        $this->get($verificationUrl)
            ->assertOk()
            ->assertSee('https://jobtrack.vercel.app/#/');
    }
}