<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class NovidadeImagem extends Model
{
    /**
     * @var string
     */
    protected $table = 'novidade_imagem';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'novidade_id',
        'caminho',
        'ordem',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'novidade_id' => 'integer',
            'ordem' => 'integer',
        ];
    }

    public function novidade(): BelongsTo
    {
        return $this->belongsTo(Novidade::class, 'novidade_id');
    }

    public function url(): string
    {
        return Storage::disk(Novidade::discoImagens())->url($this->caminho);
    }
}
