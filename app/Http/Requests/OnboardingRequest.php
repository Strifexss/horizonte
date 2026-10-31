<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OnboardingRequest extends FormRequest
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
            'nome' => ['required', 'string', 'max:120'],
            'segmento_id' => ['required', 'integer', Rule::exists('segmentos', 'id')->where('ativo', true)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nome.required' => 'Informe o nome do seu negócio.',
            'nome.max' => 'O nome pode ter até 120 caracteres.',
            'segmento_id.required' => 'Escolha o ramo do seu negócio.',
            'segmento_id.exists' => 'Escolha um dos ramos da lista.',
        ];
    }
}
