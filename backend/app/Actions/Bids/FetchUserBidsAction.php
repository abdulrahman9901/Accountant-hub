<?php

declare(strict_types=1);

namespace App\Actions\Bids;

use App\Models\Bid;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

readonly class FetchUserBidsAction
{
    /**
     * Retrieve all bids placed by the currently authenticated user.
     *
     * @return Collection<Bid>
     */
    public function execute(User $user): Collection
    {
        return $user->bids()
            ->with(['job.category'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
