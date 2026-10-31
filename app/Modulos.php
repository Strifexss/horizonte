<?php

namespace App;

final class Modulos
{
    public const MENU_BOARD = 'menu_board';

    public const COPILOTO = 'copiloto';

    /**
     * Catálogo dos módulos opcionais: o Segmento escolhe quais inclui e o Administrador ajusta por Empresa.
     *
     * @var array<string, array{nome: string, descricao: string}>
     */
    public const OPCIONAIS = [
        self::MENU_BOARD => ['nome' => 'Menu Board', 'descricao' => 'Cardápio na TV do balcão, pareamento e exibição.'],
        self::COPILOTO => ['nome' => 'Copiloto', 'descricao' => 'Insights de IA no Dashboard.'],
    ];

    /**
     * Presentes em toda Empresa; só informativos no painel.
     *
     * @var list<string>
     */
    public const OBRIGATORIOS = [
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
}
