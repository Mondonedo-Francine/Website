<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_a_student_with_a_hashed_password(): void
    {
        $response = $this->postJson('/auth/register', [
            'name' => 'Test Student',
            'email' => 'student@example.com',
            'phone' => '09171234567',
            'password' => 'StrongPass123!',
            'password_confirmation' => 'StrongPass123!',
            'role' => 'teacher',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.role', 'student')
            ->assertJsonMissingPath('user.password');

        $user = User::where('email', 'student@example.com')->firstOrFail();

        $this->assertSame('student', $user->role);
        $this->assertNotSame('StrongPass123!', $user->password);
        $this->assertTrue(password_verify('StrongPass123!', $user->password));
    }

    public function test_user_can_log_in_with_email_and_correct_role(): void
    {
        User::create([
            'name' => 'Test Student',
            'email' => 'student@example.com',
            'phone' => '09171234567',
            'password' => 'StrongPass123!',
            'role' => 'student',
        ]);

        $this->postJson('/auth/login', [
            'username' => 'student@example.com',
            'password' => 'StrongPass123!',
            'role' => 'student',
        ])->assertOk()->assertJsonPath('user.email', 'student@example.com');

        $this->assertAuthenticated();
    }

    public function test_user_cannot_log_in_under_a_different_role(): void
    {
        User::create([
            'name' => 'Test Student',
            'email' => 'student@example.com',
            'password' => 'StrongPass123!',
            'role' => 'student',
        ]);

        $this->postJson('/auth/login', [
            'username' => 'student@example.com',
            'password' => 'StrongPass123!',
            'role' => 'teacher',
        ])->assertUnprocessable();

        $this->assertGuest();
    }

    public function test_session_user_endpoint_rejects_guests(): void
    {
        $this->getJson('/auth/user')->assertUnauthorized();
    }

    public function test_logout_invalidates_the_authenticated_session(): void
    {
        $user = User::create([
            'name' => 'Test Student',
            'email' => 'student@example.com',
            'password' => 'StrongPass123!',
            'role' => 'student',
        ]);

        $this->actingAs($user)->postJson('/auth/logout')->assertOk();

        $this->assertGuest();
    }
}
