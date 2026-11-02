<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClienteSearchRequest extends FormRequest
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
            'per_page' => ['nullable', 'integer', 'in:10,20,25,50'],
            'page' => ['nullable', 'integer', 'min:1'],
            'sort' => ['nullable', 'string', 'in:nome,ativo'],
            'sort_dir' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
