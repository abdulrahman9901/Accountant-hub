<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Categories\FetchCategoriesAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\JsonResponse;

class JobCategoryController extends Controller
{
    /**
     * Display a listing of the job categories.
     */
    public function index(FetchCategoriesAction $action): JsonResponse
    {
        $categories = $action->execute();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ], 200);
    }
}
