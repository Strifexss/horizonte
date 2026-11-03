# Copiloto — chat de ajuda (handoff)

Status: needs-info

## Objetivo

Chat do Copiloto, no módulo `copiloto`, que responde só dúvidas de uso do sistema. Não consulta valores nem lançamentos da Empresa.

## Decidido

- Escopo: só ajuda de uso, sem tools de dados.
- Ícone: headset sem a estrela.
- Acesso: botão no header, ao lado de Novidades. No desktop abre um painel lateral; no celular, um Sheet de baixo com 85% da altura.
- Conteúdo da ajuda: um Markdown por tela do menu em `resources/ajuda/`, versionado com o código.
- Histórico: `RemembersConversations` do `laravel/ai`, enviando ao modelo só as últimas 20 mensagens. A conversa é sempre conferida contra o usuário logado.

## Estado verificado (branch `claude/great-hawking-xv69tr`, a partir de `feature` em `e6261c8`)

- 9 rascunhos em `resources/ajuda/`, um por item do menu em `components/app-sidebar.tsx`, com seção "No celular".
- Escritos a partir do código das telas. Ainda não foram validados por pessoa nem conferidos no navegador.
- Harness: regra `.ai/rules/ajuda-de-uso.md` (mudança visível numa tela atualiza o `.md` dela), citada no `AGENTS.md`, em `docs/quality.md` (Revisão) e em `docs/architecture.md`. A regra foi escrita à mão porque o MCP do Boost (`record-rule`) não conectou na sessão na nuvem.
- Formato: frontmatter com `titulo`, `rota` (nome da rota) e `modulo` (`null` ou o módulo exigido). Uma seção que depende de módulo é precedida por `<!-- modulo: x -->`, como em `dashboard.md`.
- Nenhuma rota restringe tela por papel, então os arquivos não têm campo de papel.

## Pendências

- Validação do conteúdo pelo responsável.
- Repetir a avaliação do harness (`docs/quality.md`), porque o `AGENTS.md` mudou. O toolkit não está nesta sessão.
- Conferir a API de conversas na versão instalada (`laravel/ai` `^0.11.3`; a documentação consultada é da 1.x).
- Spec e issues da implementação: agente, AjudaService, rota com `modulo:copiloto`, tabelas de conversa, UI e testes.

## Próximo passo

Aplicar as correções do responsável nos rascunhos e então escrever `spec.md` e as issues.
