<?php

namespace App\Models;

use App\Models\Concerns\PertenceAEmpresa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    use HasFactory, PertenceAEmpresa;

    public const NOME_CONSUMIDOR = 'CONSUMIDOR';

    /**
     * @var string
     */
    protected $table = 'cliente';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'telefone',
        'documento',
        'email',
        'observacao',
        'ativo',
        'usuario_id',
    ];

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'ativo' => true,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'ativo' => 'boolean',
            'usuario_id' => 'integer',
        ];
    }

    /**
     * Id do cliente padrão do sistema, usado em toda venda sem cliente escolhido.
     */
    public static function consumidorId(): int
    {
        return (int) static::query()
            ->whereNull('empresa_id')
            ->where('nome', self::NOME_CONSUMIDOR)
            ->value('id');
    }

    public function ehPadrao(): bool
    {
        return $this->empresa_id === null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function vendas(): HasMany
    {
        return $this->hasMany(Venda::class, 'cliente_id');
    }
}
