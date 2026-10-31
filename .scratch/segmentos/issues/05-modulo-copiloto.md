# 05 — Copiloto atrás do módulo `copiloto`

Status: resolved
Blocked by: 03

## O quê
- Rotas `dashboard.insights.*` com `modulo:copiloto`.
- `DashboardController` só carrega a análise com o módulo; o card some no front.
- Job `GerarAnaliseDashboard`: se a Empresa perdeu o módulo, marca a análise como falha e não chama a IA.

## Pronto quando
- Testes: sem Copiloto, gerar responde 404 e o Dashboard não traz análise; job não chama a IA (fake do agente).
