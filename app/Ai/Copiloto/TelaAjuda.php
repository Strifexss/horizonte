<?php

namespace App\Ai\Copiloto;

/**
 * Telas do menu que têm ajuda em resources/ajuda/<valor>.md. É a lista fechada de arquivos que o Copiloto lê.
 */
enum TelaAjuda: string
{
    case Inicio = 'inicio';
    case Dashboard = 'dashboard';
    case Extrato = 'extrato';
    case Vendas = 'vendas';
    case Clientes = 'clientes';
    case Produtos = 'produtos';
    case Contas = 'contas';
    case FormasPagamento = 'formas-pagamento';
    case MenuBoards = 'menu-boards';

    /**
     * Tela do componente Inertia aberto ("extrato/index" → Extrato, "menu-boards/form" → MenuBoards).
     * Componente fora do menu (perfil, admin) devolve null.
     */
    public static function doComponente(?string $componente): ?self
    {
        if ($componente === null || $componente === '') {
            return null;
        }

        return self::tryFrom(explode('/', $componente)[0]);
    }
}
