<?php

declare(strict_types=1);

namespace App\Actions\Jobs;

use App\Models\Job;
use Illuminate\Database\Eloquent\ModelNotFoundException;

readonly class GetJobDetailsAction
{
    /**
     * Retrieve details of a specific job by its ID.
     *
     * @throws ModelNotFoundException
     */
    public function execute(int $id): Job
    {
        return Job::query()
            ->with('category')
            ->withCount('bids')
            ->findOrFail($id);
    }
}
