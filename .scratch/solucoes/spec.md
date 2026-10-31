# MVP2 — Soluções e funcionalidades

Status: ready-for-agent
Branch: `feature`
Antes: `.scratch/login-social-empresa/spec.md` (MVP1) e `docs/adr/0001-dados-pertencem-a-empresa.md`

## Objetivo

Trocar o "módulo" do MVP1 por **Soluções**: o que cada Empresa tem. O Administrador monta as Soluções (presets) e ajusta cada Empresa, ligando ou desligando funcionalidades.

## Fora do escopo

Preço, trial, validade, bloqueio e pagamento (MVP3). Convites e várias Empresas por conta.

## Conceitos

- **Núcleo**: sempre disponível em toda Empresa, sem configuração — Financeiro/Extrato, Contas, Categorias, Formas de pagamento, Produtos, Grupos, Fornecedores, Funcionários, Vendas, Dashboard (sem o Copiloto), Configurações e Novidades.
- **Funcionalidade**: catálogo fixo no código, com chave estável. Começa com:
  - `menu_board` — Menu Board, pareamento e exibição na TV.
  - `copiloto` — Insights de IA no Dashboard (geração, ações e o job).
- **Solução**: cadastrada pelo Administrador. Campos: chave, nome, descrição, tipo, funcionalidades incluídas, ativa, e (só complemento) "incluir no cadastro".
  - **Base**: a Empresa tem exatamente uma.
  - **Complemento**: só junto com uma base; zero ou vários.
- **Ajuste da Empresa**: exceção por funcionalidade feita pelo Administrador — *ligar* ou *desligar*, valendo por cima das Soluções.

## Regra de acesso

`empresa->podeUsar(chave)`:
1. Ajuste da Empresa para a funcionalidade, se houver → vale ele.
2. Senão → verdadeiro se alguma Solução da Empresa inclui a funcionalidade.

É o único ponto de decisão (menu, rotas, TV, Dashboard, jobs). Resultado compartilhado no Inertia como `empresa.funcionalidades` (lista de chaves disponíveis).

## Soluções iniciais (migration)

| Chave | Tipo | Funcionalidades | Incluir no cadastro |
|---|---|---|---|
| `varejo` | base | — | — |
| `restaurante` | base | `menu_board` | — |
| `copiloto` | complemento | `copiloto` | sim |

## Empresas existentes e novas

- **Clientes antigos**: todos recebem **Varejo + Copiloto** (o Copiloto já existe para todos hoje). Quem usa Menu Board perde o acesso até o Administrador trocar a base para Restaurante ou ligar `menu_board` na Empresa; os dados do Menu Board ficam guardados.
- **Empresa nova (onboarding)**: passo 2 lista as Soluções **base ativas**; a escolhida é atribuída, mais todo complemento ativo com "incluir no cadastro".
- A coluna `empresas.modulo` (MVP1) é substituída por `empresa_solucao` e removida.

## Funcionalidade indisponível

- Some do menu; rotas respondem 404.
- TV pareada mostra "Menu Board indisponível" (não desconecta).
- Copiloto: card some do Dashboard, geração bloqueada, job na fila termina sem chamar a IA (marca a análise como falha).
- Nenhum dado é apagado.

## Painel Administrativo

1. **Soluções**: listar; criar; editar nome, descrição, tipo, ativa, funcionalidades (interruptores do catálogo) e "incluir no cadastro". Núcleo aparece como "incluído em toda base", só leitura. Desativar só tira do onboarding; não mexe em quem já tem. Não exclui Solução em uso.
2. **Empresas**: listar com admin master, base e complementos; busca e filtro por Solução. Por Empresa: trocar base, adicionar/remover complemento, ajustar funcionalidades (herdar / ligar / desligar, mostrando o resultado final), "Entrar como" no admin master.

## Tickets

1. `issues/01-solucoes-e-catalogo.md`
2. `issues/02-migracao-empresas.md`
3. `issues/03-pode-usar.md`
4. `issues/04-bloqueio-menu-board.md`
5. `issues/05-bloqueio-copiloto.md`
6. `issues/06-onboarding-solucoes.md`
7. `issues/07-admin-solucoes.md`
8. `issues/08-admin-empresas.md`
9. `issues/09-glossario-e-adr.md`
