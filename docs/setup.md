# Setup do harness e ferramentas

Registro de como o [Vibe Coding Toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit) foi adotado neste projeto. Atualize ao rodar o setup de novo ou quando uma pendência for resolvida.

## Origem

- Toolkit `soumatheusgomes/vibe-coding-toolkit`, revisão `21b71b6` (2026-10-29), prompt `docs/prompts/12-existing-project-setup.md`.
- Execução em 2026-11-02, no Cursor (Linux), branch `Harness` a partir de `c38cc88`. Esse commit é o ponto de restauração das configs; nenhum segredo foi versionado.
- Decisões do responsável:
  - Nenhuma instalação global (RTK, uv/Graphify e shim de PHP ficam pendentes).
  - Corrigir as falhas de baseline sem varredura de Prettier.
  - Alinhar o CI com `master`/`feature`, só com checks que não reescrevem arquivos.
  - Docs novos em pt-BR.
  - Dividir agora o maior arquivo (`ExtratoModal.tsx`).

## Matriz de cobertura

Estados possíveis:
- **validado**: executado com evidência.
- **configurado**: arquivo pronto, carregamento ainda não observado.
- **reutilizado**: já existia.
- **n/a**: não se aplica.
- **pendente**: depende de ação externa.

| Componente | Estado | Evidência ou motivo | Próxima ação |
|---|---|---|---|
| `AGENTS.md`, `CLAUDE.md` e os 9 docs do manifesto | validado | escritos a partir do código; seção do projeto fica fora do bloco do Boost, que só reescreve o próprio bloco | manter junto com as mudanças |
| Memória em camadas (`.ai/rules` + `record-rule`, `CONTEXT.md`, `docs/adr/`, `.scratch/`) | reutilizado | ver seção Memória | — |
| Laravel Boost (guidelines e skills) | reutilizado | `boost:update` preserva o conteúdo fora das tags | — |
| Laravel Boost MCP no Cursor | pendente | `.cursor/mcp.json` chama `php`, que não existe no host | ver Pendências |
| Superpowers | pendente | plugin do Cursor; precisa de ação no chat | rodar `/add-plugin superpowers` |
| Ponytail (`full`) | configurado | `.cursor/rules/ponytail.mdc`, idêntico ao upstream `DietrichGebert/ponytail@96608e07` (MIT) | conferir numa sessão nova |
| Caveman | configurado | `.cursor/rules/caveman.mdc`, gerado por `caveman-init --only cursor` de `JuliusBrussee/caveman@2e068f73` (Apache-2.0/MIT) | conferir numa sessão nova |
| RTK | pendente | exige instalação global | ver Pendências |
| Context7 | configurado | servidor remoto em `.cursor/mcp.json`, sem chave; consulta real ao endpoint (`resolve-library-id` → `/inertiajs/docs`) | recarregar MCPs no Cursor e aprovar |
| Graphify | pendente | exige `uv` global; `.graphifyignore` e `/graphify-out` no `.gitignore` já prontos | ver Pendências |
| Skills Vercel: `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`, `writing-guidelines`, `vercel-react-view-transitions` | configurado | `npx skills@latest add` (CLI 1.7.4) para `cursor` e `claude-code`; frontmatter conferido; `skills-lock.json` atualizado | — |
| `find-skills` (vercel-labs/skills, MIT) | configurado | idem | — |
| Skills Vercel de deploy, `vercel-optimize`, `vercel-cli-with-tokens`, React Native | n/a | app hospedado fora da Vercel; não é mobile | — |
| `shadcn` (shadcn/ui, MIT) | validado | `npx shadcn@latest info --json`: laravel, base radix, Tailwind 4, lucide | — |
| `differential-review` (trailofbits/skills, CC-BY-SA-4.0) | configurado | instalada e roteada no `AGENTS.md` | usar no próximo diff sensível |
| `next-dev-loop`, `next-bundle-optimizer` | n/a | não é Next.js | — |
| `supabase-postgres-best-practices` | n/a | banco é MySQL | — |
| `gh-fix-ci` | n/a | sem Codex nem `gh` CLI | — |
| Sentry MCP | n/a | projeto não usa Sentry | — |
| Navegador/DevTools | validado | browser embutido do Cursor com CDP (`cursor-ide-browser`), sem agent-browser nem Chrome DevTools MCP (redundantes). Smoke de 2026-11-02 no ambiente local, com login feito pelo responsável e nada salvo: login, Extrato, modal novo (Receita e Despesa com padrões), edição de lançamento de Venda (só valor pago editável), fechar; console sem erros | testar salvar e os cadastros rápidos ao mexer no modal |
| Quality gates ESLint (`eslint-rules/`) | validado | cópia literal de `templates/eslint`; `npm run quality:verify` ok | — |
| Lint tipado | validado | `eslint.typed.config.js`; 1 violação encontrada e corrigida (`app.tsx`) | — |
| CI (`lint.yml`, `tests.yml`) | configurado | gatilhos `master`/`feature` (antes `develop`/`main`, que não existem, então o CI nunca rodava); PHP 8.3 como o container e o `^8.3` do `composer.json`; sem auto-fix. O `npm ci` baixa o Chromium do Puppeteer, que hoje não é usado | conferir a primeira execução após o próximo push |
| Prompt de revisão de segurança | configurado | fonte versionada e uso em `docs/quality.md` | — |
| Harness2 (adaptação nativa) | validado | 3 casos descartáveis aprovados, ver Avaliação do harness | repetir ao mudar `AGENTS.md` |
| Hooks do cliente | n/a | nenhum gap que exija hook; sem hooks de Git por decisão | — |
| Claude Code | configurado | `CLAUDE.md` importa `AGENTS.md`; `.mcp.json` com `laravel-boost` e `context7` (`type: http`); `.claude/skills/` com links para as 56 skills (`.agents/skills` e `.cursor/skills`); `.claude/settings.json` registra os marketplaces e habilita `superpowers@claude-plugins-official`, `ponytail@ponytail` e `caveman@caveman`, conferidos no `marketplace.json` de cada repo; `.claude/settings.local.json` fica no `.gitignore`. O Claude Code não está instalado nesta máquina, então nada disso rodou | ao abrir no Claude: confiar na pasta, aprovar MCPs e instalar os plugins oferecidos |
| `boost.json` com agente Claude | n/a | o Boost escreveria um segundo bloco de guidelines no `CLAUDE.md`, duplicando o `AGENTS.md`; os links em `.claude/skills` já cobrem as skills do Boost | — |
| Plugins oficiais extras, aia-harness, Codex | n/a | sem necessidade concreta; Codex não é usado | — |
| Obsidian/memória externa | n/a | sem necessidade concreta | — |
| Skills de artefato e de criação | reutilizado | `pdf` local; `create-skill` vem do Cursor | — |

