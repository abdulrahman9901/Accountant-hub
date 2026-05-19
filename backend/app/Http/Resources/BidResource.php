<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BidResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'proposed_price' => $this->proposed_price,
            'estimated_delivery_days' => $this->estimated_delivery_days,
            'cover_letter' => $this->cover_letter,
            'experience_summary' => $this->experience_summary,
            'status' => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'job' => new JobResource($this->whenLoaded('job')),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
