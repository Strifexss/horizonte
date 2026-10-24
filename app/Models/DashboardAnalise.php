<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DashboardAnalise extends Model
{
    /**
     * Tipos de insight aceitos na resposta da IA.
     *
     * @var list<string>
     */
    public const TIPOS = ['crescimento', 'lucro', 'custos', 'alerta', 'positivo'];

    /**
     * @var list<string>
     */
    public const PRIORIDADES = ['alta', 'media', 'baixa', 'acompanhar'];

    public const STATUS_PROCESSANDO = 'processando';

    public const STATUS_CONCLUIDA = 'concluida';

    public const STATUS_FALHOU = 'falhou';

    /**
     * @var string
     */
    protected $table = 'dashboard_analise';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'usuario_id',
        'ano',
        'mes',
        'status',
        'hash_dados',
        'pacote',
        'resumo',
        'insights',
        'resultados_acoes',
        'insights_descartados',
        'erro',
        'modelo',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'usuario_id' => 'integer',
            'ano' => 'integer',
            'mes' => 'integer',
            'pacote' => 'array',
            'insights' => 'array',
            'resultados_acoes' => 'array',
            'insights_descartados' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function acoes(): HasMany
    {
        return $this->hasMany(InsightAcao::class, 'dashboard_analise_id');
    }
}
