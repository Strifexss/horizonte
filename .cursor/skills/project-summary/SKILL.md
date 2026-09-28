---
name: project-summary
description: Analisa a codebase e gera um resumo executivo e técnico do projeto, cobrindo stack, arquitetura de diretórios, dependências e instruções de setup. Use quando o usuário solicitar "resumo do projeto", "visão geral do repositório", "onboarding" ou `@codebase resumo`.
---

# Skill: Gerador de Resumo de Projeto

## Objetivo
Analisar a estrutura, dependências e código-fonte do repositório para criar um documento de resumo técnico e executivo claro, padronizado e focado na arquitetura.

## Quando Utilizar
- Ao iniciar em um repositório existente.
- Para gerar documentação de onboarding de novos desenvolvedores.
- Sempre que o usuário solicitar "resumo do projeto", "visão geral do repositório" ou usar `@codebase resumo`.

## Instruções de Análise (Etapa por Etapa)
1. **Mapeamento da Stack:**
 - Inspecione arquivos de manifesto (`package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `pom.xml`, `docker-compose.yml`, etc.).
 - Identifique a linguagem principal, frameworks, ORM/banco de dados e bibliotecas essenciais.
2. **Análise de Estrutura:**
 - Avalie o diretório raiz e diretórios de código-fonte (`src/`, `app/`, `packages/`, etc.).
 - Identifique o padrão de arquitetura utilizado (Modular, Monorepo, Clean Architecture, MVC, etc.).
3. **Mapeamento de Funcionalidades:**
 - Analise rotas, controladores, serviços ou componentes para mapear os fluxos principais da aplicação.
4. **Instruções de Setup:**
 - Verifique scripts de execução, gerenciador de pacotes e arquivos de ambiente (`.env.example`).

---

## Formato de Saída Obrigatório

Gere o resultado rigorosamente na seguinte estrutura Markdown:

# 🚀 Resumo do Projeto: [Nome do Projeto]

## 📌 Visão Geral
> [Descreva em 2 a 3 frases o propósito central da aplicação e qual problema ela resolve.]

---

## 🛠️ Tech Stack & Dependências Principais
- **Linguagem:** [ex: TypeScript / Python]
- **Framework Principal:** [ex: Next.js (App Router) / NestJS / FastAPI]
- **Estilização & UI:** [ex: Tailwind CSS, Shadcn UI]
- **Banco de Dados & ORM:** [ex: PostgreSQL, Prisma]
- **Gerenciamento de Estado / API:** [ex: TanStack Query, Zustand]
- **Testes & Qualidade:** [ex: Vitest, Playwright]
- **Infra / Deploy:** [ex: Docker, Vercel]

---

## 📂 Arquitetura de Diretórios
```text
.
├── src/
│ ├── app/ # [Breve explicação do papel da pasta]
│ ├── components/ # [Breve explicação do papel da pasta]
│ ├── services/ # [Breve explicação do papel da pasta]
│ └── lib/ # [Breve explicação do papel da pasta]
```