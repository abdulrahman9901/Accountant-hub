<?php

declare(strict_types=1);

namespace App\Actions\Categories;

use App\Models\JobCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

readonly class FetchCategoriesAction
{
    /**
     * Execute the query to retrieve all job categories ordered alphabetically by name.
     *
     * @return Collection<int, JobCategory>
     */
    public function execute(): Collection
    {
        return Cache::remember(
            'job_categories',
            now()->addHour(),
            fn() => JobCategory::query()
                ->orderBy('name')
                ->get()
        );
    }
}
