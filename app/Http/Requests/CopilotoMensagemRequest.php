<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CopilotoMensagemRequest extends FormRequest
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
            'mensagem' => ['required', 'string', 'max:1000'],
            'componente' => ['nullable', 'string', 'max:100'],
            'conversa_id' => ['nullable', 'string', 'size:36'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'mensagem.required' => 'Escreva sua dúvida.',
            'mensagem.max' => 'A pergunta pode ter no máximo 1000 caracteres.',
        ];
    }
}
