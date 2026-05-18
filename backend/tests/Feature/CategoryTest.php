<?php

declare(strict_types=1);

namespace Tests\Feature;

use Database\Seeders\JobCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that guest can retrieve the list of all categories sorted alphabetically.
     */
    public function test_guest_can_retrieve_alphabetically_sorted_categories(): void
    {
        // Seed job categories using existing seeder
        $this->seed(JobCategorySeeder::class);

        // Fetch categories from public endpoint
        $response = $this->getJson('/api/categories');

        // Assert response status
        $response->assertStatus(200);

        // Assert response JSON structure and exact counts
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'slug'],
            ],
        ]);

        $data = $response->json('data');
        $this->assertCount(5, $data);

        // Verify categories are returned in alphabetical order
        $expectedOrder = [
            'Audit Support',
            'Bookkeeping',
            'Financial Reporting',
            'Payroll',
            'Tax Preparation',
        ];

        foreach ($expectedOrder as $index => $name) {
            $this->assertEquals($name, $data[$index]['name']);
        }
    }
}
