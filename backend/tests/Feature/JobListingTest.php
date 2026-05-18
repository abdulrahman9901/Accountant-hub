<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Job;
use App\Models\JobCategory;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobListingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed standard categories and jobs
        $this->seed(DatabaseSeeder::class);
    }

    /**
     * Test basic listing with standard pagination and metadata structure.
     */
    public function test_can_list_all_open_jobs_paginated(): void
    {
        $response = $this->getJson('/api/jobs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
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
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        // Standard seeder creates 5 jobs, but 1 is marked as closed by default in seeder (Summit Nonprofit)
        // Therefore, exactly 4 open jobs should be visible in the catalog.
        $this->assertCount(4, $response->json('data'));
        $this->assertEquals(4, $response->json('meta.total'));
    }

    /**
     * Test filtering by search term in title or description.
     */
    public function test_can_filter_jobs_by_search_keyword(): void
    {
        // Search term in title
        $response = $this->getJson('/api/jobs?search=SaaS');
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Monthly Bookkeeping for SaaS Startup', $data[0]['title']);

        // Search term in description
        $response = $this->getJson('/api/jobs?search=reconcile');
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Monthly Bookkeeping for SaaS Startup', $data[0]['title']);

        // Search that matches nothing
        $response = $this->getJson('/api/jobs?search=NonExistentCompany');
        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data'));
    }

    /**
     * Test filtering by category slug or database ID.
     */
    public function test_can_filter_jobs_by_category(): void
    {
        $category = JobCategory::where('slug', 'bookkeeping')->firstOrFail();

        // 1. Filter by category slug
        $response = $this->getJson('/api/jobs?category=bookkeeping');
        $response->assertStatus(200);
        $data = $response->json('data');
        foreach ($data as $job) {
            $this->assertEquals('bookkeeping', $job['category']['slug']);
        }

        // 2. Filter by category ID
        $response = $this->getJson('/api/jobs?category='.$category->id);
        $response->assertStatus(200);
        $data = $response->json('data');
        foreach ($data as $job) {
            $this->assertEquals($category->id, $job['category']['id']);
        }
    }

    /**
     * Test filtering by min and max budgets.
     */
    public function test_can_filter_jobs_by_budget_range(): void
    {
        // 1. Min budget filter: matches jobs where budget_max >= 2500
        // Expected: "Corporate Tax Return Preparation" (max 4000)
        $response = $this->getJson('/api/jobs?min_budget=2500');
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Corporate Tax Return Preparation', $data[0]['title']);

        // 2. Max budget filter: matches jobs where budget_min <= 800
        // Expected: Bookkeeping (min 800), Payroll (min 600)
        $response = $this->getJson('/api/jobs?max_budget=800');
        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    /**
     * Test sorting jobs by budget and deadline.
     */
    public function test_can_sort_jobs_by_different_modes(): void
    {
        // 1. Sort by highest budget (budget_max DESC)
        $response = $this->getJson('/api/jobs?sort_by=highest_budget');
        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertEquals('Corporate Tax Return Preparation', $data[0]['title']); // 4000 max
        $this->assertEquals('Year-End Financial Statements', $data[1]['title']); // 2200 max

        // 2. Sort by deadline (deadline ASC)
        $response = $this->getJson('/api/jobs?sort_by=deadline');
        $response->assertStatus(200);
        $data = $response->json('data');

        // Verify deadline is in ascending order
        $firstDeadline = $data[0]['deadline'];
        $secondDeadline = $data[1]['deadline'];
        $this->assertTrue(strtotime($firstDeadline) <= strtotime($secondDeadline));
    }

    /**
     * Test that closed jobs are never visible in public browsing.
     */
    public function test_does_not_list_closed_jobs(): void
    {
        // Find one open job and close it
        $job = Job::where('status', 'open')->firstOrFail();
        $job->update(['status' => 'closed']);

        $response = $this->getJson('/api/jobs');
        $response->assertStatus(200);

        // Standard open count was 4, closing one makes it 3
        $this->assertCount(3, $response->json('data'));

        // Assert that the closed job ID is not in response
        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertNotContains($job->id, $ids);
    }
}
