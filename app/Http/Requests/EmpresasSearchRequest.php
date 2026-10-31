<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmpresasSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'busca' => ['nullable', 'string', 'max:255'],
            'segmento_id' => ['nullable', 'integer', 'exists:segmentos,id'],
        ];
    }
}
