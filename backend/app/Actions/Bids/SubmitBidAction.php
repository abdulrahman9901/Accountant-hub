<?php

declare(strict_types=1);

namespace App\Actions\Bids;

use App\Models\Bid;
use App\Models\Job;
use App\Models\User;
use Illuminate\Validation\ValidationException;

readonly class SubmitBidAction
{
    /**
     * Submit a competitive bid on a job.
     *
     * @param  array{
     *     proposed_price: float|string,
     *     estimated_delivery_days: int,
     *     cover_letter: string,
     *     experience_summary: string
     * }  $data
     *
     * @throws ValidationException
     */
    public function execute(int $jobId, User $user, array $data): Bid
    {
        $job = Job::query()->findOrFail($jobId);

        // Guard: Check if the job is open
        if ($job->status !== 'open') {
            throw ValidationException::withMessages([
                'job' => 'You cannot submit a bid for a closed job.',
            ]);
        }

        // Guard: Prevent duplicate bids by the same accountant
        $hasAlreadyBid = Bid::query()
            ->where('job_id', $job->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($hasAlreadyBid) {
            throw ValidationException::withMessages([
                'job' => 'You have already submitted a bid for this job.',
            ]);
        }

        return Bid::query()->create([
            'job_id' => $job->id,
            'user_id' => $user->id,
            'proposed_price' => $data['proposed_price'],
            'estimated_delivery_days' => $data['estimated_delivery_days'],
            'cover_letter' => $data['cover_letter'],
            'experience_summary' => $data['experience_summary'],
            'status' => 'pending',
        ]);
    }
}
