<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
        if (! $this->has('usuario_id') && $this->user()) {
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
            'categoria_id' => ['nullable', 'integer', 'exists:categoria,id'],
            'produto_id' => ['nullable', 'integer', 'exists:produto,id'],
            'conta_id' => ['nullable', 'integer', 'exists:conta,id'],
            'financeiro_id' => ['nullable', 'integer', 'exists:financeiro,id'],
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
