<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Bids\SubmitBidAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Bids\SubmitBidRequest;
use App\Http\Resources\BidResource;
use Illuminate\Http\JsonResponse;

class BidController extends Controller
{
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

        return response()->json([
            'data' => new BidResource($bid),
        ], 201);
    }
}
