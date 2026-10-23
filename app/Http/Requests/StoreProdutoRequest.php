<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProdutoRequest extends FormRequest
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

        $precoVenda = $this->input('preco_venda');
        if ($precoVenda === null || $precoVenda === '') {
            $this->merge(['preco_venda' => 0]);
        }

        if (! $this->exists('ativo')) {
            $this->merge(['ativo' => true]);
        } else {
            $this->merge([
                'ativo' => filter_var($this->input('ativo'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'preco_compra' => ['required', 'numeric', 'min:0.01'],
            'preco_venda' => ['nullable', 'numeric', 'min:0'],
            'ativo' => ['sometimes', 'boolean'],
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
            'fornecedor_id' => ['nullable', 'integer', 'exists:fornecedor,id'],
            'grupo_id' => ['nullable', 'integer', 'exists:grupos,id'],
        ];
    }
}
