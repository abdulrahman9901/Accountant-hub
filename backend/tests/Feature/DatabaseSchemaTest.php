<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_core_tables_exist(): void
    {
        $this->assertTrue(Schema::hasTable('users'));
        $this->assertTrue(Schema::hasTable('job_categories'));
        $this->assertTrue(Schema::hasTable('jobs'));
        $this->assertTrue(Schema::hasTable('bids'));
        $this->assertTrue(Schema::hasColumns('bids', [
            'job_id',
            'user_id',
            'proposed_price',
            'estimated_delivery_days',
            'cover_letter',
            'experience_summary',
            'status',
        ]));
    }

    public function test_bids_table_enforces_unique_job_user_pair(): void
    {
        $indexes = Schema::getIndexes('bids');
        $uniqueOnJobUser = collect($indexes)->contains(
            fn (array $index) => $index['unique'] === true
                && collect($index['columns'])->sort()->values()->all() === ['job_id', 'user_id'],
        );

        $this->assertTrue($uniqueOnJobUser);
    }
}
