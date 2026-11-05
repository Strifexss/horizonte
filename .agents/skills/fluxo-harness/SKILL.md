---
name: fluxo-harness
description: Conduz um pedido de mudança no Horizonte pelo fluxo do harness, do intake à entrega: critério de aceite, implementação, checks, revisão independente, documentação e publicação autorizada. Use no início de qualquer pedido que altere código, UI, regra ou documentação (feature, correção, ajuste visual, refatoração), inclusive pedidos curtos e incrementais, e antes de commit ou push.
---

# Fluxo do harness

Um **pedido** é uma unidade de trabalho que muda o repositório. Cada pedido percorre as seis etapas abaixo, em ordem. Pedido pequeno não pula etapas: ele as cumpre rápido. Uma sequência de pedidos pequenos sobre o mesmo componente vira uma mudança grande; trate a soma, não só o último incremento.

Fontes de verdade (não as repita, consulte): `AGENTS.md` (acordos e comandos), `docs/quality.md` (checks e revisão), `.ai/rules/index.md` (regras por caminho), `docs/architecture.md` e a skill `estrutura-padrao` (camadas), `docs/design.md` (interface).

## 1. Intake

- Leia as regras de `.ai/rules/index.md` cujos globs cobrem os caminhos em escopo e rode `grep -rin '<palavra-chave>' .ai/rules`.
- Rotina, CRUD ou tela nova: siga a skill `estrutura-padrao`. UI: `web-design-guidelines` e `shadcn`. React: `vercel-react-best-practices`. Auth, Empresa, admin, dinheiro ou upload: `differential-review` na etapa 4.
- Separe **fato observado** (lido no código), **suposição** e **decisão**. Pergunte ao usuário só o que muda o que você faz a seguir.

**Pronto quando:** você sabe quais arquivos e regras estão em jogo e escreveu, para o usuário, o escopo em uma ou duas linhas, incluindo o que fica de fora.

## 2. Critério de aceite

Antes de editar, escreva para o usuário:

- **Critério:** o comportamento observável que prova que o pedido está feito (ex.: "no celular, o salvar com erro abre um modal só com os campos com erro").
- **Prova:** o comando ou verificação que mostra o critério, escolhido de `docs/quality.md`: teste Pest filtrado, `npm run check`, ou verificação no navegador local em desktop e mobile.
- Correção de bug: reproduza primeiro e planeje o teste de regressão.

**Pronto quando:** critério e prova estão escritos na conversa.

## 3. Implementação

- Menor mudança completa; reuse componentes, padrões e dependências existentes. Dependência nova pede aprovação.
- Teste a mudança junto com ela (regra do `AGENTS.md`). Sem infraestrutura de teste para aquele código, diga isso e use a verificação no navegador como prova.
- Formate só os arquivos que você alterou (`vendor/bin/pint --dirty --format agent` no container; `npx prettier --write <arquivos>` no host) e confira `git status` antes de seguir: formatador rodado em pasta inteira toca arquivos de terceiros.

**Pronto quando:** o critério da etapa 2 está implementado e `git status` lista só arquivos do pedido.

## 4. Checks e revisão

- Rode a prova da etapa 2 e os checks de `docs/quality.md` que cobrem os arquivos alterados.
- **Check bloqueado pelo ambiente** (dependência ausente, serviço fora): tente destravar uma vez; se não der, diga ao usuário qual check não rodou, por quê e o que ele precisa rodar. Um check que não rodou não conta como aprovado.
- Mudança não trivial (componente compartilhado, vários arquivos, regra de negócio): revisão independente e somente leitura do diff exato e dos chamadores, por subagente. Resolva ou justifique por escrito cada achado relevante. Cada incremento não trivial recebe a sua revisão.

**Pronto quando:** a prova passou (ou o bloqueio foi relatado), os achados da revisão estão resolvidos ou justificados, e você mostrou a evidência (saída do comando ou print).

## 5. Documentação

- Atualize o documento responsável junto com a mudança: comando ou gate em `docs/quality.md` e `AGENTS.md`; padrão de interface em `docs/design.md`; decisão em `docs/adr/`.
- Lição que vai se repetir vira regra em `.ai/rules` (com glob), via `record-rule` quando o Laravel Boost estiver conectado.
- Trabalho que continua em outra sessão ganha handoff curto em `.scratch/<feature>/`: objetivo, estado verificado, checks, pendências, próximo passo.

**Pronto quando:** todo comando, padrão ou regra novos têm um documento que os registra.

## 6. Entrega e publicação

- Commit no branch `feature` (`.ai/rules/git-workflow.md`). Se o ambiente impuser outro branch, a regra continua sendo `feature`: avise o usuário no intake e só leve o trabalho para `feature` quando ele pedir.
- **Publicar** (push, merge ou push para `master`, migration em banco real, ação destrutiva ou com custo) exige pedido explícito do usuário para a entrega em curso. Um "atualize as branches" de uma entrega anterior não vale para a próxima: pergunte. `master` só recebe o trabalho quando o usuário pedir para consolidar.
- Resposta final: o que mudou, a prova e o resultado, o que não foi verificado, e o que o usuário precisa rodar ou testar.

**Pronto quando:** o commit existe, nada foi publicado sem pedido explícito, e o usuário sabe exatamente o que foi e o que não foi verificado.
