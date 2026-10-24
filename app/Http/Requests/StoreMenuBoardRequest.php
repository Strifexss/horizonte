<?php

namespace App\Http\Requests;

use App\Models\MenuBoard;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMenuBoardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->user()) {
            $this->merge(['usuario_id' => $this->user()->id]);
        }

        if (! $this->exists('itens')) {
            $this->merge(['itens' => []]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:80'],
            'tema' => ['required', 'string', Rule::in(MenuBoard::TEMAS)],
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
            'itens' => ['present', 'array'],
            'itens.*.produto_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('produto', 'id')->where('usuario_id', $this->user()?->id),
            ],
            'itens.*.destaque' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'itens.*.produto_id.exists' => 'Um dos produtos selecionados não foi encontrado.',
        ];
    }
}
