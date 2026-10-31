# 01 — Soluções e catálogo de funcionalidades

Status: ready-for-agent

## O quê
- Catálogo fixo de funcionalidades no código (chave, nome, descrição): `menu_board`, `copiloto`.
- Tabelas `solucoes` (chave única, nome, descrição, tipo `base`|`complemento`, ativo, incluir_no_cadastro), `solucao_funcionalidade` (solucao_id + chave), `empresa_solucao` (empresa_id + solucao_id, único) e `empresa_funcionalidade` (empresa_id + chave + `ligada` bool, único) para os ajustes.
- Models, factories e relações em `Empresa`.
- Migration de dados com as Soluções iniciais (spec).

## Pronto quando
- Testes: Soluções iniciais criadas com as funcionalidades certas; funcionalidade fora do catálogo é recusada.
