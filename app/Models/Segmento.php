<?php

namespace App\Models;

use Database\Factories\SegmentoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Segmento extends Model
{
    /** @use HasFactory<SegmentoFactory> */
    use HasFactory;

    public const VAREJO = 'varejo';

    public const RESTAURANTE = 'restaurante';

    public const MODULO_MENU_BOARD = 'menu_board';

    public const MODULO_COPILOTO = 'copiloto';

    /**
     * Módulos opcionais: o Segmento escolhe quais inclui e o Administrador ajusta por Empresa.
     *
     * @var array<string, array{nome: string, descricao: string}>
     */
    public const MODULOS_OPCIONAIS = [
        self::MODULO_MENU_BOARD => ['nome' => 'Menu Board', 'descricao' => 'Cardápio na TV do balcão, pareamento e exibição.'],
        self::MODULO_COPILOTO => ['nome' => 'Copiloto', 'descricao' => 'Insights de IA no Dashboard.'],
    ];

    /**
     * Módulos obrigatórios: presentes em toda Empresa, só informativos no painel.
     *
     * @var list<string>
     */
    public const MODULOS_OBRIGATORIOS = [
        'Financeiro e Extrato',
        'Contas',
        'Categorias',
        'Formas de pagamento',
        'Produtos',
        'Grupos',
        'Fornecedores',
        'Funcionários',
        'Vendas',
        'Dashboard',
    ];

    protected $table = 'segmentos';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'chave',
        'nome',
        'descricao',
        'modulos',
        'ativo',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'modulos' => 'array',
            'ativo' => 'boolean',
        ];
    }

    public function empresas(): HasMany
    {
        return $this->hasMany(Empresa::class, 'segmento_id');
    }

    public function inclui(string $modulo): bool
    {
        return in_array($modulo, $this->modulos ?? [], true);
    }

    public static function varejoId(): int
    {
        return (int) static::query()->where('chave', self::VAREJO)->value('id');
    }
}
