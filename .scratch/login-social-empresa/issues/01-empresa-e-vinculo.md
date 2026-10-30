# 01 — Empresa e vínculo

Status: resolved

## O quê
- Migrations `empresas` e `empresa_user` (spec, "Empresa").
- Models `Empresa` (com factory) e relação em `User`; enum de cargo e de módulo (chaves TitleCase).
- Ponto central da Empresa ativa (ex.: `$user->empresa()` / helper usado por repositórios e serviços).
- Prop Inertia compartilhada `empresa` (`id`, `nome`, `nome_confirmado`) no `HandleInertiaRequests`.
- Migration de dados: para cada usuário existente cria "Empresa de [nome]" (`varejo`, nome não confirmado) e vínculo `admin_master`.

## Pronto quando
- Testes: usuário antigo ganha Empresa e vínculo `admin_master`; nome no formato esperado; `nome_confirmado_em` nulo; usuário novo sem Empresa não quebra a resolução (retorna nulo).
