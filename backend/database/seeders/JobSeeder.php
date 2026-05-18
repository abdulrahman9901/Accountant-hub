<?php

namespace Database\Seeders;

use App\Models\Job;
use App\Models\JobCategory;
use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        $samples = [
            [
                'title' => 'Monthly Bookkeeping for SaaS Startup',
                'company_name' => 'CloudLedger Inc.',
                'description' => 'Reconcile accounts, categorize transactions, and prepare monthly P&L for a 15-person SaaS company.',
                'budget_min' => 800,
                'budget_max' => 1200,
            ],
            [
                'title' => 'Corporate Tax Return Preparation',
                'company_name' => 'Northbridge Holdings',
                'description' => 'Prepare federal and state corporate tax returns for a mid-size holding company with multiple subsidiaries.',
                'budget_min' => 2500,
                'budget_max' => 4000,
            ],
            [
                'title' => 'Payroll Processing & Compliance',
                'company_name' => 'GreenField Retail',
                'description' => 'Run bi-weekly payroll for 40 employees, handle tax filings, and ensure state compliance.',
                'budget_min' => 600,
                'budget_max' => 900,
            ],
            [
                'title' => 'Year-End Financial Statements',
                'company_name' => 'Atlas Manufacturing',
                'description' => 'Compile year-end balance sheet, income statement, and cash flow for lender review.',
                'budget_min' => 1500,
                'budget_max' => 2200,
            ],
            [
                'title' => 'Audit Support & Workpaper Prep',
                'company_name' => 'Summit Nonprofit',
                'description' => 'Assist external auditors with schedules, bank reconciliations, and grant compliance documentation.',
                'budget_min' => 1000,
                'budget_max' => 1800,
            ],
        ];

        $categoryIds = JobCategory::query()->pluck('id');

        foreach ($samples as $index => $sample) {
            Job::query()->create([
                ...$sample,
                'deadline' => now()->addDays(14 + $index * 7)->toDateString(),
                'posted_date' => now()->subDays($index * 3)->toDateString(),
                'status' => $index === 4 ? 'closed' : 'open',
                'category_id' => $categoryIds->random(),
            ]);
        }
    }
}
