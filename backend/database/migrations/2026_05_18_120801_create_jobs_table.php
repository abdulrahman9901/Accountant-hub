<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('company_name');
            $table->decimal('budget_min', 10, 2);
            $table->decimal('budget_max', 10, 2);
            $table->date('deadline');
            $table->date('posted_date');
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->foreignId('category_id')->constrained('job_categories')->cascadeOnDelete();
            $table->timestamps();

            $table->index('status');
            $table->index('posted_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
