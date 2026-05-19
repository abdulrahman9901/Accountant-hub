<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->index(['budget_min', 'budget_max'], 'jobs_budget_min_max_index');
            $table->index('category_id', 'jobs_category_id_index');
            
            // Full-text index for fast text search
            $table->fullText(['title', 'description'], 'jobs_fulltext_title_desc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropIndex('jobs_budget_min_max_index');
            $table->dropIndex('jobs_category_id_index');
            $table->dropFullText('jobs_fulltext_title_desc');
        });
    }
};
