# 05 — Login com Google

Status: resolved
Blocked by: 04

## O quê
- `composer require laravel/socialite` (aprovado); `config/services.php` → `google` lendo `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (já no `.env.example`).
- Rotas guest `auth/google/redirect` e `auth/google/callback`.
- Callback: busca por `google_id`; senão cria conta (nome, e-mail, `google_id`, sem senha, e-mail verificado); loga com "lembrar"; segue para onboarding se não houver Empresa.
- Erro/cancelamento: volta ao login com mensagem, sem criar conta.
- Botão "Entrar com Google" no login e no cadastro (design no canvas).

## Pronto quando
- Testes com Socialite mockado: primeiro acesso cria conta Google; segundo acesso reutiliza; conta com senha de mesmo e-mail não é tocada; falha volta ao login.
- Tarefa do dono do projeto: criar o OAuth Client no Google Cloud e preencher o `.env`.
