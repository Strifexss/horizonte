<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProdutoSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'busca' => $this->filled('busca') ? $this->input('busca') : null,
            'per_page' => $this->filled('per_page') ? $this->input('per_page') : 20,
            'page' => $this->filled('page') ? $this->input('page') : 1,
            'sort' => $this->filled('sort') ? $this->input('sort') : 'nome',
            'sort_dir' => $this->filled('sort_dir') ? $this->input('sort_dir') : 'asc',
        ]);
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'busca' => ['nullable', 'string', 'max:255'],
            'per_page' => ['required', 'integer', 'in:10,20,25,50'],
            'page' => ['nullable', 'integer', 'min:1'],
            'sort' => ['nullable', 'string', 'in:nome,preco_compra,preco_venda,ativo'],
            'sort_dir' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
