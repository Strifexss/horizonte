<?php

namespace App\Http\Requests;

use App\Models\Novidade;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNovidadeRequest extends FormRequest
{
    /**
     * Igual ao `max_file_uploads` do PHP: acima disso o PHP descarta os arquivos excedentes sem avisar.
     */
    private const MAX_IMAGENS_POR_ENVIO = 20;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'titulo' => is_string($this->input('titulo')) ? trim($this->input('titulo')) : $this->input('titulo'),
            'cta_url' => filled($this->input('cta_url')) ? trim((string) $this->input('cta_url')) : null,
            'popup_automatico' => filter_var($this->input('popup_automatico', false), FILTER_VALIDATE_BOOLEAN),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'descricao' => ['required', 'string', 'max:5000'],
            'categoria' => ['required', 'string', Rule::in(Novidade::CATEGORIAS)],
            'cta_url' => ['nullable', 'url:http,https', 'max:500'],
            'popup_automatico' => ['boolean'],
            'imagens' => ['array', 'max:'.self::MAX_IMAGENS_POR_ENVIO],
            'imagens.*' => ['image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
            'remover_imagens' => ['array'],
            'remover_imagens.*' => ['integer'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'titulo.required' => 'O título é obrigatório.',
            'titulo.max' => 'O título deve ter no máximo 150 caracteres.',
            'descricao.required' => 'A descrição é obrigatória.',
            'descricao.max' => 'A descrição deve ter no máximo 5000 caracteres.',
            'categoria.required' => 'A categoria é obrigatória.',
            'categoria.in' => 'Categoria inválida.',
            'cta_url.url' => 'Informe um link válido, começando com http:// ou https://.',
            'cta_url.max' => 'O link deve ter no máximo 500 caracteres.',
            'imagens.max' => 'Envie até '.self::MAX_IMAGENS_POR_ENVIO.' imagens por vez; salve e adicione o restante em seguida.',
            'imagens.*.image' => 'Todos os arquivos devem ser imagens.',
            'imagens.*.mimes' => 'As imagens devem ser JPG, PNG, WEBP ou GIF.',
            'imagens.*.max' => 'Cada imagem deve ter no máximo 2 MB.',
        ];
    }
}
