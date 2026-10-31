# 03 — `Empresa::podeUsar()` e prop compartilhada

Status: ready-for-agent
Blocked by: 02

## O quê
- `podeUsar(chave)` conforme a spec ("Regra de acesso"), memorizado por request.
- Middleware `modulo:{chave}` → 404 quando indisponível.
- Inertia: `empresa.modulos` e `empresa.segmento`.

## Pronto quando
- Testes: obrigatório sempre disponível; Segmento dá acesso; ajuste "desligar" tira mesmo com Segmento; ajuste "ligar" dá sem Segmento.
