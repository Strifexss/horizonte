# Copiloto — chat de ajuda (handoff)

Status: ready-for-human

## Objetivo

Chat do Copiloto, no módulo `copiloto`, que responde só dúvidas de uso do sistema. Não consulta valores nem lançamentos da Empresa.

## Decidido

- Escopo: só ajuda de uso, sem tools de dados.
- Ícone: headset sem a estrela.
- Acesso: botão no header, ao lado de Novidades. No desktop abre um painel lateral; no celular, um modal em tela cheia (contrato "Modal no mobile").
- Conteúdo da ajuda: um Markdown por tela do menu em `resources/ajuda/`, versionado com o código.
- Histórico: `RemembersConversations` do `laravel/ai`, enviando ao modelo só as últimas 20 mensagens. A conversa é sempre conferida contra o usuário logado.

## Estado verificado (branch `claude/great-hawking-xv69tr`, a partir de `feature` em `e6261c8`)

- 9 rascunhos em `resources/ajuda/`, um por item do menu em `components/app-sidebar.tsx`, com seção "No celular".
- Escritos a partir do código das telas. Ainda não foram validados por pessoa nem conferidos no navegador.
- Harness: regra `.ai/rules/ajuda-de-uso.md` (mudança visível numa tela atualiza o `.md` dela), citada no `AGENTS.md`, em `docs/quality.md` (Revisão) e em `docs/architecture.md`. A regra foi escrita à mão porque o MCP do Boost (`record-rule`) não conectou na sessão na nuvem.
- Formato: frontmatter com `titulo`, `rota` (nome da rota) e `modulo` (`null` ou o módulo exigido). Uma seção que depende de módulo é precedida por `<!-- modulo: x -->`, como em `dashboard.md`.
- Nenhuma rota restringe tela por papel, então os arquivos não têm campo de papel.

## Verificado no código do `laravel/ai` v0.11.3 (versão do `composer.lock`)

- `RemembersConversations` existe, com `forUser`, `continue`, `continueLastConversation` e `maxConversationMessages()` (padrão 100).
- Cache de contexto no Gemini: só o cache explícito, passando `cachedContent` em `providerOptions`. O SDK repassa o nome do cache, mas não cria o cache. O atributo `#[CacheInstructions]` só funciona com Anthropic e Bedrock.
- O `Usage` da resposta separa os tokens lidos do cache (`cachedContentTokenCount`), o que permite medir a economia.
- Chave de IA: o chat pode usar a mesma configuração do `AnalistaDashboard`, mas deve passar pelo mesmo limitador global (`insights.requisicoes_por_minuto`).

## Pendências

- Validação do conteúdo pelo responsável.
- Repetir a avaliação do harness (`docs/quality.md`), porque o `AGENTS.md` mudou. O toolkit não está nesta sessão.
- Spec e issues da implementação: agente, AjudaService, rota com `modulo:copiloto`, tabelas de conversa, UI e testes.

## Implementado (2026-11-05)

- Issues 01 a 05 implementadas (spec em `spec.md`). Backend, front, admin "Configurações", limpeza agendada (`copiloto:apagar-conversas`).
- Checks: `php artisan test --compact` 389 verdes (26 novos em `CopilotoTest` e `ConfiguracoesAdminTest`); Pint ok; `tsc`, ESLint (0 erros) e build ok. Prints com `COPILOTO_AGENTE=fake`.
- Falta: teste com a chave real do Gemini; revisão independente do diff; migrations em banco real (exigem autorização); rodar a avaliação do harness.

## Próximo passo

Responsável envia a chave do Gemini; testar com `COPILOTO_AGENTE=laravel_ai` e ajustar as instruções do agente conforme as respostas reais.
