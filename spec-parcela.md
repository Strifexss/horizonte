## Problem Statement

O DashboardController estava vazio (`//`) e a página `dashboard.tsx` só exibia `PlaceholderPattern`. A imagem de referência mostra um "Product Sales & Market Share Dashboard" com KPIs (receita, share, unidades, margem, preço, lojas, D2C) e cards de distribuição (canal, região). Precisamos replicar essa visualização com dados mocados, usando os componentes padrão do projeto (`KpisPanel`, `CardList`, `PageTitle`) e respeitando a arquitetura de camadas (controller = receber/responder, sem query/model no controller).

## Solution

- Controller retorna `Inertia::render('dashboard', ['kpis' => ..., 'cards' => ...])` com dados mocados estáticos.
- Page `dashboard.tsx` importa `PageTitle`, `KpisPanel`, `Card` e `Badge`; renderiza os KPIs e dois cards de distribuição.
- Nenhuma alteração em repository/service/model; a rotina segue `estrutura-padrao` (controller recebe/responde, dados estáticos não precisam de service/repository).

## User Stories

1. Como usuário do app, quero ver KPIs de vendas no dashboard, para acompanhar a performance FY2026.
2. Como usuário, quero ver cards de share por canal e crescimento regional, para entender a distribuição da receita.
3. Como dev, quero que o controller siga a arquitetura (sem query/model), para manter o corte de camadas.

## Implementation Decisions

- Controller `DashboardController::index()` retorna array estático via `Inertia::render`.
- Page usa `usePage` para ler props `kpis` e `cards`.
- Componentes reutilizados: `PageTitle`, `KpisPanel` (`padrões`); `Card`, `Badge` (`ui`).
- Nenhum repository/service criado — dados são mockados, sem acesso a banco.
- Rota atualizada para apontar para `DashboardController::index`.

## Testing Decisions

- Verificar visualmente a página `/dashboard` no browser.
- Confirmar que `KpisPanel` exibe 7 KPIs e que `cards` exibe 2 cards.
- Nenhum teste automatizado exigido (intake não pediu testes; dados estáticos).

## Out of Scope

- Dados dinâmicos de banco.
- Gráficos interativos (apenas cards com barras de cor e porcentagens).
- Filtros, exportação ou ações nos KPIs.

## Further Notes

- Se precisar de dados reais no futuro, criar um `DashboardService` e `DashboardRepository` para consultar agregados (respeitando `usuario_id` quando aplicável).
- Os ícones dos KPIs são mapeados por string no `iconMap` do frontend; o controller passa o nome do ícone.
