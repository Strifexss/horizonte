<?php

namespace App\Http\Requests;

use App\Models\Empresa;
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
            'modulo' => ['required', 'string', Rule::in(Empresa::MODULOS)],
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
            'modulo.required' => 'Escolha o ramo do seu negócio.',
            'modulo.in' => 'Escolha Varejo ou Restaurante.',
        ];
    }
}
