<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Job extends Model
{
    protected $fillable = [
        'title',
        'description',
        'company_name',
        'budget_min',
        'budget_max',
        'deadline',
        'posted_date',
        'status',
        'category_id',
    ];

    protected function casts(): array
    {
        return [
            'budget_min' => 'decimal:2',
            'budget_max' => 'decimal:2',
            'deadline' => 'date',
            'posted_date' => 'date',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(JobCategory::class, 'category_id');
    }

    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class);
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }
}
