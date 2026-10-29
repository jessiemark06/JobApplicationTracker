<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CareerToolsTest extends TestCase
{
    use RefreshDatabase;

    public function test_application_status_history_and_analytics_are_recorded_without_duplicates(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $company = Company::create([
            'user_id' => $user->id,
            'name' => 'Acme',
            'location' => 'Remote',
        ]);
        Sanctum::actingAs($user);

        $applicationResponse = $this->postJson('/api/applications', [
            'company_id' => $company->id,
            'job_title' => 'Developer',
            'status' => 'Applied',
            'applied_at' => today()->toDateString(),
            'source' => 'Referral',
        ])->assertCreated();
        $applicationId = $applicationResponse->json('application.id');
        $this->assertDatabaseCount('application_status_histories', 1);

        $this->putJson('/api/applications/'.$applicationId, [
            'company_id' => $company->id,
            'job_title' => 'Developer',
            'status' => 'Applied',
            'applied_at' => today()->toDateString(),
            'source' => 'Referral',
        ])->assertOk();
        $this->assertDatabaseCount('application_status_histories', 1);

        $this->putJson('/api/applications/'.$applicationId, [
            'company_id' => $company->id,
            'job_title' => 'Developer',
            'status' => 'Interview',
            'status_note' => 'Technical interview scheduled',
            'applied_at' => today()->toDateString(),
            'source' => 'Referral',
        ])->assertOk();
        $this->assertDatabaseHas('application_status_histories', [
            'application_id' => $applicationId,
            'previous_status' => 'Applied',
            'new_status' => 'Interview',
            'notes' => 'Technical interview scheduled',
        ]);
        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $user->id,
            'application_id' => $applicationId,
            'type' => 'application_update',
        ]);

        $this->getJson('/api/analytics?from='.today()->toDateString().'&to='.today()->toDateString())
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('interview_rate', 100)
            ->assertJsonPath('response_rate', 100)
            ->assertJsonPath('by_source.Referral', 1);
    }

    public function test_users_cannot_schedule_follow_ups_for_another_users_application(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $otherUser = User::factory()->create(['email_verified_at' => now()]);
        $company = Company::create([
            'user_id' => $owner->id,
            'name' => 'Private Company',
            'location' => 'Remote',
        ]);
        $application = Application::create([
            'company_id' => $company->id,
            'job_title' => 'Private role',
            'status' => 'Applied',
        ]);

        Sanctum::actingAs($otherUser);
        $this->postJson('/api/follow-ups', [
            'application_id' => $application->id,
            'scheduled_at' => now()->addDay()->toISOString(),
        ])->assertNotFound();

        $this->getJson('/api/follow-ups')->assertOk()->assertJsonCount(0, 'follow_ups');
    }

    public function test_skills_and_job_requirements_are_owned_by_the_authenticated_user(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $otherUser = User::factory()->create(['email_verified_at' => now()]);
        Sanctum::actingAs($owner);

        $skill = $this->postJson('/api/skills', [
            'name' => 'PHP',
            'status' => 'learning',
        ])->assertCreated()->json('skill');
        $requirement = $this->postJson('/api/job-requirements', [
            'job_title' => 'Backend Developer',
            'required_skills' => ['PHP', 'SQL'],
        ])->assertCreated()->json('requirement');

        Sanctum::actingAs($otherUser);
        $this->putJson('/api/skills/'.$skill['id'], ['status' => 'have_experience'])->assertNotFound();
        $this->deleteJson('/api/job-requirements/'.$requirement['id'])->assertNotFound();
    }

    public function test_follow_ups_and_company_research_can_be_created_and_updated(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $company = Company::create([
            'user_id' => $user->id,
            'name' => 'Acme',
            'location' => 'Remote',
        ]);
        $application = Application::create([
            'company_id' => $company->id,
            'job_title' => 'Developer',
            'status' => 'Applied',
        ]);
        Sanctum::actingAs($user);

        $followUp = $this->postJson('/api/follow-ups', [
            'application_id' => $application->id,
            'scheduled_at' => now()->addDay()->toISOString(),
            'notes' => 'Check on application status',
        ])->assertCreated()->json('follow_up');
        $this->postJson('/api/follow-ups/'.$followUp['id'].'/complete')
            ->assertOk()
            ->assertJsonPath('follow_up.id', $followUp['id']);
        $this->assertNotNull(\App\Models\FollowUp::findOrFail($followUp['id'])->completed_at);

        $this->postJson('/api/companies/'.$company->id.'/research', [
            'category' => 'salary',
            'content' => 'Reported range: 70k-90k, shared by a recruiter.',
            'source_url' => 'https://example.com/careers',
            'source_date' => today()->toDateString(),
        ])->assertCreated();
        $this->getJson('/api/companies/edit/'.$company->id)
            ->assertOk()
            ->assertJsonPath('company.research_entries.0.category', 'salary');
    }

    public function test_private_documents_are_only_downloadable_by_the_application_owner(): void
    {
        Storage::fake('local');
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $otherUser = User::factory()->create(['email_verified_at' => now()]);
        $company = Company::create([
            'user_id' => $owner->id,
            'name' => 'Acme',
            'location' => 'Remote',
        ]);
        $application = Application::create([
            'company_id' => $company->id,
            'job_title' => 'Developer',
            'status' => 'Applied',
        ]);
        $path = 'application-documents/private-resume.pdf';
        Storage::disk('local')->put($path, 'private resume');
        $document = ApplicationDocument::create([
            'application_id' => $application->id,
            'type' => 'resume',
            'original_name' => 'resume.pdf',
            'mime_type' => 'application/pdf',
            'size' => 14,
            'disk' => 'local',
            'path' => $path,
        ]);

        Sanctum::actingAs($otherUser);
        $this->getJson('/api/documents/'.$document->id.'/download')->assertNotFound();

        Sanctum::actingAs($owner);
        $this->get('/api/documents/'.$document->id.'/download')->assertOk();
    }

    public function test_analytics_returns_zero_rates_for_an_empty_dataset(): void
    {
        Sanctum::actingAs(User::factory()->create(['email_verified_at' => now()]));

        $this->getJson('/api/analytics')
            ->assertOk()
            ->assertJsonPath('total', 0)
            ->assertJsonPath('interview_rate', 0)
            ->assertJsonPath('response_rate', 0)
            ->assertJsonPath('average_response_days', null);
    }
}
