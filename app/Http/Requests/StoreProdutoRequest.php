<?php

namespace App\Http\Requests;

use App\Models\Empresa;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProdutoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->user()) {
            $this->merge(['usuario_id' => $this->user()->id]);
        }

        $precoVenda = $this->input('preco_venda');
        if ($precoVenda === null || $precoVenda === '') {
            $this->merge(['preco_venda' => 0]);
        }

        if ($this->exists('codigo')) {
            $this->merge(['codigo' => trim((string) $this->input('codigo')) ?: null]);
        }

        $this->merge(['favorito' => filter_var($this->input('favorito', false), FILTER_VALIDATE_BOOLEAN)]);

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
            'codigo' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('produto', 'codigo')
                    ->where('empresa_id', Empresa::atualId())
                    ->ignore($this->route('id')),
            ],
            'favorito' => ['boolean'],
            'preco_compra' => ['required', 'numeric', 'min:0.01'],
            'preco_venda' => ['nullable', 'numeric', 'min:0'],
            'ativo' => ['sometimes', 'boolean'],
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
            'fornecedor_id' => ['nullable', 'integer', 'exists:fornecedor,id'],
            'grupo_id' => ['nullable', 'integer', 'exists:grupos,id'],
            'descricao' => ['nullable', 'string', 'max:160'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remover_foto' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo.unique' => 'Já existe um produto com este código.',
        ];
    }
}
