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
            'categoria_id' => ['nullable', 'exists:categoria,id'],
            'produto_id' => ['nullable', 'integer', 'exists:produto,id'],
            'conta_id' => ['required', 'exists:conta,id'],
            'usuario_id' => ['nullable', 'exists:users,id'],
            'data_vencimento' => ['required', 'date'],
            'valor_pago' => ['nullable', 'numeric', 'min:0'],
            'qtd_parcelas' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'descricao.required' => 'A descrição é obrigatória',
            'descricao.string' => 'A descrição deve ser uma string',
            'descricao.max' => 'A descrição deve ter no máximo 255 caracteres',
            'valor.required' => 'O valor é obrigatório',
            'valor.numeric' => 'O valor deve ser um número',
            'valor.min' => 'O valor deve ser maior que 0',
            'tipo.required' => 'O tipo é obrigatório',
            'tipo.string' => 'O tipo deve ser uma string',
            'tipo.in' => 'O tipo deve ser RECEITA ou DESPESA',
            'conta_id.required' => 'A conta é obrigatória',
            'data_vencimento.required' => 'A data de vencimento é obrigatória',
            'data_vencimento.date' => 'A data de vencimento deve ser uma data',
            'valor_pago.nullable' => 'O valor pago é opcional',
            'valor_pago.numeric' => 'O valor pago deve ser um número',
            'valor_pago.min' => 'O valor pago deve ser maior que 0',
            'qtd_parcelas.required' => 'A quantidade de parcelas é obrigatória',
            'qtd_parcelas.integer' => 'A quantidade de parcelas deve ser um número',
            'qtd_parcelas.min' => 'A quantidade de parcelas deve ser maior que 0',
        ];
    }
}
