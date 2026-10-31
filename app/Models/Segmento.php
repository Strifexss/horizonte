<?php

namespace App\Models;

use Database\Factories\SegmentoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Segmento extends Model
{
    /** @use HasFactory<SegmentoFactory> */
    use HasFactory;

    public const VAREJO = 'varejo';

    public const RESTAURANTE = 'restaurante';

    protected $table = 'segmentos';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'chave',
        'nome',
        'descricao',
        'modulos',
        'ativo',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'modulos' => 'array',
            'ativo' => 'boolean',
        ];
    }

    public function empresas(): HasMany
    {
        return $this->hasMany(Empresa::class, 'segmento_id');
    }

    public function inclui(string $modulo): bool
    {
        return in_array($modulo, $this->modulos ?? [], true);
    }

    public static function varejoId(): int
    {
        return (int) static::query()->where('chave', self::VAREJO)->value('id');
    }
}
