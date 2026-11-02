# Horizonte

Fonte do vocabulário: [CONTEXT.md](CONTEXT.md). Decisões de arquitetura: [docs/adr/](docs/adr/). Specs por funcionalidade: `.scratch/<feature>/spec.md`.

## Problema e objetivo

Pequenos negócios (varejo e restaurante) controlam vendas, contas a pagar/receber e cadastros em ferramentas soltas. O Horizonte reúne vendas, financeiro e cadastros de uma **Empresa** num único sistema web, com análise do mês e cardápio na TV para quem usa o Menu Board.

## Público e papéis

- **Usuário**: pessoa com login (e-mail e senha ou Google, contas independentes), sempre dentro de uma Empresa, com um **Cargo** (admin master, gerente, atendente).
- **Administrador**: e-mail listado em `ADMIN_EMAILS`; usa o **Painel Administrativo** num caminho secreto (`ADMIN_PATH`), que responde 404 para os demais.
- **Cliente**: quem compra da Empresa; nunca tem login.

## Fluxos existentes

Observados nas rotas (`routes/web.php`), páginas (`resources/js/pages/`) e testes (`tests/Feature/`):

1. Cadastro/login (senha ou Google) e onboarding da Empresa (nome do negócio e **Segmento**, o ramo).
2. **Início**: atalhos (Nova venda em destaque), resumo de hoje/mês, últimos lançamentos e **Primeiros passos**.
3. **Venda**: itens, Cliente (padrão CONSUMIDOR), pagamentos por **Forma de pagamento**; ao fechar, cada pagamento vira receita; cancelar exclui as receitas geradas.
4. **Extrato**: lançamentos e parcelas por **Competência**, filtros, resumo, PDF.
5. Cadastros: contas, categorias, produtos, fornecedores, grupos, funcionários, clientes, formas de pagamento.
6. **Dashboard**: indicadores por **Período de referência** e análise com IA (módulo opcional Copiloto; Gemini via `laravel/ai`, com limite de análises por usuário e janela de tempo em `config/insights.php`).
7. **Menu Board** (módulo opcional) e **TV** pareada por PIN; **Sync** manual.
8. **Novidades** com Pop-up automático e dispensa por Usuário.
9. Painel Administrativo: Empresas, Usuários (**Entrar como**), Segmentos, Novidades.

## Fora do escopo atual

- Planos, Trial, status de assinatura e cobrança: planejados no ADR 0001, ainda sem código.
- Convites e várias Empresas por conta (ADR 0001).

## Requisitos e restrições

- Todo dado próprio pertence a uma Empresa e é filtrado pela Empresa ativa (ADR 0001).
- Interface em português do Brasil, desktop e mobile.
- Módulo opcional (Menu Board, Copiloto) aparece quando o ajuste da Empresa o liga; sem ajuste, vale o que o Segmento inclui (`Empresa::podeUsar`).
- Stack existente preservada: Laravel 12, Inertia 2, React 19, MySQL 8. Detalhes em [docs/architecture.md](docs/architecture.md).

## Critérios de aceite

Os critérios ficam em cada spec de `.scratch/` e são provados pelos testes Pest em `tests/Feature/`. Este documento não duplica esses critérios.

## Manutenção

Atualize quando objetivo, escopo, papéis ou restrições mudarem. Termos novos entram primeiro em `CONTEXT.md`.
