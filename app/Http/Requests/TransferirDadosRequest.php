<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferirDadosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'origem_id' => ['required', 'integer', 'exists:users,id'],
            'destino_id' => ['required', 'integer', 'exists:users,id', 'different:origem_id'],
            'modulos' => ['required', 'array', 'min:1'],
            'modulos.*' => ['string', 'in:produtos,fornecedores'],
            'migrar_relacionamentos' => ['sometimes', 'boolean'],
            'confirmacao' => ['required', 'accepted'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'destino_id.different' => 'O usuário de destino não pode ser igual ao de origem',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'migrar_relacionamentos' => filter_var($this->input('migrar_relacionamentos', false), FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
