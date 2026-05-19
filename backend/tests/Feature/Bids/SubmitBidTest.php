<?php

declare(strict_types=1);

namespace Tests\Feature\Bids;

use App\Models\Job;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubmitBidTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed standard categories and jobs
        $this->seed(DatabaseSeeder::class);
    }

    /**
     * Test that guests (unauthenticated users) are blocked from submitting bids.
     */
    public function test_guest_cannot_submit_bid(): void
    {
        $job = Job::where('status', 'open')->firstOrFail();

        $response = $this->postJson("/api/jobs/{$job->id}/bids", [
            'proposed_price' => 1000.50,
            'estimated_delivery_days' => 5,
            'cover_letter' => 'Hello, I would like to do this bookkeeping job.',
            'experience_summary' => 'I have 5 years experience in SaaS QuickBooks.',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test that an authenticated accountant can successfully submit a valid bid.
     */
    public function test_authenticated_accountant_can_submit_valid_bid(): void
    {
        $user = User::factory()->create();
        $job = Job::where('status', 'open')->firstOrFail();

        $response = $this->actingAs($user)
            ->postJson("/api/jobs/{$job->id}/bids", [
                'proposed_price' => 1200.00,
                'estimated_delivery_days' => 7,
                'cover_letter' => 'Dear Client, I can manage your SaaS accounts perfectly.',
                'experience_summary' => 'Reconciled 10 SaaS companies over past 4 years.',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'proposed_price',
                    'estimated_delivery_days',
                    'cover_letter',
                    'experience_summary',
                    'status',
                    'created_at',
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals(1200.00, (float) $data['proposed_price']);
        $this->assertEquals(7, $data['estimated_delivery_days']);
        $this->assertEquals('Dear Client, I can manage your SaaS accounts perfectly.', $data['cover_letter']);
        $this->assertEquals('pending', $data['status']);

        // Assert database persistence
        $this->assertDatabaseHas('bids', [
            'job_id' => $job->id,
            'user_id' => $user->id,
            'proposed_price' => 1200.00,
            'estimated_delivery_days' => 7,
            'cover_letter' => 'Dear Client, I can manage your SaaS accounts perfectly.',
            'experience_summary' => 'Reconciled 10 SaaS companies over past 4 years.',
            'status' => 'pending',
        ]);
    }

    /**
     * Test that bidding on a closed job is blocked with a 422 validation error.
     */
    public function test_cannot_bid_on_closed_job(): void
    {
        $user = User::factory()->create();
        // Grab a job and close it
        $job = Job::where('status', 'open')->firstOrFail();
        $job->update(['status' => 'closed']);

        $response = $this->actingAs($user)
            ->postJson("/api/jobs/{$job->id}/bids", [
                'proposed_price' => 1500.00,
                'estimated_delivery_days' => 10,
                'cover_letter' => 'I would love to help you prep your corporate tax returns.',
                'experience_summary' => 'Experienced CPA with multiple corporate accounts.',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['job'])
            ->assertJsonPath('errors.job.0', 'You cannot submit a bid for a closed job.');
    }

    /**
     * Test that duplicate bids on the same job by the same user are blocked.
     */
    public function test_cannot_submit_duplicate_bid(): void
    {
        $user = User::factory()->create();
        $job = Job::where('status', 'open')->firstOrFail();

        $payload = [
            'proposed_price' => 800.00,
            'estimated_delivery_days' => 4,
            'cover_letter' => 'I am the perfect bookkeeping resource for you.',
            'experience_summary' => 'Handled monthly books for ecommerce startup.',
        ];

        // First bid succeeds
        $this->actingAs($user)
            ->postJson("/api/jobs/{$job->id}/bids", $payload)
            ->assertStatus(201);

        // Second bid fails with a duplicate validation error
        $response = $this->actingAs($user)
            ->postJson("/api/jobs/{$job->id}/bids", $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['job'])
            ->assertJsonPath('errors.job.0', 'You have already submitted a bid for this job.');
    }

    /**
     * Test input validation rules (missing fields, negative prices, short strings).
     */
    public function test_submit_bid_validation_rules(): void
    {
        $user = User::factory()->create();
        $job = Job::where('status', 'open')->firstOrFail();

        // 1. Missing fields
        $response = $this->actingAs($user)
            ->postJson("/api/jobs/{$job->id}/bids", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'proposed_price',
                'estimated_delivery_days',
                'cover_letter',
                'experience_summary',
            ]);

        // 2. Negative price, 0 days, short text
        $response = $this->actingAs($user)
            ->postJson("/api/jobs/{$job->id}/bids", [
                'proposed_price' => -50.00,
                'estimated_delivery_days' => 0,
                'cover_letter' => 'Too short',
                'experience_summary' => 'Too short',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'proposed_price',
                'estimated_delivery_days',
                'cover_letter',
                'experience_summary',
            ]);
    }
}
