<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContaRequest extends FormRequest
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

        $this->merge([
            'padrao' => filter_var($this->input('padrao', false), FILTER_VALIDATE_BOOLEAN) ? 1 : 0,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'descricao' => ['nullable', 'string'],
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
            'padrao' => ['nullable', 'integer', 'in:0,1'],
        ];
    }
}
