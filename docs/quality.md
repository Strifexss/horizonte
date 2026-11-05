# Qualidade e revisão

## Checks

| Comando | Onde | O que prova |
|---|---|---|
| `composer check` | container `laravel_app` | Pint `--test` (estilo PHP) + suíte Pest completa |
| `composer test` / `php artisan test --compact --filter=Nome` | container | testes (SQLite em memória, `phpunit.xml`) |
| `npm run lint:check` | host | ESLint sem reescrever arquivos, incluindo `quality/max-lines` |
| `npm run lint:typed` | host | promessas ignoradas (`no-floating-promises`) ou usadas como condição/handler (`no-misused-promises`) |
| `npm run types` | host | `tsc --noEmit` (strict) |
| `npm run quality:verify` | host | self-check das regras locais em `eslint-rules/` |
| `npm run build` | host | bundle Vite |
| `npm run check` | host | os cinco acima em sequência |
| `npm run format:check` | host | Prettier; fora do `check` e do CI até a varredura de formatação ser decidida |

`npm run lint`, `npm run format` e `vendor/bin/pint` sem `--test` reescrevem arquivos. Use-os para corrigir, nunca como verificação. O `npm run check` só grava o bundle em `public/build`, que é ignorado pelo git.

O CI (`.github/workflows/lint.yml` e `tests.yml`) roda em push e PR para `master` e `feature`, sem passos que reescrevem arquivos.

## Regras locais

- `eslint-rules/` é cópia literal de `templates/eslint` do Vibe Coding Toolkit (revisão em [setup.md](setup.md)), com a licença MIT em `eslint-rules/LICENSE`. Para atualizar, substitua os quatro arquivos e rode `npm run quality:verify`.
- `quality/max-lines` (350 linhas) vale para `resources/js/**/*.{ts,tsx}`. Ignora `components/ui/sidebar.tsx`, que é gerado pelo shadcn.
- O lint tipado fica em `eslint.typed.config.js` para não pesar no lint comum. Medido em 2026-11-02: 6,5 s e cerca de 940 MB, contra 2,2 s e 620 MB do lint comum.

## Plano de redução dos arquivos grandes

A regra está em `warn` enquanto houver legado. Ao mexer num desses arquivos, extraia um bloco coeso (subcomponente, hook ou utilitário do domínio) e baixe o número sem mudar comportamento. Quando a lista zerar, troque para `error` em `eslint.config.js`.

| Arquivo | Linhas em 2026-11-02 |
|---|---|
| `pages/welcome.tsx` | 790 |
| `components/vendas/VendaModal.tsx` | 514 |
| `components/menu-boards/MenuBoardsConteudo.tsx` | 441 |
| `components/ui/AsyncSelect.tsx` | 376 |
| `components/menu-boards/MenuBoardsForm.tsx` | 370 |
| `pages/dashboard/index.tsx` | 363 |
| `components/produtos/ProdutosForm.tsx` | 357 |

O PHP não tem gate de tamanho. Acima de 350 linhas estão `FinanceiroRepository` (429) e `IndicadoresInsightsService` (364); trate no mesmo espírito quando forem alterados.

Os avisos `react-hooks/exhaustive-deps` (14) são legado conhecido. Corrija só com teste ou verificação no navegador, porque mudar dependências altera quando os efeitos rodam.

## Testes

- Feature tests Pest em `tests/Feature/`, com factories e estados existentes. Correção de bug ganha teste de regressão.
- Datas: listagens filtram o mês atual. Fixe o relógio com `$this->travelTo(...)` e compare datas pelo model.
- Toda mudança que altera o que uma tela mostra ou como ela reage é verificada no navegador local (`http://localhost:8080`), em desktop (1280 px) e celular (390 px), com o console limpo e prints entregues ao usuário: no mínimo o estado padrão de cada tela afetada e os estados que o critério de aceite cita. Sem a app rodando, renderize a tela isolada e registre que a verificação não foi no app real. O fluxo completo, com a prova padrão por tipo de mudança, está na skill `fluxo-harness`.

## Revisão

- Mudança não trivial: revisão independente e somente leitura do diff exato, de chamadores, rotas, testes e configuração ligados. Achados são resolvidos ou justificados por escrito antes de concluir.
- Diffs em autenticação, Empresa/tenant, Painel Administrativo, dinheiro e uploads: use a skill `differential-review`.
- Revisão de segurança dedicada: use o prompt versionado [`docs/prompts/13-security-review.md`](https://github.com/soumatheusgomes/vibe-coding-toolkit/blob/21b71b6/docs/prompts/13-security-review.md) do toolkit. O relatório fica privado, fora do repositório, e não deve conter segredos nem dados pessoais.

## Avaliação do harness

Modo: adaptação nativa do método Harness2, sem CLI, benchmark nem custo extra. Fontes do toolkit: `docs/07-harness-evaluation.md`, `docs/tools/23-harness2.md` e os prompts `14-harness-evaluation.md` e `15-harness-improvement.md`, na revisão registrada em [setup.md](setup.md).

1. Copie `templates/harness-evaluation` do toolkit para uma pasta descartável fora do repositório, uma cópia por caso.
2. Rode os casos (fronteira, handoff desatualizado, revisão somente leitura) com o cliente e o modelo atuais.
3. Avalie com `node scripts/validate-harness.mjs <pasta>`.
4. Se algum falhar, compare **uma** alteração candidata de instrução contra o original antes de mudar `AGENTS.md`.

O último resultado está em [setup.md](setup.md).

## Manutenção

Comando, gate ou regra novos entram aqui e no `AGENTS.md`. Não enfraqueça regra, teste ou validação para um check passar.
