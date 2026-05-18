<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseConnectionTest extends TestCase
{
    public function test_mysql_connection_is_available(): void
    {
        $pdo = DB::connection()->getPdo();

        $this->assertNotNull($pdo);
        $this->assertSame('1', DB::selectOne('SELECT 1 AS ok')->ok);
    }

    public function test_expected_tables_exist_on_mysql(): void
    {
        if (config('database.default') === 'sqlite') {
            $this->markTestSkipped('SQLite in-memory is used for tests; run against MySQL separately.');
        }

        $tables = collect(DB::select('SHOW TABLES'))
            ->map(fn ($row) => array_values((array) $row)[0])
            ->all();

        foreach (['job_categories', 'jobs', 'bids'] as $table) {
            $this->assertContains($table, $tables, "Missing table: {$table}");
        }
    }
}
