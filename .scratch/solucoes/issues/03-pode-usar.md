# 03 — `Empresa::podeUsar()` e prop compartilhada

Status: ready-for-agent
Blocked by: 01

## O quê
- `podeUsar(chave)`: ajuste da Empresa → senão Soluções da Empresa (spec, "Regra de acesso"). Uma consulta por request (memo).
- Middleware `funcionalidade:{chave}` → 404 quando indisponível.
- Inertia: `empresa.funcionalidades` (chaves disponíveis), `empresa.solucoes` (nomes).
- Regra no serviço: uma única base por Empresa; complemento só com base.

## Pronto quando
- Testes: Solução dá acesso; ajuste "desligar" tira mesmo com Solução; ajuste "ligar" dá sem Solução; sem nada, não dá.
