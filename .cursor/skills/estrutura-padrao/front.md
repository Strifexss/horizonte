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

## Skills

Inertia: `inertia-react-development`. Tailwind: `tailwindcss-development`.
