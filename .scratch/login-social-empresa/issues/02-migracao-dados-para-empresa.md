# 02 — Migração de esquema: `empresa_id` nas tabelas

Status: ready-for-agent
Blocked by: 01

## Tabelas (todas com `usuario_id` hoje)

| Tabela | `empresa_id` | Observação |
|---|---|---|
| `conta` | not null | conta padrão passa a ser por Empresa |
| `categoria` | nullable | nulo = padrão do sistema |
| `forma_pagamento` | nullable | nulo = padrão do sistema |
| `financeiro` | not null | |
| `financeiro_parcela` | not null | consultas do Extrato/Dashboard usam esta coluna |
| `produto` | not null | |
| `fornecedor` | not null | |
| `grupos` | not null | |
| `funcionario` | not null | |
| `menu_board` | not null | "um ativo na TV por vez" passa a ser por Empresa |
| `tv_pareamento_pin` | not null | |
| `tv_dispositivo` | not null | |
| `venda` | not null | |
| `dashboard_analise` | not null | índice (`empresa_id`, `ano`, `mes`) no lugar do de usuário |
| `insight_acao` | not null | |
| `novidade_dispensada` | **não muda** | continua por Usuário |

## O quê
- Adicionar `empresa_id` (FK `empresas`, cascade on delete, índice), preencher a partir do vínculo do `usuario_id` e só então aplicar `NOT NULL` onde a tabela pede.
- Índices e únicos que hoje incluem `usuario_id` passam a usar `empresa_id`.
- `usuario_id` permanece (autor). Migrations reversíveis.

## Pronto quando
- Teste de migração: dados de dois usuários antigos ficam cada um na Empresa certa; padrões do sistema seguem com `empresa_id` nulo.
