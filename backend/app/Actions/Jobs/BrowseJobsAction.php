<?php

declare(strict_types=1);

namespace App\Actions\Jobs;

use App\Models\Job;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

readonly class BrowseJobsAction
{
    /**
     * Browse, filter, sort, and paginate open jobs.
     *
     * @param  array{
     *     search?: string,
     *     category?: string|int,
     *     min_budget?: string|float|int,
     *     max_budget?: string|float|int,
     *     sort_by?: string
     * }  $filters
     */
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $page = request()->get('page', 1);
        $cacheKey = 'jobs_listing_' . md5(json_encode($filters) . "_page_$page");

        return \Illuminate\Support\Facades\Cache::remember($cacheKey, 30, function () use ($filters, $page) {
            $start = microtime(true);

            $query = Job::query()
                ->with('category')
                ->withCount('bids')
                ->where('status', 'open');

            // Apply keyword search in title or description
            if (! empty($filters['search'])) {
                $search = $filters['search'];
                // Use full text search if available, fallback to LIKE
                $query->whereRaw("MATCH(title, description) AGAINST(? IN BOOLEAN MODE)", [$search])
                      ->orWhere('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            }

            // Apply category filter (by slug or database ID)
            if (! empty($filters['category'])) {
                $category = $filters['category'];
                $query->whereHas('category', function ($q) use ($category) {
                    if (is_numeric($category)) {
                        $q->where('id', (int) $category);
                    } else {
                        $q->where('slug', $category);
                    }
                });
            }

            // Apply min budget filter (matches jobs where budget_max is at least min_budget)
            if (isset($filters['min_budget']) && $filters['min_budget'] !== '') {
                $query->where('budget_max', '>=', (float) $filters['min_budget']);
            }

            // Apply max budget filter (matches jobs where budget_min is at most max_budget)
            if (isset($filters['max_budget']) && $filters['max_budget'] !== '') {
                $query->where('budget_min', '<=', (float) $filters['max_budget']);
            }

            // Apply sorting rules
            $sortBy = $filters['sort_by'] ?? 'newest';
            switch ($sortBy) {
                case 'highest_budget':
                    $query->orderBy('budget_max', 'desc')
                        ->orderBy('id', 'desc');
                    break;
                case 'deadline':
                    $query->orderBy('deadline', 'asc')
                        ->orderBy('id', 'desc');
                    break;
                case 'newest':
                default:
                    $query->orderBy('posted_date', 'desc')
                        ->orderBy('id', 'desc');
                    break;
            }

            $jobs = $query->paginate(10);

            if (app()->environment('local')) {
                $duration = round((microtime(true) - $start) * 1000, 2);
                \Illuminate\Support\Facades\Log::info("Jobs query took {$duration}ms", [
                    'sql'      => $query->toSql(),
                    'bindings' => $query->getBindings(),
                    'filters'  => $filters,
                    'page'     => $page,
                ]);
            }

            return $jobs;
        });
    }
}
