<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Produto extends Model
{
    use HasFactory;

    /**
     * @var string
     */
    protected $table = 'produto';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'preco_compra',
        'preco_venda',
        'ativo',
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
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'nome' => 'string',
            'preco_compra' => 'decimal:2',
            'preco_venda' => 'decimal:2',
            'ativo' => 'boolean',
            'usuario_id' => 'integer',
            'fornecedor_id' => 'integer',
            'grupo_id' => 'integer',
            'descricao' => 'string',
            'foto_path' => 'string',
        ];
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
