<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Job;
use App\Models\JobCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the database seeder successfully populates categories and jobs.
     */
    public function test_database_seeder_populates_expected_data(): void
    {
        // Run database seeders
        $this->seed();

        // Verify categories count and attributes
        $this->assertDatabaseCount('job_categories', 5);

        $expectedCategories = [
            'Bookkeeping' => 'bookkeeping',
            'Tax Preparation' => 'tax-preparation',
            'Payroll' => 'payroll',
            'Financial Reporting' => 'financial-reporting',
            'Audit Support' => 'audit-support',
        ];

        foreach ($expectedCategories as $name => $slug) {
            $this->assertDatabaseHas('job_categories', [
                'name' => $name,
                'slug' => $slug,
            ]);
        }

        // Verify jobs count and attributes
        $this->assertDatabaseCount('jobs', 5);

        $expectedJobs = [
            'Monthly Bookkeeping for SaaS Startup' => 'CloudLedger Inc.',
            'Corporate Tax Return Preparation' => 'Northbridge Holdings',
            'Payroll Processing & Compliance' => 'GreenField Retail',
            'Year-End Financial Statements' => 'Atlas Manufacturing',
            'Audit Support & Workpaper Prep' => 'Summit Nonprofit',
        ];

        foreach ($expectedJobs as $title => $companyName) {
            $this->assertDatabaseHas('jobs', [
                'title' => $title,
                'company_name' => $companyName,
            ]);
        }

        // Verify all jobs are correctly associated with a category
        $jobs = Job::all();
        foreach ($jobs as $job) {
            $this->assertNotNull($job->category_id);
            $this->assertInstanceOf(JobCategory::class, $job->category);
        }

        // Verify status fields (one closed, four open)
        $this->assertEquals(4, Job::where('status', 'open')->count());
        $this->assertEquals(1, Job::where('status', 'closed')->count());
    }
}
