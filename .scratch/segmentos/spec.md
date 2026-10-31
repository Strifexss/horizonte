# MVP2 — Segmentos e módulos

Status: ready-for-agent
Branch: `feature`
Antes: `.scratch/login-social-empresa/spec.md` (MVP1) e `docs/adr/0001-dados-pertencem-a-empresa.md`

## Objetivo

Cada Empresa pertence a um **Segmento** (o ramo do negócio), que define quais **Módulos** ela tem. O Administrador monta os Segmentos e ajusta cada Empresa, ligando ou desligando módulos.

## Fora do escopo

Preço, trial, validade, bloqueio e pagamento (MVP3 — a venda será de Segmentos e Módulos). Convites e várias Empresas por conta.

## Termos

- **Módulo**: pedaço do sistema, com chave estável e catálogo fixo no código.
  - **Obrigatórios** (sempre presentes, só informativos no admin): Financeiro/Extrato, Contas, Categorias, Formas de pagamento, Produtos, Grupos, Fornecedores, Funcionários, Vendas, Dashboard.
  - **Opcionais**: `menu_board` (Menu Board, pareamento e TV) e `copiloto` (Insights de IA no Dashboard: geração, ações e job).
- **Segmento**: cadastrado pelo Administrador — chave, nome, descrição, ativo e quais módulos opcionais inclui.
- **Ajuste da Empresa**: exceção por módulo opcional feita pelo Administrador — *ligar* ou *desligar*, valendo por cima do Segmento.

> "Módulo" do MVP1 (`empresas.modulo` = varejo/restaurante) deixa de existir: vira `empresas.segmento_id`. "Produto" segue sendo o item que a Empresa vende.

## Regra de acesso

`empresa->podeUsar(chave)`:
1. Módulo obrigatório → sempre verdadeiro.
2. Ajuste da Empresa para o módulo, se houver → vale ele.
3. Senão → verdadeiro se o Segmento da Empresa inclui o módulo.

Único ponto de decisão (menu, rotas, TV, Dashboard, job). Compartilhado no Inertia como `empresa.modulos` (chaves disponíveis) e `empresa.segmento` (nome).

## Dados

- `segmentos`: chave única, nome, descrição, ativo.
- `segmento_modulo`: segmento_id + chave do módulo opcional.
- `empresas.segmento_id`: FK obrigatória (exatamente um Segmento por Empresa), substitui `empresas.modulo`.
- `empresa_modulo`: empresa_id + chave + `ligado` (bool), único — os ajustes.

## Segmentos iniciais (migration)

| Chave | Nome | Módulos opcionais |
|---|---|---|
| `varejo` | Varejo | `copiloto` |
| `restaurante` | Restaurante | `menu_board`, `copiloto` |

## Empresas existentes e novas

- **Clientes antigos**: todos vão para **Varejo** (ficam com Copiloto). Quem usa Menu Board perde o acesso até o Administrador trocar para Restaurante ou ligar `menu_board` na Empresa; os dados ficam guardados.
- **Onboarding**: passo 2 lista os Segmentos ativos (nome e descrição); o escolhido vira o `segmento_id`.
- **Empresa criada pelo Administrador**: Varejo.

## Módulo indisponível

- Some do menu; rotas respondem 404.
- TV pareada mostra "Menu Board indisponível" (não desconecta); pareamento por PIN recusado.
- Copiloto: card some do Dashboard, geração e ações respondem 404, job na fila marca a análise como falha sem chamar a IA.
- Nenhum dado é apagado.

## Painel Administrativo

1. **Segmentos**: listar; criar; editar nome, descrição, ativo e interruptores dos módulos opcionais. Módulos obrigatórios listados como "sempre incluído", só leitura. Desativar só tira do onboarding. Não exclui Segmento com Empresas.
2. **Empresas**: listar com admin master (selo Senha/Google), Segmento e módulos ativos; busca por nome/e-mail; filtro por Segmento; cards no mobile. Por Empresa: trocar Segmento; ajustar cada módulo opcional (herdar / ligar / desligar) mostrando o resultado final; "Entrar como" no admin master.

## Tickets

1. `issues/01-segmentos-e-modulos.md`
2. `issues/02-empresas-no-segmento.md`
3. `issues/03-pode-usar.md`
4. `issues/04-modulo-menu-board.md`
5. `issues/05-modulo-copiloto.md`
6. `issues/06-onboarding-segmentos.md`
7. `issues/07-admin-segmentos.md`
8. `issues/08-admin-empresas.md`
9. `issues/09-glossario-e-adr.md`
