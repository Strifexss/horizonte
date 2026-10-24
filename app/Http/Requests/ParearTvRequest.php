<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ParearTvRequest extends FormRequest
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
            'pin' => ['required', 'string', 'regex:/^\d{4}$/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pin.required' => 'Digite o PIN de 4 dígitos.',
            'pin.regex' => 'O PIN tem 4 dígitos numéricos.',
        ];
    }
}
