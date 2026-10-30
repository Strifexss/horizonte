<?php

namespace App\Http\Requests;

use App\Models\Empresa;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateParcelaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->user()) {
            $this->merge(['usuario_id' => $this->user()->id]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string,mixed>
     */
    public function rules(): array
    {
        return [
            'descricao' => ['nullable', 'string'],
            'data_vencimento' => ['nullable', 'date'],
            'data_competencia' => ['nullable', 'date'],
            'valor' => ['nullable', 'numeric', 'min:0'],
            'valor_pago' => ['nullable', 'numeric', 'min:0'],
            'parcela' => ['nullable', 'integer', 'min:1'],
            'categoria_id' => ['required', 'integer', 'exists:categoria,id'],
            'produto_id' => ['nullable', 'integer', 'exists:produto,id'],
            'funcionario_id' => ['nullable', 'integer', 'exists:funcionario,id'],
            'conta_id' => ['nullable', 'integer', 'exists:conta,id'],
            'quantidade' => ['nullable', 'integer', 'min:1'],
            'financeiro_id' => ['nullable', 'integer', 'exists:financeiro,id'],
            'forma_pagamento_id' => [
                'nullable',
                'integer',
                Rule::exists('forma_pagamento', 'id')
                    ->where(fn (Builder $query) => $query->where(function (Builder $visiveis) {
                        $visiveis->whereNull('empresa_id')->orWhere('empresa_id', Empresa::atualId());
                    })),
            ],
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'categoria_id.required' => 'A categoria é obrigatória',
            'quantidade.integer' => 'A quantidade deve ser um número inteiro.',
            'quantidade.min' => 'A quantidade deve ser pelo menos 1.',
        ];
    }
}
