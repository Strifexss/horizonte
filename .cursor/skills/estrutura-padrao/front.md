# Front da rotina

Três níveis. A page **orquestra**; markup de domínio vive no nível certo.

## Níveis

| Nível | Pasta | Quando |
|---|---|---|
| `ui` | `resources/js/components/ui/` | Primitivo: Button, Dialog, Card, Input, Label… |
| `padrões` | `resources/js/components/padrões/` | Vale para **todas** as telas: `PageTitle`, `KpisPanel`, `KpiCard`, `TableWithFilters`, `TablePagination`, `MobileCardList`, `MobileFab`, `MobileFilterDock`, `FiltroPeriodoDatas` (barrel em `index.ts`). |
| domínio | `resources/js/components/{plural}/` | Só desta rotina. Nomes PT: `{Plural}Form`, `{Plural}Card`, `{Plural}Empty`, `{Plural}Skeleton`. |
| page | `resources/js/pages/{plural}/index.tsx` | Layout, `Head`, título, `Deferred`, estado e wiring dos forms. |

Promova a `padrões` quando a **segunda** tela precisar do mesmo bloco. Até lá, fica no domínio.

`ui` e `padrões` se reutilizam. O domínio importa `ui`/`padrões`; a page importa domínio + `padrões` de casca (`PageTitle`).

## Page-alvo

Referência viva: `pages/extrato/index.tsx` (completa) e `pages/vendas/index.tsx` (rotina enxuta).

```tsx
<AppLayout breadcrumbs={breadcrumbs}>
    <Head title="…" />
    <div className="flex h-full w-full max-w-full min-w-0 flex-1 flex-col gap-2 overflow-x-hidden rounded-xl p-4 pb-28 md:gap-4 md:pb-4">
        <PageTitle title="…" mobileTitle="…" subtitle="…" actions={<Button className="hidden md:inline-flex">…</Button>} />
        <MobileFab actions={[/* mesmas ações do PageTitle */]} />
        <PluralFilters />                     {/* MobileFilterDock + card de filtros `hidden md:block` */}
        <Deferred data="{plural}" fallback={<PluralTable loaded={false} … />}>
            <PluralTable loaded items={…} meta={…} … />   {/* TableWithFilters */}
        </Deferred>
        <PluralForm … />
        <ConfirmDeleteModal … />
    </div>
</AppLayout>
```

Tipos TS = campos do DTO (`nome`, `descricao`, …), não aliases em inglês.

`useForm` + `route('{plural}.*')`. Método do form = verbo da rota (`put` se a rota é `PUT`).

Controller: `Inertia::defer` no `index`. Skeleton no `fallback` do `<Deferred>`.

## Contas: o que ler e o que deixar

Ler PHP em [camadas.md](camadas.md). Na page atual de contas, o alvo acima é a forma correta.

`AccountsEmpty` / `AccountsSkeleton` existem; rotina nova usa nomes PT. Dialogs e cards embutidos na page, tipo `Account` com `name`/`balance`, e `patch()` numa rota `PUT` são o desvio — a rotina nova segue o alvo e o verbo da rota.

## Listagem

Toda listagem usa `TableWithFilters` no padrão do Extrato: **tabela no desktop, cards no mobile**. O domínio só declara colunas e encaixes, em `{Plural}Table`.

- `columns: Column<Item>[]` com `label` em caixa alta, `thClassName` (largura/alinhamento, vale também para o `td`), `render` e `sortable` quando o backend ordena por aquela coluna.
- Encaixes: `toolbar` (busca, abas de status), `mobile` (o `MobileCardList`), `empty` (`{Plural}Empty`), `sort`, `pagination` (props do `TablePagination`, com `itemLabel` no plural), `onRowClick` quando a linha abre o item.
- Carregando: `loaded={false}` mostra o skeleton padrão. O `fallback` do `<Deferred>` é a própria `{Plural}Table` com `loaded={false}`.
- Ações da linha no desktop: coluna `AÇÃO` com menu `MoreHorizontal` (Editar, Excluir…).

## Mobile da page

Contrato da rotina abaixo de `md`. Referência viva: Extrato e Vendas (com filtros); Produtos e Formas de pagamento (sem filtros).

| Bloco | Mobile | Componente |
|---|---|---|
| Título | `mobileTitle` curto; subtítulo some sozinho | `PageTitle` |
| Ações da page | bolha `+` fixa no canto, abre a pilha de ações | `MobileFab` (botões do `PageTitle` ficam `hidden md:inline-flex`) |
| Filtros | barra fixa no rodapé: setas de mês + período + botão **Filtros** com contador; a folha de baixo traz os mesmos campos do desktop | `MobileFilterDock` com `{Plural}FilterFields` como filho; o card de filtros do desktop fica `hidden md:block` |
| Lista | cards; **toque** abre o item, **segurar 1s** revela a faixa de ações (ação destrutiva com `destructive`) | `MobileCardList` no encaixe `mobile` da `TableWithFilters` |
| Container | `pb-28 md:pb-4` para a barra de filtros e a bolha não cobrirem o último card | page |

Barra de filtros só existe quando a rotina tem filtros além da busca (período, status, selects). Busca sozinha fica na `toolbar` da `TableWithFilters`, que aparece no mobile também; rotina sem filtro nenhum não tem barra. Bolha e cards valem para toda rotina com listagem.

`{Plural}Filters` guarda o rascunho dos valores e renderiza os dois lados (dock e card), aplicando via `visit{Plural}`. Os campos vivem uma vez só em `{Plural}FilterFields` (prop `idPrefix` para não repetir ids).

## Modal no mobile

Contrato da rotina: **folha em tela cheia** abaixo de `md` (768px); **card central** a partir de `md`. Referência: `resources/js/components/categorias/CategoriasModal.tsx`.

### Casca (`DialogContent`)

O `DialogContent` de `ui/dialog` é um **card de altura automática** (`max-h-[100dvh]`, sem `h-*`). **Nunca** coloque altura de tela cheia (`h-[100dvh]`/`h-[100vh]`) no componente base: todo `Dialog` sem `className` (confirms, `delete-user`) herdaria a altura da tela. Tela cheia é opt-in, por modal.

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
| Confirm de exclusão (2º `Dialog`) | card compacto, footer empilhado invertido | `<DialogContent>` sem classes de altura; deixe o default do `DialogFooter` |

O X de fechar fica `absolute` no `ui`; não entra no fluxo.

### Lista

`overflow-y-auto` com `min-h-[200px] max-h-[340px]`. Header, abas e form ficam fixos; só a lista rola.

### Confirm aninhado

Segundo `Dialog` **sem** as classes de tela cheia. Footer sem `flex-row`.

Done (modal): mobile = viewport cheio; eixo principal coluna; abas, botões do form e ações da linha em `row`; lista com scroll próprio.

Done (page): listagem em `TableWithFilters` com `mobile` em `MobileCardList`; ações da page no `MobileFab`; filtros no `MobileFilterDock` + card `hidden md:block`; container com `pb-28 md:pb-4`.
