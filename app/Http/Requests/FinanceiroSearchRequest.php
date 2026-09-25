<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinanceiroSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $inicioMes = now()->startOfMonth()->toDateString();
        $fimMes = now()->endOfMonth()->toDateString();

        $this->merge([
            'tipo_data' => $this->filled('tipo_data') ? $this->input('tipo_data') : 'vencimento',
            'data_inicio' => $this->filled('data_inicio') ? $this->input('data_inicio') : $inicioMes,
            'data_fim' => $this->filled('data_fim') ? $this->input('data_fim') : $fimMes,
            'status' => $this->filled('status') ? $this->input('status') : 'todos',
            'conta_id' => $this->filled('conta_id') ? $this->input('conta_id') : null,
            'categoria_id' => $this->filled('categoria_id') ? $this->input('categoria_id') : null,
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
            'tipo_data' => ['required', 'string', 'in:vencimento,competencia'],
            'data_inicio' => ['required', 'date'],
            'data_fim' => ['required', 'date', 'after_or_equal:data_inicio'],
            'conta_id' => ['nullable', 'integer', 'exists:conta,id'],
            'categoria_id' => ['nullable', 'integer', 'exists:categoria,id'],
            'status' => ['required', 'string', 'in:todos,aberto,pago,parcial'],
            'busca' => ['nullable', 'string', 'max:255'],
            'per_page' => ['required', 'integer', 'in:10,20,25,50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
