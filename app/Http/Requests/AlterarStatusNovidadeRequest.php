<?php

namespace App\Http\Requests;

use App\Models\Novidade;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AlterarStatusNovidadeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(Novidade::STATUS)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'O status é obrigatório.',
            'status.in' => 'Status inválido.',
        ];
    }
}
