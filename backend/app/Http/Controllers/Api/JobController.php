<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Jobs\BrowseJobsAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\JobResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobController extends Controller
{
    /**
     * Display a listing of all open jobs matching search criteria and filters.
     */
    public function index(Request $request, BrowseJobsAction $action): JsonResponse
    {
        $filters = $request->only([
            'search',
            'category',
            'min_budget',
            'max_budget',
            'sort_by',
        ]);

        $jobs = $action->execute($filters);

        return response()->json([
            'data' => JobResource::collection($jobs),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
            ],
        ], 200);
    }
}