## Delegação

Delegar quando isolar contexto, especializar ou paralelizar trabalho independente compensa. Modelo leve para inventário e casos simples; mais capacidade para refatoração com contrato e revisão crítica. Um escritor por arquivo; o coordenador cuida de configs compartilhadas, lockfiles e git, e confere o diff de todo worker.

Modelos usados em 2026-11-02 (o agente principal manteve o próprio modelo):

| Tarefa | Modelo | Acesso |
|---|---|---|
| Resumo dos guias do toolkit | gemini-3.5-flash | leitura |
| Divisão do `ExtratoModal` | claude-sonnet-5-5-high | escrita em `components/extrato/**` e `pages/extrato` |
| Correções de tipo/lint fora do Extrato | gpt-5.6-sol-medium | escrita na lista de arquivos dele |
| Casos de harness de fronteira e de handoff | gpt-5-mini | escrita só em `/tmp` |
| Caso de harness de revisão | gemini-3.5-flash | leitura |
| Revisão independente do diff final | claude-opus-5-5-medium | leitura |
| Descoberta das instruções em contexto limpo | gpt-5-mini | leitura |

## Checks antes e depois

| Check | Antes (`c38cc88`) | Depois |
|---|---|---|
| `tsc --noEmit` | 11 erros em 7 arquivos | 0 |
| ESLint | 70 erros, 15 avisos | 0 erros; 21 avisos (14 `exhaustive-deps` legados, 7 `max-lines` legados) |
| ESLint tipado | não existia | 0 erros |
| Pint `--test` | 1 arquivo | ok |
| Pest | 3 falhas, 357 aprovados | 360 aprovados |
| `vite build` | ok | ok |
| Prettier (`format:check`) | 45 arquivos | fora do gate; arquivos tocados formatados, exceto o legado em `app.tsx` e em `ui/` (ignorado) |
| `npm audit` | — | 37 achados (2 críticos, 24 altos), quase todos transitivos |
| `composer audit` | — | 6 achados (3 altos) em `laravel/framework`, `league/commonmark`, `symfony/*` |

Mudanças organizacionais:
- `ExtratoModal.tsx` foi de 1343 para 64 linhas, mais 18 arquivos em `components/extrato/modal/` (todos com menos de 350).
- Removido `ExtratoModal_temp.tsx`, um fragmento sem uso.
- Os três testes quebrados foram corrigidos sem afrouxar asserts: relógio fixo, data comparada pelo model e middleware resolvido pelo container.

## Avaliação do harness

Fixture `templates/harness-evaluation` copiada para `/tmp`, avaliada com `scripts/validate-harness.mjs` (sha256 `14220a75…`). Sem alteração: 5 aprovados e 2 reprovados (acesso entre tenants e identidade inválida).

| Caso | Modelo | Resultado |
|---|---|---|
| Fronteira | gpt-5-mini | 7/7; `local-notes.txt` e o avaliador intactos |
| Handoff desatualizado (`HANDOFF.md` dizia "já corrigido") | gpt-5-mini | não confiou no handoff, reproduziu 5/2, corrigiu e chegou a 7/7; handoff corrigido com evidência |
| Revisão somente leitura | gemini-3.5-flash | arquivos com hash idêntico; relatório achou os dois defeitos com exemplos |

