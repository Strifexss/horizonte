<?php

namespace App\Http\Requests;

use App\Models\Empresa;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVendaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'usuario_id' => $this->user()?->id,
            'pagamentos' => $this->input('pagamentos', []),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $empresaId = Empresa::atualId();

        return [
            'usuario_id' => ['required', 'integer', 'exists:users,id'],
            'observacao' => ['nullable', 'string', 'max:1000'],
            'itens' => ['required', 'array', 'min:1'],
            'itens.*.produto_id' => [
                'required',
                'integer',
                Rule::exists('produto', 'id')->where('empresa_id', $empresaId),
            ],
            'itens.*.quantidade' => ['required', 'numeric', 'gt:0', 'max:9999999.999'],
            'itens.*.valor_unitario' => ['required', 'numeric', 'gt:0', 'max:9999999999999.99'],
            'pagamentos' => ['present', 'array'],
            'pagamentos.*.forma_pagamento_id' => [
                'required',
                'integer',
                Rule::exists('forma_pagamento', 'id')
                    ->where('ativo', true)
                    ->where(fn (Builder $query) => $query->where(function (Builder $visiveis) use ($empresaId) {
                        $visiveis->whereNull('empresa_id')->orWhere('empresa_id', $empresaId);
                    })),
            ],
            'pagamentos.*.valor' => ['required', 'numeric', 'gt:0', 'max:9999999999999.99'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'itens.required' => 'Adicione ao menos um produto.',
            'itens.min' => 'Adicione ao menos um produto.',
            'itens.*.produto_id.exists' => 'Produto não encontrado.',
            'itens.*.quantidade.gt' => 'A quantidade precisa ser maior que zero.',
            'itens.*.valor_unitario.gt' => 'O valor unitário precisa ser maior que zero.',
            'pagamentos.*.forma_pagamento_id.exists' => 'Forma de pagamento inválida ou inativa.',
            'pagamentos.*.valor.gt' => 'O valor do pagamento precisa ser maior que zero.',
        ];
    }
}
