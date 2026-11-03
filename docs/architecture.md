# Código e arquitetura

## Stack observada

Versões do lockfile em 2026-11-02:

- PHP 8.3 (container), Laravel 12.68, Inertia Laravel 2.0, Ziggy 2.6, Socialite 5.31 (Google), `laravel/ai` 0.11 (Gemini), DomPDF 3.1 (PDF do Extrato), Flysystem S3. Spatie Laravel PDF 2.13, Browsershot 5.4 e Puppeteer estão instalados, mas sem uso no código.
- React 19.0, `@inertiajs/react` 2.0, TypeScript 5.7 (strict), Vite 6.1, Tailwind 4.0, componentes shadcn/ui (base Radix), lucide.
- Dev/test: Pest 3.8, Pint 1.30, Laravel Boost 2.7, ESLint 9 + typescript-eslint 8, Prettier 3.
- Gerenciadores: Composer (`composer.lock`) e npm (`package-lock.json`).

## Mapa do código

```text
app/
├── Http/Controllers/      recebe request, devolve Inertia/redirect/flash
├── Http/Requests/         FormRequests (validação, *SearchRequest para filtros)
├── Http/Resources/        formato de saída para o front
├── Http/Middleware/       empresa, modulo, administrador, Inertia
├── DTO/                   payloads e filtros normalizados
├── Services/ (+Interfaces)       regra de negócio e transações
├── Repositories/ (+Interfaces)   único acesso a banco/Eloquent
├── Models/                Eloquent; trait PertenceAEmpresa preenche empresa_id
├── Ai/Agents/, Jobs/      análise do Dashboard (laravel/ai)
└── Providers/AppServiceProvider.php   bind Interface → implementação
resources/js/
├── pages/                 uma page Inertia por rota (orquestra)
├── components/<dominio>/  formulários, tabelas, modais por domínio (nomes em PT)
├── components/padrões/    blocos reutilizáveis; components/ui/ shadcn + AsyncSelect/MoneyInput
├── hooks/, layouts/, lib/, types/
resources/ajuda/           ajuda de uso, um .md por tela do menu (lida pelo Copiloto)
routes/web.php             grupos auth → empresa → módulo/administrador
tests/Feature/             testes Pest de rotas e regras
```

## Fronteiras e fluxo

Controller → FormRequest/DTO → Service → Repository → Model. O detalhe e o checklist estão na skill `estrutura-padrao` (`.cursor/skills/estrutura-padrao/`), que é a fonte canônica das camadas e do front. Query fora do repository conta como passo incompleto.

Acesso: middleware `auth`, depois `empresa` (sem Empresa, manda para o onboarding), `modulo:<funcionalidade>` (`Empresa::podeUsar`) e `administrador` (Painel Administrativo, 404 para os demais). Status de assinatura ainda não existe (ADR 0001). Os dados são isolados por `empresa_id` nos repositórios (ADR 0001).

## Dados e migrations

- Desenvolvimento: MySQL 8 no container `laravel_mysql`. Testes: SQLite em memória (`phpunit.xml`). Diferenças entre os dois (ex.: colunas `date` guardadas com hora no SQLite) aparecem em asserts de data. Compare datas pelo model, não pela string crua.
- 54 migrations em `database/migrations/`. Aplicar migrations em banco compartilhado ou de produção exige autorização explícita.
- Serviços externos: Google OAuth, Gemini (`GEMINI_API_KEY`), S3 (discos `NOVIDADES_DISK`/`PRODUTOS_DISK`). O PDF é gerado no servidor com DomPDF, sem navegador.

## Decisões

- [ADR 0001 — dados pertencem à Empresa](adr/0001-dados-pertencem-a-empresa.md).
- Specs antigas soltas na raiz (`spec-*.md`) são históricas; specs novas vão em `.scratch/<feature>/`.

## Manutenção

Atualize este mapa quando diretórios, dependências relevantes, contratos ou fronteiras mudarem.
