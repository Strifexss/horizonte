# 03 — Todo fluxo passa a filtrar por Empresa

Status: resolved
Blocked by: 02

Nenhuma leitura, escrita, unicidade ou posse pode continuar usando `usuario_id` / `Auth::id()` como dono. Ao gravar, preencher `empresa_id` (Empresa ativa) e `usuario_id` (autor).

## Inventário (levantado em 30/10/2026)

**Base**
- `app/Repositories/AbstractRepository.php`: `index()` e `autocomplete()` filtram por `usuario_id` via `Schema::hasColumn`; o autocomplete inclui padrões (`usuario_id` nulo) → trocar para `empresa_id` (padrões: `empresa_id` nulo).

**Repositórios** (`app/Repositories/`): `Categoria`, `Conta`, `DashboardAnalise`, `FinanceiroParcela`, `Financeiro` (10 pontos: listagem, Extrato, saldos e somas do Dashboard), `FormaPagamento`, `Fornecedor` (+ interface), `Funcionario`, `Grupo`, `InsightAcao` (+ interface), `MenuBoard` (ativo na TV), `Novidade` (**mantém** usuário na dispensa), `Produto` (10 pontos: listagem, ativos, contagens, foto), `TvDispositivo`, `TvPareamentoPin`, `Venda`.

**Form Requests** (unicidade e `exists` com escopo): `FinanceiroRequest`, `StoreCategoriaRequest`, `StoreContaRequest`, `StoreFormaPagamentoRequest`, `StoreFornecedorRequest`, `StoreFuncionarioRequest`, `StoreGrupoRequest`, `StoreMenuBoardRequest`, `StoreProdutoRequest`, `StoreVendaRequest`, `UpdateParcelaRequest`.

**DTOs** (`app/DTO/`): `Categoria`, `Conta`, `Financeiro`, `FinanceiroParcela`, `FormaPagamento`, `Fornecedor`, `Funcionario`, `Grupo`, `MenuBoard`, `Produto`, `Venda` → carregar `empresa_id`.

**Serviços**
- `ContasService`: conta padrão única por Empresa.
- `CategoriaService`, `FormasPagamentoService`: padrões continuam somente leitura.
- `VendasService`: fechamento usa conta padrão da Empresa; receitas nascem na Empresa.
- `ExtratoService`, `ProdutosService` (foto em `produtos/{empresa_id}`; fotos existentes continuam válidas pelo caminho gravado), `MenuBoardsService` (`findAtivoDoUsuario` → por Empresa).
- `DashboardInsightsService` + job `GerarAnaliseDashboard`: análise e ações de insight por Empresa.
- `TvPareamentoService` + `TvController`: TV pareada à Empresa; exibe o Menu Board ativo da Empresa.
- `UsuariosTransferService`: transfere entre as Empresas dos usuários de origem e destino.

**Checagens de posse**: qualquer `where id = ? and usuario_id = ?` (editar, excluir, baixar parcela, PDF do Extrato) passa a comparar `empresa_id`.

## Pronto quando
- Os testes de Feature existentes passam ajustados para Empresa.
- Novo teste de isolamento: usuário da Empresa A não vê, não edita e não exclui dados da Empresa B (pelo menos Extrato, Produto, Venda, Menu Board/TV e Dashboard).
- Teste: padrões do sistema seguem visíveis e somente leitura.
- `grep -rn "usuario_id" app` só mostra gravação de autor e `novidade_dispensada`.
