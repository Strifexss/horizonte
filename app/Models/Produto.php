<?php

namespace App\Models;

use App\Models\Concerns\PertenceAEmpresa;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Produto extends Model
{
    use HasFactory, PertenceAEmpresa;

    /**
     * @var string
     */
    protected $table = 'produto';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'codigo',
        'preco_compra',
        'preco_venda',
        'ativo',
        'favorito',
        'usuario_id',
        'fornecedor_id',
        'grupo_id',
        'descricao',
        'foto_path',
    ];

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'preco_venda' => '0.00',
        'ativo' => true,
        'favorito' => false,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'nome' => 'string',
            'codigo' => 'string',
            'preco_compra' => 'decimal:2',
            'preco_venda' => 'decimal:2',
            'ativo' => 'boolean',
            'favorito' => 'boolean',
            'usuario_id' => 'integer',
            'fornecedor_id' => 'integer',
            'grupo_id' => 'integer',
            'descricao' => 'string',
            'foto_path' => 'string',
        ];
    }

    /**
     * Maior código só com dígitos considerado na sequência; acima disso é EAN ou código do lojista.
     */
    public const TAMANHO_MAXIMO_CODIGO_SEQUENCIAL = 6;

    protected static function booted(): void
    {
        static::creating(function (Produto $produto): void {
            if ($produto->codigo === null || trim($produto->codigo) === '') {
                $produto->codigo = self::proximoCodigo($produto->empresa_id);
            }
        });
    }

    /**
     * Próximo código sequencial livre da Empresa: maior código numérico curto + 1.
     */
    public static function proximoCodigo(?int $empresaId): string
    {
        $daEmpresa = fn () => static::query()->where('empresa_id', $empresaId);

        $maior = $daEmpresa()
            ->whereNotNull('codigo')
            ->whereRaw('length(codigo) <= ?', [self::TAMANHO_MAXIMO_CODIGO_SEQUENCIAL])
            ->pluck('codigo')
            ->filter(fn (string $codigo): bool => ctype_digit($codigo))
            ->map(fn (string $codigo): int => (int) $codigo)
            ->max() ?? 0;

        $proximo = $maior + 1;
        while ($daEmpresa()->where('codigo', (string) $proximo)->exists()) {
            $proximo++;
        }

        return (string) $proximo;
    }

    /**
     * Disco das fotos de produto; no Laravel Cloud aponta para o bucket.
     */
    public static function discoFotos(): string
    {
        return config('filesystems.produtos_disk');
    }

    /**
     * URL pública da foto do produto, quando houver.
     */
    protected function fotoUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->foto_path
            ? Storage::disk(self::discoFotos())->url($this->foto_path)
            : null);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function parcelas(): HasMany
    {
        return $this->hasMany(FinanceiroParcela::class, 'produto_id');
    }

    public function fornecedor(): BelongsTo
    {
        return $this->belongsTo(Fornecedor::class, 'fornecedor_id');
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class, 'grupo_id');
    }
}
