<?php

namespace App\Models;

use App\Modulos;
use Database\Factories\EmpresaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class Empresa extends Model
{
    /** @use HasFactory<EmpresaFactory> */
    use HasFactory;

    public const CARGO_ADMIN_MASTER = 'admin_master';

    public const CARGO_GERENTE = 'gerente';

    public const CARGO_ATENDENTE = 'atendente';

    public const CARGOS = [self::CARGO_ADMIN_MASTER, self::CARGO_GERENTE, self::CARGO_ATENDENTE];

    protected $table = 'empresas';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'segmento_id',
        'nome_confirmado_em',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'segmento_id' => 'integer',
            'nome_confirmado_em' => 'datetime',
        ];
    }

    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'empresa_user')
            ->withPivot('cargo')
            ->withTimestamps();
    }

    public function segmento(): BelongsTo
    {
        return $this->belongsTo(Segmento::class, 'segmento_id');
    }

    public function ajustesDeModulo(): HasMany
    {
        return $this->hasMany(EmpresaModulo::class, 'empresa_id');
    }

    /**
     * Módulo obrigatório (fora do catálogo de opcionais) está sempre disponível; nos opcionais vale o
     * ajuste da Empresa e, sem ajuste, o que o Segmento inclui.
     */
    public function podeUsar(string $modulo): bool
    {
        if (! array_key_exists($modulo, Modulos::OPCIONAIS)) {
            return true;
        }

        $ajuste = $this->ajustesDeModulo->firstWhere('modulo', $modulo);

        if ($ajuste !== null) {
            return $ajuste->ligado;
        }

        return (bool) $this->segmento?->inclui($modulo);
    }

    /**
     * Chaves dos módulos opcionais disponíveis para a Empresa.
     *
     * @return list<string>
     */
    public function modulosDisponiveis(): array
    {
        return array_values(array_filter(array_keys(Modulos::OPCIONAIS), fn (string $modulo) => $this->podeUsar($modulo)));
    }

    /**
     * Id da Empresa ativa do usuário logado (no MVP1, a única Empresa dele).
     */
    public static function atualId(): ?int
    {
        return Auth::user()?->empresa()?->id;
    }

    /**
     * Id da Empresa de um usuário qualquer.
     */
    public static function idDoUsuario(?int $usuarioId): ?int
    {
        if ($usuarioId === null) {
            return null;
        }

        $empresaId = DB::table('empresa_user')->where('user_id', $usuarioId)->orderBy('id')->value('empresa_id');

        return $empresaId === null ? null : (int) $empresaId;
    }

    public function nomeConfirmado(): bool
    {
        return $this->nome_confirmado_em !== null;
    }
}
