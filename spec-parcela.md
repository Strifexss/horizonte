## Problem Statement

A rotina de parcela financeira precisa de um serviço e repositório dedicados, separados da rotina de extrato, para permitir atualizações independentes de parcelas sem misturar com a criação de lançamentos financeiros completos.

## Solution

Criar `FinanceiroParcelaService`, `FinanceiroParcelaRepository` e suas interfaces, com bind no `AppServiceProvider`, e expor o método `update` no `ParcelaController`. A entidade já existe (`FinanceiroParcela`), a tabela `financeiro_parcela` está migrada e o DTO (`FinanceiroParcelaDTO`) já está definido.

## User Stories

1. Como usuário autenticado, quero atualizar uma parcela financeira, para corrigir valores, datas ou categorias associadas.
2. Como usuário autenticado, quero que a atualização de parcela use a mesma estrutura de camadas (Controller → Service → Repository) das demais rotinas do Horizonte, para manter consistência arquitetural.
3. Como usuário autenticado, quero que a atualização de parcela retorne o recurso atualizado, para confirmar a alteração imediatamente.

## Implementation Decisions

- Entidade singular `FinanceiroParcela` / tabela `financeiro_parcela`; controller, service e repository seguem o padrão existente (`ExtratoService` / `FinanceiroRepository`).
- A interface `FinanceiroParcelaServiceInterface` estende `AbstractServiceInterface`; `FinanceiroParcelaRepositoryInterface` estende `AbstractRepositoryInterface`.
- O bind das interfaces ocorre em `AppServiceProvider`, seguindo o padrão atual de `ContasService` / `CategoriaService`.
- O `update` no `ParcelaController` usa `UpdateParcelaRequest` (FormRequest com `authorize: true` e `prepareForValidation` para `usuario_id`), `FinanceiroParcelaDTO` e retorna `FinanceiroParcelaResource` em JSON.
- A rota `PUT /parcela/{id}` está registrada no grupo `auth` de `routes/web.php`, nomeada `parcela.update`.
- O DTO `FinanceiroParcelaDTO` foi ajustado para que todos os campos sejam opcionais (`?int`, `?float`, `?string`), permitindo atualizações parciais.
- O `Service` delega `update` ao `Repository`, que por sua vez usa `AbstractRepository::update` (persistência via Eloquent).

## Testing Decisions

- Testar o comportamento externo: chamada HTTP `PUT /parcela/{id}` retorna 200 com o recurso atualizado e 500 quando ocorre erro.
- Não testar detalhes internos do Eloquent; testar apenas que o controller responde corretamente e que o service/repositório estão bindados.
- Prior art: `ContasController::update` segue o mesmo padrão (FormRequest → DTO → Service → redirect/JSON).

## Out of Scope

- Criação de novas parcelas (`store`) — já existe no `ExtratoService::storeParcelas`.
- Exclusão de parcelas (`destroy`) — não solicitado.
- Frontend Inertia / React para edição de parcela — não solicitado.
- Autocomplete ou busca por parcela — não solicitado.
- Testes automatizados — não solicitados no intake.

## Further Notes

- A camada de repository (`FinanceiroParcelaRepository`) estende `AbstractRepository` e usa `FinanceiroParcela` como model. Nenhuma query customizada foi adicionada além do `update` herdado.
- A rota e os arquivos criados seguem a convenção `PT` singular/plural: `ParcelaController`, `FinanceiroParcelaService`, `FinanceiroParcelaRepository`.

---

## Atualização — refresh do extrato após update (2026-09-05)

Problem Statement: o método `update` do `ParcelaController` (redirect para `extrato.index`) não refletia a atualização na UI do modal (`ExtratoModal`), pois o submit usava `only: ['extratos', 'categoria']` com `put`/`post` — opção inválida para redirect do Inertia e prop com nome errado (`parcelas` é a prop real, não `extratos`).

Solution: remover `only` do `submitMethod` em `ExtratoModal.tsx`; o redirect do controller já força o recarregamento completo da página `extrato.index`.

Implementation Decisions:
- `ParcelaController::update` permanece com `redirect()->route('extrato.index')` (camada Controller responsiva, sem query/DB).
- `ExtratoModal.tsx` (frente): `submit` agora usa apenas `preserveState`/`preserveScroll`; `only` removido.

Testing Decisions:
- Verificar no browser que após salvar uma parcela o modal fecha e a tabela do extrato reflete a alteração.
- Nenhum teste automático adicionado (não solicitado no intake original); validação manual do fluxo.

Out of Scope: refatorar o nome da prop `parcelas` para `extratos`; criar endpoint JSON separado; testes automatizados.
