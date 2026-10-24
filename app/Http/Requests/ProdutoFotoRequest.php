<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProdutoFotoRequest extends FormRequest
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
            'foto' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'foto.required' => 'Selecione uma imagem.',
            'foto.image' => 'O arquivo precisa ser uma imagem.',
            'foto.mimes' => 'Use uma imagem JPG, PNG ou WEBP.',
            'foto.max' => 'A imagem pode ter no máximo 2 MB.',
        ];
    }
}
