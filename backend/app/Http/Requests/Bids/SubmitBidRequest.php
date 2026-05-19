<?php

declare(strict_types=1);

namespace App\Http\Requests\Bids;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubmitBidRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'proposed_price' => ['required', 'numeric', 'gt:0'],
            'estimated_delivery_days' => ['required', 'integer', 'gt:0'],
            'cover_letter' => ['required', 'string', 'min:10'],
            'experience_summary' => ['required', 'string', 'min:10'],
        ];
    }
}
