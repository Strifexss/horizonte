# Preparação local

## Pré-requisitos

- Podman ou Docker com um compose que monte este repositório em `/var/www/html/projetos/horizonte`. O compose atual fica **fora** do repositório e sobe:
  - `laravel_app`: PHP 8.3-FPM com Composer e Node 20
  - `laravel_web`: nginx em `:8080`
  - `laravel_vite`: Node 20, Vite em `:5173`
  - `laravel_mysql`: MySQL 8 em `:3306`
- Node 20+ e npm na máquina local para lint, tipos e build. Os containers usam Node 20 e o CI usa Node 22.
- O host não precisa de PHP: comandos PHP rodam no container.

## Primeira execução

```bash
podman compose up -d                       # na pasta do compose
podman exec -it -w /var/www/html/projetos/horizonte laravel_app bash
cp .env.example .env && php artisan key:generate
composer install
php artisan migrate                        # só no MySQL local do container
```

Preencha no `.env` apenas o necessário para o fluxo que vai testar. Os valores ficam com quem administra cada serviço; nunca os versione nem os cole em chat.

- Banco: `DB_*` (MySQL do container).
- Painel Administrativo: `ADMIN_PATH` e `ADMIN_EMAILS`.
- Login Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
- Análise com IA: `GEMINI_API_KEY`, `GEMINI_TEXT_MODEL`, `INSIGHTS_*`.
- Arquivos em S3: `AWS_*`, `NOVIDADES_DISK`, `PRODUTOS_DISK`.

Front: `npm ci` no host. O container `laravel_vite` já roda `npm run dev`. Acesse `http://localhost:8080`.

## Verificar

| Comando | Onde | Prova | Precisa de serviço? |
|---|---|---|---|
| `composer check` | container | Pint `--test` + suíte Pest (SQLite em memória) | não |
| `npm run check` | host | ESLint, ESLint tipado, `tsc`, self-check das regras, build | não |
| fluxo no navegador | host | página carrega, console sem erro | containers no ar |

## Diagnóstico

- Log do Laravel: `storage/logs/laravel.log` (`LOG_STACK=single`). Para acompanhar ao vivo, rode `php artisan pail` no container.
- Erros do front: console do navegador. Com o Boost MCP ativo, também pelas ferramentas `browser-logs` e `last-error`.
- Logs não devem conter segredo nem dado pessoal. Para recuperar config ou cache, rode `php artisan optimize:clear` no container.

## Agentes

Leia [AGENTS.md](../AGENTS.md); [CLAUDE.md](../CLAUDE.md) importa as mesmas instruções. Ferramentas, skills e escopos configurados estão em [setup.md](setup.md).

- **Cursor:** lê `AGENTS.md`, `.cursor/rules/`, `.cursor/mcp.json` e as skills. Ao abrir o projeto, aprove os MCPs.
- **Claude Code:** lê `CLAUDE.md`, `.mcp.json`, `.claude/skills/` e `.claude/settings.json`. Ao abrir o projeto:
  1. Confie na pasta.
  2. Aprove os MCPs do `.mcp.json`.
  3. Instale os plugins que ele oferecer (Superpowers, Ponytail, Caveman), ou rode `/plugin` para revisá-los.

  Para desligar um plugin só na sua máquina, use `.claude/settings.local.json`, que não é versionado.

## Problemas conhecidos

- **Laravel Boost MCP não sobe no Cursor do host.** Causa: `.cursor/mcp.json` chama `php`, que só existe no container. Contorno e estado em [setup.md](setup.md).
- **Teste de data falha só no SQLite.** Causa: colunas `date` são gravadas como `Y-m-d 00:00:00` no SQLite. Compare via model (`->toDateString()`).
- **Teste do Extrato sem resultado.** Causa: a listagem filtra o mês atual. Fixe a data com `$this->travelTo(...)`.
