<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Job;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobDetailsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed standard categories and jobs
        $this->seed(DatabaseSeeder::class);
    }

    /**
     * Test successful retrieval of an existing job's details.
     */
    public function test_can_retrieve_single_job_details(): void
    {
        $job = Job::firstOrFail();

        $response = $this->getJson("/api/jobs/{$job->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'company_name',
                    'description',
                    'budget_min',
                    'budget_max',
                    'deadline',
                    'posted_date',
                    'status',
                    'bids_count',
                    'category' => ['id', 'name', 'slug'],
                ],
            ]);

        $data = $response->json('data');

        $this->assertEquals($job->id, $data['id']);
        $this->assertEquals($job->title, $data['title']);
        $this->assertEquals($job->company_name, $data['company_name']);
        $this->assertEquals($job->description, $data['description']);
        $this->assertEquals($job->status, $data['status']);
        $this->assertEquals($job->category->id, $data['category']['id']);
        $this->assertEquals($job->category->name, $data['category']['name']);
        $this->assertEquals(0, $data['bids_count']);
    }

    /**
     * Test that retrieving a non-existent job ID returns a 404 error.
     */
    public function test_returns_404_if_job_not_found(): void
    {
        $response = $this->getJson('/api/jobs/99999');

        $response->assertStatus(404);
    }
}
