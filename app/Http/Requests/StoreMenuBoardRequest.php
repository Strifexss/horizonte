<?php

namespace App\Http\Requests;

use App\Models\MenuBoard;
use App\Models\MenuBoardPagina;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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

        if (! $this->exists('paginas')) {
            $this->merge(['paginas' => []]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $usuarioId = $this->user()?->id;

        return [
            'nome' => ['required', 'string', 'max:80'],
            'tema' => ['required', 'string', Rule::in(MenuBoard::TEMAS)],
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
            'paginas' => ['present', 'array', 'max:'.MenuBoard::MAXIMO_PAGINAS],
            'paginas.*.nome' => ['required', 'string', 'max:80'],
            'paginas.*.layout' => ['required', 'string', Rule::in(MenuBoardPagina::LAYOUTS)],
            'paginas.*.duracao_segundos' => ['required', 'integer', 'between:'.MenuBoardPagina::DURACAO_MINIMA.','.MenuBoardPagina::DURACAO_MAXIMA],
            'paginas.*.configuracao' => ['nullable', 'array'],
            'paginas.*.configuracao.fonte' => ['nullable', Rule::in([MenuBoardPagina::FONTE_MANUAL, MenuBoardPagina::FONTE_CATEGORIA])],
            'paginas.*.configuracao.grupo_id' => [
                'nullable',
                'integer',
                Rule::exists('grupos', 'id')->where('usuario_id', $usuarioId),
            ],
            'paginas.*.configuracao.ordenacao' => ['nullable', Rule::in(MenuBoardPagina::ORDENACOES)],
            'paginas.*.configuracao.ocultar_destaques' => ['nullable', 'boolean'],
            'paginas.*.configuracao.titulo' => ['nullable', 'string', 'max:60'],
            'paginas.*.configuracao.texto' => ['nullable', 'string', 'max:120'],
            'paginas.*.configuracao.qr_ativo' => ['nullable', 'boolean'],
            'paginas.*.configuracao.qr_link' => ['nullable', 'string', 'max:500', 'url:https'],
            'paginas.*.configuracao.qr_legenda' => ['nullable', 'string', 'max:40'],
            'paginas.*.configuracao.selo' => ['nullable', 'string', 'max:20'],
            'paginas.*.configuracao.chamada' => ['nullable', 'string', 'max:70'],
            'paginas.*.configuracao.mostrar_descricao' => ['nullable', 'boolean'],
            'paginas.*.configuracao.foto_posicao' => ['nullable', Rule::in(['esquerda', 'direita'])],
            'paginas.*.imagem' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'paginas.*.imagem_atual' => ['nullable', 'string', 'max:255'],
            'paginas.*.itens' => ['nullable', 'array'],
            'paginas.*.itens.*.produto_id' => [
                'required',
                'integer',
                Rule::exists('produto', 'id')->where('usuario_id', $usuarioId),
            ],
            'paginas.*.itens.*.destaque' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Regras que dependem do layout de cada página.
     *
     * @return array<int, \Closure>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                foreach ($this->input('paginas', []) as $indice => $pagina) {
                    $this->validarConteudoDaPagina($validator, (int) $indice, is_array($pagina) ? $pagina : []);
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'paginas.max' => 'Um board pode ter no máximo :max páginas.',
            'paginas.*.nome.required' => 'Dê um nome para a página.',
            'paginas.*.duracao_segundos.between' => 'O tempo na tela deve ficar entre :min e :max segundos.',
            'paginas.*.configuracao.qr_link.url' => 'Use um endereço que comece com https://',
            'paginas.*.itens.*.produto_id.exists' => 'Um dos produtos selecionados não foi encontrado.',
            'paginas.*.configuracao.grupo_id.exists' => 'O grupo selecionado não foi encontrado.',
        ];
    }

    /**
     * @param  array<string, mixed>  $pagina
     */
    private function validarConteudoDaPagina(Validator $validator, int $indice, array $pagina): void
    {
        $configuracao = is_array($pagina['configuracao'] ?? null) ? $pagina['configuracao'] : [];
        $itens = is_array($pagina['itens'] ?? null) ? $pagina['itens'] : [];
        $porCategoria = ($configuracao['fonte'] ?? null) === MenuBoardPagina::FONTE_CATEGORIA;
        $temImagem = $this->hasFile("paginas.{$indice}.imagem") || filled($pagina['imagem_atual'] ?? null);
        $erro = fn (string $campo, string $mensagem) => $validator->errors()->add("paginas.{$indice}.{$campo}", $mensagem);

        switch ($pagina['layout'] ?? null) {
            case MenuBoardPagina::LAYOUT_DESTAQUES_GRADE:
                $destaques = count(array_filter($itens, fn ($item) => filter_var($item['destaque'] ?? false, FILTER_VALIDATE_BOOLEAN)));
                if ($destaques > MenuBoardPagina::MAXIMO_DESTAQUES) {
                    $erro('itens', 'Escolha no máximo '.MenuBoardPagina::MAXIMO_DESTAQUES.' destaques.');
                }
                if ($porCategoria && blank($configuracao['grupo_id'] ?? null)) {
                    $erro('configuracao.grupo_id', 'Escolha o grupo da grade.');
                }
                break;
            case MenuBoardPagina::LAYOUT_CATEGORIA:
                if (blank($configuracao['grupo_id'] ?? null)) {
                    $erro('configuracao.grupo_id', 'Escolha o grupo da página.');
                }
                break;
            case MenuBoardPagina::LAYOUT_BANNER:
                if (! $temImagem) {
                    $erro('imagem', 'Envie a imagem do banner.');
                }
                break;
            case MenuBoardPagina::LAYOUT_IMAGEM_LISTA:
                if (! $temImagem) {
                    $erro('imagem', 'Envie a imagem da página.');
                }
                if ($porCategoria && blank($configuracao['grupo_id'] ?? null)) {
                    $erro('configuracao.grupo_id', 'Escolha o grupo da lista.');
                }
                break;
            case MenuBoardPagina::LAYOUT_AVISO:
                if (blank($configuracao['titulo'] ?? null)) {
                    $erro('configuracao.titulo', 'Escreva o título do aviso.');
                }
                if (filter_var($configuracao['qr_ativo'] ?? false, FILTER_VALIDATE_BOOLEAN) && blank($configuracao['qr_link'] ?? null)) {
                    $erro('configuracao.qr_link', 'Informe o link do QR Code.');
                }
                break;
            case MenuBoardPagina::LAYOUT_PRODUTO_DESTAQUE:
                if ($itens === []) {
                    $erro('itens', 'Escolha o produto em destaque.');
                }
                break;
        }
    }
}
