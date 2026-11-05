<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfiguracoesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'suporte_whatsapp' => preg_replace('/\D/', '', (string) $this->input('suporte_whatsapp')) ?: null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'suporte_whatsapp' => ['nullable', 'digits_between:10,11'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'suporte_whatsapp.digits_between' => 'Informe o número com DDD: 10 ou 11 dígitos, sem o 55.',
        ];
    }
}