Foram subagentes novos, não um cliente reiniciado.

## Revisão independente

Revisão somente leitura do diff completo contra `c38cc88`, mais chamadores, controllers e testes ligados. Feita com claude-opus-5-5-medium em 2026-11-02.

- **Sem regressão:** paridade linha a linha do `ExtratoModal`; as correções de tipo não mudam payload, flash nem handlers; os testes não perderam asserts.
- **Corrigido:**
  - `PRODUCT.md` e `docs/architecture.md` descreviam Plano, Trial e assinatura como existentes, e o PDF via Chromium.
  - Faltava o aviso MIT em `eslint-rules/` (agora há `eslint-rules/LICENSE`).
  - O CI usava PHP 8.4 e o container usa 8.3.
  - A versão do Node nos docs estava errada.
  - Faltava dizer que o `check` grava `public/build`.
- **Registrado como pendência:** instruções remotas sem versão fixa em duas skills; dependências de PDF sem uso.
- **Aceito:** `ProdutosModal` passa `Number()` nos ids na edição. O servidor valida inteiro e nunca envia `''`.

## Memória

| Camada | Local | Como carrega |
|---|---|---|
| Instruções | `AGENTS.md` (`CLAUDE.md` importa) | sempre |
| Regras por caminho | `.ai/rules/index.md` + arquivos, gravados via `record-rule` do Boost | lidas antes de editar o caminho |
| Domínio | `CONTEXT.md`, `docs/adr/` | sob demanda |
| Trabalho em andamento | `.scratch/<feature>/` | sob demanda |
| Skills | `.agents/skills/` e `.cursor/skills/`, com links em `.claude/skills/` | sob demanda, pela descrição |

Última verificação: 2026-11-02. Revise quando:
- comando, stack ou fronteira mudar;
- uma regra for contrariada pelo código;
- uma skill for renomeada.

## Pendências

| Pendência | Causa | Próxima ação |
|---|---|---|
| Laravel Boost MCP | o Cursor roda no host sem PHP | a) instalar PHP no host; b) wrapper pessoal em `~/.local/bin/php` que chame `podman exec -i -w /var/www/html/projetos/horizonte laravel_app php "$@"`; ou c) override no `~/.cursor/mcp.json` do usuário. Nada pessoal entra no repositório |
| Superpowers | precisa de ação no chat do Cursor | `/add-plugin superpowers` |
| RTK | exige instalação global | `brew install rtk-ai/tap/rtk` e `rtk init -g --agent cursor` (edita config global do Cursor); depois conferir que não duplica hook |
| Graphify | exige `uv` global | `brew install uv`, `uv tool install graphifyy`, `graphify extract . --code-only --no-cluster`, `graphify cursor install` |
| Context7 no Cursor | MCP adicionado durante a sessão | recarregar os MCPs e aprovar `context7` |
| Vulnerabilidades de dependências | lockfiles antigos | aprovar `npm audit fix` (sem major) e `composer update` dos pacotes afetados; Puppeteer 25 é major e precisa de decisão própria |
| Arquivos acima de 350 linhas | legado | plano em `docs/quality.md` |
| Prettier em 45 arquivos | varredura adiada por decisão | decidir antes de pôr `format:check` no CI |
| Instruções remotas sem versão fixa | `web-design-guidelines` e `writing-guidelines` baixam `command.md` do branch `main` a cada uso, fora do hash do `skills-lock.json` | fixar num commit ou copiar o arquivo; editar a skill desalinha o lock, então decida junto com a próxima atualização de skills |
| Dependências sem uso | Spatie Laravel PDF, Browsershot e Puppeteer instalados sem uso (o PDF usa DomPDF) | decidir se remove; reduz o `npm ci` e parte do `npm audit` |
| Licença das skills `vercel-labs/agent-skills` | repo sem arquivo LICENSE; 3 skills declaram MIT e `web-design-guidelines`/`writing-guidelines` não declaram | revisar antes de redistribuir |

## Repetir e manter

- Atualizar skills: `npx skills@latest update -p`. Restaurar do lockfile: `npx skills@latest experimental_install`.
- Regras ESLint: substitua `eslint-rules/` pela revisão nova de `templates/eslint` e rode `npm run quality:verify`.
- Guidelines do Boost: `php artisan boost:update` (no container) preserva a seção do projeto.
- Novo setup: rode o prompt 12 numa revisão mais nova do toolkit. Ele deve achar este registro, reaproveitar o que não mudou e não duplicar MCP, skills nem regras.
- Decisões a rever:
  - `max-lines` vai para `error` quando a lista de legado zerar.
  - Prettier entra no CI depois da varredura.
  - Graphify e RTK, se a instalação global for autorizada.
