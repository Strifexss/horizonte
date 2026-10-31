# 05 — Copiloto atrás de `copiloto`

Status: ready-for-agent
Blocked by: 03

## O quê
- Rotas `dashboard.insights.*` com `funcionalidade:copiloto`.
- `DashboardController` só carrega a análise com a funcionalidade; o card some no front.
- Job `GerarAnaliseDashboard`: se a Empresa perdeu o Copiloto, marca a análise como falha e não chama a IA.

## Pronto quando
- Testes: sem Copiloto, gerar responde 404 e o Dashboard não traz análise; job não chama a IA (fake do agente).
