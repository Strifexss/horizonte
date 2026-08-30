---
name: estrutura-padrao
description: >-
  Aplica a estrutura padrão de uma rotina Horizonte: Controller recebe e responde,
  Service aplica regra de negócio, Repository é o único acesso a banco e query;
  interfaces no AppServiceProvider; page Inertia fatiada (padrões + domínio).
  Use when creating or changing a rotina, CRUD, recurso, entidade, feature page,
  controller, service, repository, DTO, FormRequest, or Inertia list/form screen.
---

# Estrutura padrão

Toda feature do app é uma **rotina**. O corte das **camadas** é o teste de cada diff, não uma dica.

## Camadas

Classifique cada trecho novo neste corte. Query no service ou no controller = passo incompleto.

**Controller — receber/responder.** Entra request, sai Inertia, redirect ou flash. FormRequest valida, DTO carrega o payload, service executa, controller devolve. Model, `DB::`, query, `Schema` e regra de domínio ficam fora.

**Service — regra.** Cálculo, invariante e decisão. Chama o repository. Eloquent, SQL e `$request` / `Inertia` / `redirect` ficam fora.

**Repository — banco.** Toda query, persistência, `findOrFail`, filtro, join, `Schema` e Eloquent. Redirect, flash e FormRequest ficam fora.

**Provider** só `bind(Interface, Concreto)` do service e do repository.

Mapa PHP, binds e o que ler em contas: [camadas.md](camadas.md). Front em três níveis e page-alvo: [front.md](front.md).

## Passos

### 1. Classificar

Uma destas: **nova** | **estender** | **ajuste pontual**.

Done: uma etiqueta, sem misturar caminhos.

### 2. Intake

**Nova** — pergunte e espere resposta antes de gerar arquivo:

- entidade (singular/plural em PT)
- campos e tipos
- verbos (`index`, `store`, `update`, `destroy`)
- escopo por `usuario_id`?
- testes?
- item no sidebar?

Factory e seeder ficam de fora.

**Estender / ajuste** — diga qual camada recebe o trecho e por quê (receber/responder, regra ou banco).

Done: intake completo, ou camada alvo nomeada.

### 3. Back

Leia [camadas.md](camadas.md). Aplique `laravel-best-practices` no PHP.

- `php artisan make:` Model, Migration, FormRequest, Controller (`--no-interaction`).
- Interfaces + Service + Repository à mão, estendendo os abstracts.
- Bind das duas pontas em `AppServiceProvider`.
- Rotas nomeadas no grupo `auth` de `routes/web.php`.
- Query nova → método no repository.

Nomes: model/tabela **singular** (`Conta` / `conta`); controller, service, rota e página **plural** (`Contas`). Um FormRequest cobre create e update.

Done: controller sem Model/`DB`/query; service sem Eloquent/SQL; repository é o único arquivo da rotina com persistência; cada interface tem bind.

### 4. Front

Leia [front.md](front.md). Aplique `inertia-react-development`. Com Tailwind, `tailwindcss-development`.

Page orquestra. Domínio em `resources/js/components/{plural}/` com nomes PT (`ContasForm`, `ContasCard`, `ContasEmpty`, `ContasSkeleton`). Reuse `padrões` e `ui`. `Inertia::defer` + `<Deferred>` + skeleton. `useForm` usa o **mesmo método da rota**.

#### Lazy props (carregamento sob demanda)

Quando uma prop for pesada ou desnecessária na carga inicial da página (listas de referência, coleções grandes, relacionamentos), prefira Inertia lazy props em vez de requisições AJAX manuais.

- Backend (Controller): exponha a prop com `Inertia::lazy(fn () => /* consulta */)` ao renderizar a página. Exemplo:

```php
use Inertia\Inertia;
use App\Models\Categoria;

return Inertia::render('extrato/index', [
    'categorias' => Inertia::lazy(fn () => Categoria::where('usuario_id', auth()->id())->get()),
]);
```

- Frontend (Page / Component): não faça `fetch`/axios manual para essas props.
  - Leia com `usePage()` (ou receba via props).
  - Ao abrir a UI que precisa do dado (ex.: modal), chame `router.reload({ only: ['categorias'] })`.
  - Controle loading com `onStart` / `onFinish` / `onError`.
  - Após operações mutantes (store/update/destroy), recarregue a prop com `router.reload({ only: ['categorias'] })`.

Exemplo (resumido):

```tsx
import { usePage, router } from '@inertiajs/react';

const page = usePage<any>();
const categorias = page.props.categorias;

function openModal() {
  router.reload({ only: ['categorias'], onStart: () => setLoading(true), onFinish: () => setLoading(false) });
}
```

Observações:
- `Inertia::lazy` é ideal para dados carregados sob demanda. Use `Inertia::defer` / `<Deferred>` quando quiser renderizar imediatamente com fallback UI e carregar depois.
- Mantenha endpoints JSON apenas para APIs externas; prefira o fluxo Inertia para páginas internas.
- Teste: abrir modal (carrega prop), adicionar/editar/excluir (chamar reload na onSuccess).

Sidebar só se o intake pediu.

Done: page sem markup de form/card/empty/skeleton (só importa); tipos TS = campos do DTO; método HTTP do form = rota.

### 5. Fechar

PHP dirty: `vendor/bin/pint --dirty --format agent`.

Testes só se o intake pediu → `testing-best-practices`, depois o recorte `php artisan test --compact`.

UI nova: verificar no browser o fluxo pedido.

Done: pint limpo; testes pedidos verdes; fluxo de UI exercitado quando houve page.
