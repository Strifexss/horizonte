# Front da rotina

Três níveis. A page **orquestra**; markup de domínio vive no nível certo.

## Níveis

| Nível | Pasta | Quando |
|---|---|---|
| `ui` | `resources/js/components/ui/` | Primitivo: Button, Dialog, Card, Input, Label… |
| `padrões` | `resources/js/components/padrões/` | Vale para **todas** as telas: `PageTitle`, `KpisPanel`, `KpiCard`, `TableWithFilters` (barrel em `index.ts`). |
| domínio | `resources/js/components/{plural}/` | Só desta rotina. Nomes PT: `{Plural}Form`, `{Plural}Card`, `{Plural}Empty`, `{Plural}Skeleton`. |
| page | `resources/js/pages/{plural}/index.tsx` | Layout, `Head`, título, `Deferred`, estado e wiring dos forms. |

Promova a `padrões` quando a **segunda** tela precisar do mesmo bloco. Até lá, fica no domínio.

`ui` e `padrões` se reutilizam. O domínio importa `ui`/`padrões`; a page importa domínio + `padrões` de casca (`PageTitle`).

## Page-alvo

```tsx
<AppLayout breadcrumbs={breadcrumbs}>
    <Head title="…" />
    <PageTitle title="…" subtitle="…" actions={<AbrirCreate />} />
    <Deferred data="{plural}" fallback={<PluralSkeleton />}>
        {itens?.length ? itens.map(item => (
            <PluralCard key={item.id} item={item} onEdit={…} onDelete={…} />
        )) : (
            <PluralEmpty onAdd={…} />
        )}
    </Deferred>
    <PluralForm mode="create" … />
    <PluralForm mode="edit" … />
    {/* confirm de exclusão: diálogo no domínio ou no Form */}
</AppLayout>
```

Tipos TS = campos do DTO (`nome`, `descricao`, …), não aliases em inglês.

`useForm` + `route('{plural}.*')`. Método do form = verbo da rota (`put` se a rota é `PUT`).

Controller: `Inertia::defer` no `index`. Skeleton no `fallback` do `<Deferred>`.

## Contas: o que ler e o que deixar

Ler PHP em [camadas.md](camadas.md). Na page atual de contas, o alvo acima é a forma correta.

`AccountsEmpty` / `AccountsSkeleton` existem; rotina nova usa nomes PT. Dialogs e cards embutidos na page, tipo `Account` com `name`/`balance`, e `patch()` numa rota `PUT` são o desvio — a rotina nova segue o alvo e o verbo da rota.

## Modal no mobile

Contrato da rotina: **folha em tela cheia** abaixo de `md` (768px); **card central** a partir de `md`. Referência: `resources/js/components/categorias/CategoriasModal.tsx`.

### Casca (`DialogContent`)

Passe no `className` do modal de domínio (o `ui/dialog` já centra com `fixed` + `translate` e cobre overlay):

```tsx
<DialogContent className="w-[100vw] h-[100vh] md:w-[700px] md:max-w-full md:h-auto overflow-hidden">
```

- Mobile: `100vw` × `100vh`, `overflow-hidden` (rola só o bloco interno).
- Desktop: `md:w-[700px] md:h-auto`.
- Inclua `md:max-w-full` para o `max-w-lg` default do `DialogContent` não capar a largura.

Corpo: `flex flex-col h-full`. Filhos do `DialogContent` em **uma coluna** (`grid`/`flex-col` + `gap-4`): header → abas/filtros → form → ações → lista.

### O que empilha vs o que fica em linha

| Bloco | Mobile | Como |
|---|---|---|
| `DialogHeader` | coluna, título centralizado | default do `ui` (`text-center sm:text-left`) |
| Campos do form | um abaixo do outro | `grid gap-2` |
| Abas (Receita/Despesa) | **lado a lado** | `flex gap-2` |
| Footer do form (Cancelar + submit) | **lado a lado**, cada um `w-full` | `DialogFooter className="flex flex-row gap-2"` — anula o `flex-col-reverse` do `ui` |
| Linha da lista (nome + ações) | **lado a lado** | `flex justify-between` |
| Confirm de exclusão (2º `Dialog`) | footer empilhado invertido | deixe o default do `DialogFooter` |

O X de fechar fica `absolute` no `ui`; não entra no fluxo.

### Lista

`overflow-y-auto` com `min-h-[200px] max-h-[340px]`. Header, abas e form ficam fixos; só a lista rola.

### Confirm aninhado

Segundo `Dialog` **sem** as classes de tela cheia. Footer sem `flex-row`.

Done: mobile = viewport cheio; eixo principal coluna; abas, botões do form e ações da linha em `row`; lista com scroll próprio.
