<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_successfully_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
        ]);

        $payload = [
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/login', $payload);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'created_at'],
            'token',
        ]);

        $response->assertJsonFragment([
            'id' => $user->id,
            'name' => $user->name,
            'email' => 'john@example.com',
        ]);

        $this->assertCount(1, $user->fresh()->tokens);
    }

    public function test_login_fails_with_incorrect_credentials(): void
    {
        User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
        ]);

        $payload = [
            'email' => 'john@example.com',
            'password' => 'wrong-password',
        ];

        $response = $this->postJson('/api/login', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_login_fails_validation_for_invalid_email_or_empty_fields(): void
    {
        $payload = [
            'email' => 'not-an-email',
            'password' => '',
        ];

        $response = $this->postJson('/api/login', $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password']);
    }
}
