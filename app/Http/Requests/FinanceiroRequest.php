<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinanceiroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('usuario_id') && $this->user()) {
            $this->merge(['usuario_id' => $this->user()->id]);
        }
    }

    public function rules(): array
    {
        return [
            'descricao' => ['required', 'string', 'max:255'],
            'valor' => ['required', 'numeric', 'min:0.01'],
            'tipo' => ['required', 'string', 'in:RECEITA,DESPESA'],
            'categoria_id' => ['nullable', 'integer', 'exists:categoria,id'],
            'conta_id' => ['required', 'integer', 'exists:conta,id'],
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}

