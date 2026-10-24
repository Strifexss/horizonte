<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InsightAcao extends Model
{
    public const ACAO_FEITO = 'feito';

    public const ACAO_DISPENSADO = 'dispensado';

    /**
     * Motivos aceitos ao dispensar um insight.
     *
     * @var list<string>
     */
    public const MOTIVOS = ['ja_sei', 'nao_se_aplica', 'numero_errado'];

    /**
     * @var string
     */
    protected $table = 'insight_acao';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'usuario_id',
        'dashboard_analise_id',
        'chave',
        'tipo',
        'titulo',
        'acao',
        'motivo',
        'ano',
        'mes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'usuario_id' => 'integer',
            'dashboard_analise_id' => 'integer',
            'ano' => 'integer',
            'mes' => 'integer',
        ];
    }

    public function analise(): BelongsTo
    {
        return $this->belongsTo(DashboardAnalise::class, 'dashboard_analise_id');
    }
}
