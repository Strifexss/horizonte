<?php

namespace App\Http\Requests;

use App\Models\Segmento;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SegmentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'modulos' => $this->input('modulos', []),
            'ativo' => $this->boolean('ativo'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:80', Rule::unique('segmentos', 'nome')->ignore($this->route('id'))],
            'descricao' => ['nullable', 'string', 'max:255'],
            'modulos' => ['array'],
            'modulos.*' => ['string', 'distinct', Rule::in(array_keys(Segmento::MODULOS_OPCIONAIS))],
            'ativo' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'Informe o nome do segmento.',
            'nome.unique' => 'Já existe um segmento com esse nome.',
            'modulos.*.in' => 'Módulo desconhecido.',
        ];
    }
}
