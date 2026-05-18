<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
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
            'title' => $this->title,
            'company_name' => $this->company_name,
            'description' => $this->description,
            'budget_min' => $this->budget_min,
            'budget_max' => $this->budget_max,
            'deadline' => $this->deadline?->toDateString(),
            'posted_date' => $this->posted_date?->toDateString(),
            'status' => $this->status,
            'bids_count' => (int) ($this->bids_count ?? 0),
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}
