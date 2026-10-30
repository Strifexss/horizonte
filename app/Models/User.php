<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
        'empresa_ativa',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function empresas(): BelongsToMany
    {
        return $this->belongsToMany(Empresa::class, 'empresa_user')
            ->withPivot('cargo')
            ->withTimestamps();
    }

    /**
     * Empresa ativa: no MVP1, a única Empresa da conta.
     */
    public function empresa(): ?Empresa
    {
        if (! array_key_exists('empresa_ativa', $this->relations)) {
            $this->setRelation('empresa_ativa', $this->empresas()->orderBy('empresa_user.id')->first());
        }

        return $this->getRelation('empresa_ativa');
    }

    public function esquecerEmpresaAtiva(): void
    {
        $this->unsetRelation('empresa_ativa');
    }

    public function ehContaGoogle(): bool
    {
        return $this->google_id !== null;
    }

    /**
     * Restringe a busca por credenciais às contas com senha (login, cadastro e redefinição de senha).
     */
    public static function somenteContasComSenha(Builder $query): void
    {
        $query->whereNull('google_id');
    }
}
