<?php

namespace App\Http\Requests;

use App\Models\Categoria;
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

        if($this->has('data_competencia')) {
            $this->merge(['data_competencia' => \Carbon\Carbon::parse($this->input('data_competencia'))->format('Y-m-d')]);
        }
    }

    public function rules(): array
    {
        $catId = $this->input('categoria_id');
        $isProduto = $catId && Categoria::where('id', $catId)->where('nome', 'PRODUTO')->exists();

        return [
            'descricao' => ['required', 'string', 'max:255'],
            'valor' => ['required', 'numeric', 'min:0.01'],
            'tipo' => ['required', 'string', 'in:RECEITA,DESPESA'],
            'categoria_id' => ['required', 'exists:categoria,id'],
            'produto_id' => ['nullable', 'integer', 'exists:produto,id'],
            'funcionario_id' => ['nullable', 'integer', 'exists:funcionario,id'],
            'fornecedor_id' => ['nullable', 'integer', 'exists:fornecedor,id'],
            'quantidade' => $isProduto ? ['required', 'integer', 'min:1'] : ['nullable', 'integer', 'min:1'],
            'conta_id' => ['required', 'exists:conta,id'],
            'data_competencia' => ['nullable', 'date'],
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
            'categoria_id.required' => 'A categoria é obrigatória',
            'conta_id.required' => 'A conta é obrigatória',
            'data_vencimento.required' => 'A data de vencimento é obrigatória',
            'data_vencimento.date' => 'A data de vencimento deve ser uma data',
            'data_competencia.date' => 'A data deve ser uma data válida',
            'valor_pago.nullable' => 'O valor pago é opcional',
            'valor_pago.numeric' => 'O valor pago deve ser um número',
            'valor_pago.min' => 'O valor pago deve ser maior que 0',
            'quantidade.required' => 'A quantidade é obrigatória para categoria produto.',
            'quantidade.integer' => 'A quantidade deve ser um número inteiro.',
            'quantidade.min' => 'A quantidade deve ser pelo menos 1.',
            'qtd_parcelas.required' => 'A quantidade de parcelas é obrigatória',
            'qtd_parcelas.integer' => 'A quantidade de parcelas deve ser um número',
            'qtd_parcelas.min' => 'A quantidade de parcelas deve ser maior que 0',
        ];
    }
}
