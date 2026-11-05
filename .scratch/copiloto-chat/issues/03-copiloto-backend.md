# 03 — Backend do chat

Status: resolved
Blocked by: 01, 02

- Migrations do `laravel/ai` (conversas), `copiloto_pergunta_sem_resposta`, `copiloto_interesse`.
- `CopilotoAgenteInterface`, `LaravelAiCopilotoAgente`, agente `Copiloto` (saída estruturada), `FakeCopilotoAgente`.
- `CopilotoService` + repositories; `CopilotoController` (abertura, mensagem, nova conversa, interesse).
- Limites por usuário e limite global compartilhado; limpeza de conversas com mais de 30 dias.
- Módulo `copiloto` exibido como "Copiloto Pro".
- Testes: abertura por tela; oferta só de módulo ausente; conversa alheia = 404; sem resposta registra; nova conversa apaga; limite 429; interesse registra.
