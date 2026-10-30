# 07 — Modal do nome para clientes antigos

Status: resolved
Blocked by: 01

## O quê
- No layout autenticado do app, se `empresa.nome_confirmado` for falso, abrir modal não dispensável (sem fechar por X/ESC/clique fora) com o nome atual preenchido.
- Rota para salvar o nome: valida (obrigatório, até 120), grava `nome` e `nome_confirmado_em`.
- Visual: modal do sistema (design no canvas, desktop e mobile).

## Pronto quando
- Testes: prop `empresa.nome_confirmado` falsa para cliente antigo; salvar confirma e atualiza o nome; validação; outro usuário não altera Empresa alheia.
