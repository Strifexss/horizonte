<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VendaSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'data_inicio' => $this->filled('data_inicio') ? $this->input('data_inicio') : now()->startOfMonth()->toDateString(),
            'data_fim' => $this->filled('data_fim') ? $this->input('data_fim') : now()->endOfMonth()->toDateString(),
            'forma_pagamento_id' => $this->filled('forma_pagamento_id') ? $this->input('forma_pagamento_id') : null,
            'status' => $this->filled('status') ? $this->input('status') : 'todos',
            'busca' => $this->filled('busca') ? $this->input('busca') : null,
            'per_page' => $this->filled('per_page') ? $this->input('per_page') : 20,
            'page' => $this->filled('page') ? $this->input('page') : 1,
        ]);
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'data_inicio' => ['required', 'date'],
            'data_fim' => ['required', 'date', 'after_or_equal:data_inicio'],
            'forma_pagamento_id' => ['nullable', 'integer', 'exists:forma_pagamento,id'],
            'status' => ['required', 'string', 'in:todos,aberta,fechada,cancelada'],
            'busca' => ['nullable', 'string', 'max:255'],
            'per_page' => ['required', 'integer', 'in:10,20,25,50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
