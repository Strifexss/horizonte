<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GerarInsightsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['forcar' => filter_var($this->input('forcar', false), FILTER_VALIDATE_BOOLEAN)]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'ano' => ['required', 'integer', 'min:2000', 'max:2100'],
            'mes' => ['required', 'integer', 'min:1', 'max:12'],
            'forcar' => ['boolean'],
        ];
    }
}
