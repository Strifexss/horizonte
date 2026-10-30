# 08 — Painel Administrativo: usuários com Empresa e método

Status: needs-info
Blocked by: 03, 04

needs-info: regra de Administrador com e-mail duplicado (spec, "Em aberto").

## O quê
- Listagem de usuários (tabela e cards mobile) mostra nome da Empresa e selo Senha/Google.
- Criar usuário pelo admin continua criando conta com senha; ganha Empresa "Empresa de [nome]" não confirmada.
- "Transferir dados": origem e destino viram as Empresas dos usuários escolhidos (ver ticket 03).
- Excluir usuário que é único membro da Empresa exclui a Empresa (cascade).
- `EnsureAdministrador`: aplicar a regra decidida para e-mail duplicado.

## Pronto quando
- Testes do `PainelAdministrativoTest` e `TransferirDadosTest` ajustados; novos casos para Empresa na listagem, exclusão em cascata e a regra de Administrador.
