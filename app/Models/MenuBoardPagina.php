<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

/**
 * Uma tela do Menu Board: a TV mostra cada página pelo tempo definido e passa para a próxima.
 */
class MenuBoardPagina extends Model
{
    public const LAYOUT_DESTAQUES_GRADE = 'destaques_grade';

    public const LAYOUT_CATEGORIA = 'categoria';

    public const LAYOUT_BANNER = 'banner';

    public const LAYOUT_IMAGEM_LISTA = 'imagem_lista';

    public const LAYOUT_AVISO = 'aviso';

    public const LAYOUT_PRODUTO_DESTAQUE = 'produto_destaque';

    /**
     * Layouts prontos que o usuário pode escolher para uma página.
     *
     * @var list<string>
     */
    public const LAYOUTS = [
        self::LAYOUT_DESTAQUES_GRADE,
        self::LAYOUT_CATEGORIA,
        self::LAYOUT_BANNER,
        self::LAYOUT_IMAGEM_LISTA,
        self::LAYOUT_AVISO,
        self::LAYOUT_PRODUTO_DESTAQUE,
    ];

    /**
     * Layouts que usam imagem própria da página.
     *
     * @var list<string>
     */
    public const LAYOUTS_COM_IMAGEM = [self::LAYOUT_BANNER, self::LAYOUT_IMAGEM_LISTA];

    /**
     * Campos de configuração que cada layout guarda; o resto é descartado ao salvar.
     *
     * @var array<string, list<string>>
     */
    public const CAMPOS_CONFIGURACAO = [
        self::LAYOUT_DESTAQUES_GRADE => ['fonte', 'grupo_id', 'ordenacao', 'ocultar_destaques'],
        self::LAYOUT_CATEGORIA => ['grupo_id', 'ordenacao'],
        self::LAYOUT_BANNER => [],
        self::LAYOUT_IMAGEM_LISTA => ['titulo', 'fonte', 'grupo_id', 'ordenacao'],
        self::LAYOUT_AVISO => ['titulo', 'texto', 'qr_ativo', 'qr_link', 'qr_legenda'],
        self::LAYOUT_PRODUTO_DESTAQUE => ['selo', 'chamada', 'mostrar_descricao', 'foto_posicao'],
    ];

    public const FONTE_MANUAL = 'manual';

    public const FONTE_CATEGORIA = 'categoria';

    /**
     * @var list<string>
     */
    public const ORDENACOES = ['nome', 'menor_preco', 'maior_preco'];

    public const DURACAO_MINIMA = 5;

    public const DURACAO_MAXIMA = 300;

    public const MAXIMO_DESTAQUES = 3;

    /**
     * @var string
     */
    protected $table = 'menu_board_pagina';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'menu_board_id',
        'ordem',
        'nome',
        'layout',
        'duracao_segundos',
        'configuracao',
        'imagem_path',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'menu_board_id' => 'integer',
            'ordem' => 'integer',
            'duracao_segundos' => 'integer',
            'configuracao' => 'array',
        ];
    }

    /**
     * Disco das imagens das páginas; no Laravel Cloud aponta para o bucket.
     */
    public static function discoImagens(): string
    {
        return config('filesystems.menu_boards_disk', 'public');
    }

    /**
     * URL pública da imagem da página, quando houver.
     */
    protected function imagemUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->imagem_path
            ? Storage::disk(self::discoImagens())->url($this->imagem_path)
            : null);
    }

    /**
     * Valor de um campo da configuração do layout.
     */
    public function config(string $chave, mixed $padrao = null): mixed
    {
        return $this->configuracao[$chave] ?? $padrao;
    }

    public function menuBoard(): BelongsTo
    {
        return $this->belongsTo(MenuBoard::class, 'menu_board_id');
    }

    public function itens(): HasMany
    {
        return $this->hasMany(MenuBoardItem::class, 'menu_board_pagina_id')->orderBy('ordem');
    }
}
