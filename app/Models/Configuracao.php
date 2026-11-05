<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Configuração global editável no painel de admin (chave → valor).
 */
class Configuracao extends Model
{
    public const SUPORTE_WHATSAPP = 'suporte_whatsapp';

    /**
     * @var string
     */
    protected $table = 'configuracao';

    /**
     * @var list<string>
     */
    protected $fillable = ['chave', 'valor'];
}
