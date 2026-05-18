<?php

namespace Database\Seeders;

use App\Models\JobCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class JobCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Bookkeeping',
            'Tax Preparation',
            'Payroll',
            'Financial Reporting',
            'Audit Support',
        ];

        foreach ($categories as $name) {
            JobCategory::query()->firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name],
            );
        }
    }
}
