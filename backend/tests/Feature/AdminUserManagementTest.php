<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_user_management(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/admin/users')->assertForbidden();
    }

    public function test_admin_can_update_and_soft_delete_other_users(): void
    {
        $admin = User::factory()->create(['email' => 'jessiemarkbaronda06@gmail.com']);
        $managedUser = User::factory()->create();
        Sanctum::actingAs($admin);

        $this->putJson('/api/admin/users/'.$managedUser->id, [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ])->assertOk()->assertJsonPath('user.name', 'Updated Name');

        $this->deleteJson('/api/admin/users/'.$managedUser->id)->assertOk();

        $this->assertSoftDeleted('users', ['id' => $managedUser->id]);
    }
}