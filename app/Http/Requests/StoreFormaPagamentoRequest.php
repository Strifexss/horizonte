<?php

namespace App\Http\Requests;

use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFormaPagamentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'usuario_id' => $this->user()?->id,
            'nome' => is_string($this->input('nome')) ? trim($this->input('nome')) : $this->input('nome'),
            'ativo' => $this->exists('ativo') ? filter_var($this->input('ativo'), FILTER_VALIDATE_BOOLEAN) : true,
            'baixa_automatica' => $this->exists('baixa_automatica') ? filter_var($this->input('baixa_automatica'), FILTER_VALIDATE_BOOLEAN) : true,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $usuarioId = $this->user()?->id;

        return [
            'nome' => [
                'required',
                'string',
                'max:100',
                Rule::unique('forma_pagamento', 'nome')
                    ->ignore($this->route('id'))
                    ->where(fn (Builder $query) => $query->where(function (Builder $visiveis) use ($usuarioId) {
                        $visiveis->whereNull('usuario_id')->orWhere('usuario_id', $usuarioId);
                    })),
            ],
            'ativo' => ['boolean'],
            'baixa_automatica' => ['boolean'],
            'usuario_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'O nome é obrigatório.',
            'nome.max' => 'O nome deve ter no máximo 100 caracteres.',
            'nome.unique' => 'Já existe uma forma de pagamento com este nome.',
        ];
    }
}
