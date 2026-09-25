<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProdutoRequest extends FormRequest
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

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'preco_compra' => ['required', 'numeric', 'min:0.01'],
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
