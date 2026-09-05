## Problem Statement

A tabela do extrato (`resources/js/pages/extrato/index.tsx`) possui apenas a ação de editar no dropdown de ações. O usuário precisa excluir parcelas diretamente da tabela, com confirmação via modal e feedback de loading.

## Solution

Criar o fluxo completo de exclusão: backend com método `destroy` no `ParcelaController` (delegando ao service/repository existente), rota `DELETE /parcela/{id}`, modal de confirmação `ConfirmDeleteModal` e integração no dropdown da tabela.

## User Stories

1. Como usuário autenticado, quero excluir uma parcela da tabela extrato, para remover lançamentos errados.
2. Como usuário autenticado, quero confirmar a exclusão em um modal, para evitar remoção acidental.
3. Como usuário autenticado, quero ver um loading durante a exclusão, para saber que a ação está em processamento.
4. Como usuário autenticado, quero que a página recarregue após exclusão, para refletir a mudança imediatamente.

## Implementation Decisions

- **Back (camadas)**: `ParcelaController::destroy` recebe `int $id`, delega ao `FinanceiroParcelaServiceInterface` (que por herança de `AbstractServiceInterface` já expõe `delete` via `AbstractRepository::delete`). Nenhum método novo necessário no service/repository porque `AbstractRepository::delete` já existe.
- **Route**: `Route::delete('/{id}', [ParcelaController::class, 'destroy'])->name('parcela.destroy');` no grupo `auth` de `routes/web.php`.
- **Controller**: retorna `redirect()->route('extrato.index')->with('success', ...)` ou `with('error', ...)`, igual ao padrão do `ExtratoController::destroy`.
- **Front**: componente `ConfirmDeleteModal` reutiliza `Dialog`, `Button`, `Trash2` (lucide); recebe `open`, `onOpenChange`, `title`, `description`, `onConfirm`; usa `processing` para loading no botão.
- **Table integration**: no `DropdownMenuContent` de `extrato/index.tsx`, adicionar item "Excluir" que abre `ConfirmDeleteModal`; ao confirmar, chamar `router.delete(route('parcela.destroy', { id: p.id }), { preserveState: true, preserveScroll: true, onSuccess: () => setConfirmOpen(false) })`.
- **Modal contract**: segue o mesmo padrão de `ExtratoModal` (Dialog, DialogContent, DialogHeader, DialogFooter) e respeita "Modal no mobile" de `front.md`.

## Testing Decisions

- Testar apenas o comportamento externo: `DELETE /parcela/{id}` redireciona com flash success e remove o registro; erro retorna flash error.
- Prior art: `ExtratoController::destroy` e `ContasController::destroy`.
- Não adicionar testes automatizados (não solicitado no intake); validar manualmente o fluxo de UI.

## Out of Scope

- Exclusão em massa; exclusão via API JSON; testes automatizados; refatoração do nome da prop `parcelas`; criação de nova entidade.

## Further Notes

- A exclusão usa `router.delete` do Inertia; não há necessidade de `useForm` para delete simples.
- O componente `ConfirmDeleteModal` deve ser criado em `resources/js/components/extrato/ConfirmDeleteModal.tsx`.
- Nenhuma alteração no DTO ou FormRequest é necessária, pois a exclusão não valida payload.
