<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_retrieve_their_data(): void
    {
        $user = User::factory()->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/user');

        $response->assertStatus(200);
        $response->assertJson([
            'data' => [
                'id' => $user->id,
                'name' => 'Jane Doe',
                'email' => 'jane@example.com',
            ],
        ]);
    }

    public function test_unauthenticated_user_cannot_retrieve_their_data(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }
}
