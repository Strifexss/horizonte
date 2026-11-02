# Horizonte

ERP financeiro para pequenos negócios: vendas, extrato, cadastros, dashboard e Menu Board, sempre dentro de uma Empresa. Escopo em [PRODUCT.md](PRODUCT.md).

## Rodar

O app roda em containers (PHP 8.3-FPM, nginx, Vite e MySQL 8) definidos fora deste repositório. Passo a passo, variáveis e verificação em [docs/onboarding.md](docs/onboarding.md).

```bash
# dentro do container PHP, na raiz do projeto
composer install && php artisan migrate
composer check        # Pint --test + testes

# na máquina local (Node 20+)
npm ci
npm run dev           # Vite
npm run check         # ESLint, ESLint tipado, tsc, self-check das regras e build
```

## Documentação

- [Produto e escopo](PRODUCT.md) e [glossário](CONTEXT.md)
- [Preparação local](docs/onboarding.md)
- [Estrutura e decisões técnicas](docs/architecture.md) e [ADRs](docs/adr/)
- [Design e acessibilidade](docs/design.md)
- [Checks e revisão](docs/quality.md)
- [Instruções para agentes](AGENTS.md)
- [Setup, ferramentas e evidências](docs/setup.md)
