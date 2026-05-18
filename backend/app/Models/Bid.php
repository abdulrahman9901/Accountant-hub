<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bid extends Model
{
    protected $fillable = [
        'job_id',
        'user_id',
        'proposed_price',
        'estimated_delivery_days',
        'cover_letter',
        'experience_summary',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'proposed_price' => 'decimal:2',
        ];
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
