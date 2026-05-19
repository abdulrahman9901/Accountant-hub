<?php

declare(strict_types=1);

namespace Tests\Feature\Bids;

use App\Models\Bid;
use App\Models\Job;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserBidsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed standard categories and jobs
        $this->seed(DatabaseSeeder::class);
    }

    /**
     * Test that guests (unauthenticated users) are blocked from fetching user bids.
     */
    public function test_guest_cannot_retrieve_bids(): void
    {
        $response = $this->getJson('/api/user/bids');

        $response->assertStatus(401);
    }

    /**
     * Test that a user with no bids placed gets a successful empty listing.
     */
    public function test_user_receives_empty_array_if_no_bids(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/user/bids');

        $response->assertStatus(200)
            ->assertJsonPath('data', []);
    }

    /**
     * Test that an accountant can fetch all their submitted bids with nested jobs and categories.
     */
    public function test_user_can_retrieve_placed_bids_with_nested_job_and_category(): void
    {
        $user = User::factory()->create();
        $jobs = Job::where('status', 'open')->take(2)->get();

        // Submit first bid
        $bid1 = Bid::create([
            'job_id' => $jobs[0]->id,
            'user_id' => $user->id,
            'proposed_price' => 1500.00,
            'estimated_delivery_days' => 5,
            'cover_letter' => 'Proposal for SaaS Bookkeeping.',
            'experience_summary' => 'QuickBooks certified expert with 3+ years.',
            'status' => 'pending',
        ]);

        // Submit second bid slightly later (so sorting descending is predictable)
        $this->travel(1)->hour();

        $bid2 = Bid::create([
            'job_id' => $jobs[1]->id,
            'user_id' => $user->id,
            'proposed_price' => 3000.00,
            'estimated_delivery_days' => 12,
            'cover_letter' => 'Proposal for Corporate Tax filing.',
            'experience_summary' => 'Senior CPA specializing in high-net-worth tax plans.',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/user/bids');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'proposed_price',
                        'estimated_delivery_days',
                        'cover_letter',
                        'experience_summary',
                        'status',
                        'created_at',
                        'job' => [
                            'id',
                            'title',
                            'company_name',
                            'description',
                            'budget_min',
                            'budget_max',
                            'deadline',
                            'posted_date',
                            'status',
                            'category' => [
                                'id',
                                'name',
                                'slug',
                            ],
                        ],
                    ],
                ],
            ]);

        $data = $response->json('data');

        // Exactly 2 bids should be returned
        $this->assertCount(2, $data);

        // Sorting check (most recent first: bid2 then bid1)
        $this->assertEquals($bid2->id, $data[0]['id']);
        $this->assertEquals($bid1->id, $data[1]['id']);

        // Assert nested relation values are populated
        $this->assertEquals($jobs[1]->id, $data[0]['job']['id']);
        $this->assertEquals($jobs[1]->title, $data[0]['job']['title']);
        $this->assertEquals($jobs[1]->category->name, $data[0]['job']['category']['name']);
    }

    /**
     * Test that the returned bids are strictly isolated to the authenticated user.
     */
    public function test_does_not_return_other_users_bids(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $job = Job::where('status', 'open')->firstOrFail();

        // User B submits a bid
        Bid::create([
            'job_id' => $job->id,
            'user_id' => $userB->id,
            'proposed_price' => 2000.00,
            'estimated_delivery_days' => 10,
            'cover_letter' => 'User B bid letter description.',
            'experience_summary' => 'User B experience summary text.',
            'status' => 'pending',
        ]);

        // User A fetches their bids (should be empty)
        $response = $this->actingAs($userA)
            ->getJson('/api/user/bids');

        $response->assertStatus(200)
            ->assertJsonPath('data', []);
    }
}
