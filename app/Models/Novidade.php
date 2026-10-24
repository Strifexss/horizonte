<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Novidade extends Model
{
    public const CATEGORIA_NOVO = 'novo';

    public const CATEGORIA_MELHORIA = 'melhoria';

    public const CATEGORIA_CORRECAO = 'correcao';

    public const CATEGORIAS = [self::CATEGORIA_NOVO, self::CATEGORIA_MELHORIA, self::CATEGORIA_CORRECAO];

    public const STATUS_RASCUNHO = 'rascunho';

    public const STATUS_PUBLICADO = 'publicado';

    public const STATUS = [self::STATUS_RASCUNHO, self::STATUS_PUBLICADO];

    public const PASTA_IMAGENS = 'novidades';

    /**
     * @var string
     */
    protected $table = 'novidade';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'titulo',
        'descricao',
        'categoria',
        'status',
        'cta_url',
        'popup_automatico',
        'publicada_em',
    ];

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => self::STATUS_RASCUNHO,
        'popup_automatico' => false,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'popup_automatico' => 'boolean',
            'publicada_em' => 'datetime',
        ];
    }

    public function dispensas(): HasMany
    {
        return $this->hasMany(NovidadeDispensada::class, 'novidade_id');
    }

    public function imagens(): HasMany
    {
        return $this->hasMany(NovidadeImagem::class, 'novidade_id')->orderBy('ordem')->orderBy('id');
    }

    public static function discoImagens(): string
    {
        return config('filesystems.novidades_disk');
    }

    public function estaPublicada(): bool
    {
        return $this->status === self::STATUS_PUBLICADO;
    }
}
