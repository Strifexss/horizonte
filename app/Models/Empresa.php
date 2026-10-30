<?php

namespace App\Models;

use Database\Factories\EmpresaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class Empresa extends Model
{
    /** @use HasFactory<EmpresaFactory> */
    use HasFactory;

    public const MODULO_VAREJO = 'varejo';

    public const MODULO_RESTAURANTE = 'restaurante';

    public const MODULOS = [self::MODULO_VAREJO, self::MODULO_RESTAURANTE];

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
        'modulo',
        'nome_confirmado_em',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'nome_confirmado_em' => 'datetime',
        ];
    }

    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'empresa_user')
            ->withPivot('cargo')
            ->withTimestamps();
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
