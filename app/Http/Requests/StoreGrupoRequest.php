<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGrupoRequest extends FormRequest
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

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
