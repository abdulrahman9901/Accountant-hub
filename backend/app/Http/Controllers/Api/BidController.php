<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Bids\FetchUserBidsAction;
use App\Actions\Bids\SubmitBidAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Bids\SubmitBidRequest;
use App\Http\Resources\BidResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BidController extends Controller
{
    /**
     * Display a listing of all bids placed by the authenticated user.
     */
    public function index(Request $request, FetchUserBidsAction $action): JsonResponse
    {
        $bids = $action->execute($request->user());

        return response()->json([
            'data' => BidResource::collection($bids),
        ], 200);
    }

    /**
     * Store a newly created bid for a specific job in storage.
     */
    public function store(int $id, SubmitBidRequest $request, SubmitBidAction $action): JsonResponse
    {
        $bid = $action->execute(
            $id,
            $request->user(),
            $request->validated()
        );

        \Illuminate\Support\Facades\Cache::flush(); // Invalidate job listings cache

        return response()->json([
            'data' => new BidResource($bid),
        ], 201);
    }
}
