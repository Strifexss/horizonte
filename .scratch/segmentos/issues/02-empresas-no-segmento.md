# 02 — Empresas no Segmento

Status: ready-for-agent
Blocked by: 01

## O quê
- `empresas.segmento_id` (FK); toda Empresa existente vai para Varejo; depois `NOT NULL`.
- Remover `empresas.modulo` e as constantes de módulo do MVP1; ajustar factory (padrão Varejo; estado Restaurante).
- Empresa criada pelo Administrador (MVP1) recebe Varejo.

## Pronto quando
- Teste de migração: Empresa antiga fica em Varejo; nada mais referencia `empresas.modulo`.
