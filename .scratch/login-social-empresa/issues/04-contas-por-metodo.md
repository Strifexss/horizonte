# 04 — Contas por método de login

Status: resolved
Blocked by: 01

## O quê
- `users`: `password` nullable, `google_id` nullable único; trocar o único de `email` por unicidade por método (com senha: `google_id` nulo; Google: por `google_id`).
- Login com senha (`AuthenticatedSessionController` / `LoginRequest`): só contas com senha.
- Cadastro (`RegisteredUserController`): e-mail único entre contas com senha.
- Esqueci/redefinir senha: broker só encontra contas com senha (tokens são por e-mail).
- Configurações: conta Google sem aba/rota de senha, sem confirmar senha (`ConfirmablePasswordController`) e sem editar e-mail; perfil valida e-mail único só entre contas do mesmo método.
- Texto na tela de login: "Conta Google e conta com senha são separadas".

## Pronto quando
- Testes: e-mail igual em senha e Google coexiste; cadastro com senha recusa e-mail já usado por outra conta com senha; login com senha ignora conta Google; reset não envia para conta Google; conta Google não acessa tela de senha.
