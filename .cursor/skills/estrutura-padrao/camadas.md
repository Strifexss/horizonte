# Camadas (PHP)

Corte: **receber/responder** | **regra** | **banco**. O `SKILL.md` manda; aqui está o mapa.

## Onde cada coisa mora

| Peça | Papel |
|---|---|
| `*Controller` | Recebe request, responde Inertia/redirect/flash. Injeta `*ServiceInterface`. |
| `Store*Request` | Autoriza e valida. Um request para create e update. |
| `*DTO` | Payload tipado (`fromArray` / `all`). Controller monta; repository consome. |
| `*Service` + `*ServiceInterface` | Regra. Estende `ServiceAbstract`, implementa a interface vazia que estende `AbstractServiceInterface`. |
| `*Repository` + `*RepositoryInterface` | Banco. Estende `AbstractRepository`, implementa a interface vazia que estende `AbstractRepositoryInterface`. |
| `AppServiceProvider::register` | `bind(ServiceInterface, Service)` e `bind(RepositoryInterface, Repository)`. |
| `*AbstractController` | Vazio, marca o tipo de controller composto (ex: `FinanceiroAbstractController`). |
| `*Resource` (API) | Serialização de coleções em `app/Http/Resources/`. Usado no controller quando o model tem formatação específica. |
| `*SearchRequest` | FormRequest específico para filtros de busca (apenas parâmetros de consulta). |
| `*SearchDTO` | Normalização de tipos para filtros (`fromArray` converte strings→int/null, `per_page` restringido). |
| Model + migration | Forma da tabela. Só o repository fala com o Model. |

Referência viva (leia, não clone a page):

- [`app/Http/Controllers/ContasController.php`](../../../app/Http/Controllers/ContasController.php) — controller simples
- [`app/Http/Controllers/ExtratoController.php`](../../../app/Http/Controllers/ExtratoController.php) — controller composto
- [`app/Http/Controllers/FinanceiroAbstractController.php`](../../../app/Http/Controllers/FinanceiroAbstractController.php) — abstract vazio
- [`app/Http/Resources/FinanceiroParcelaResource.php`](../../../app/Http/Resources/FinanceiroParcelaResource.php) — API Resource
- [`app/Http/Requests/FinanceiroSearchRequest.php`](../../../app/Http/Requests/FinanceiroSearchRequest.php) — SearchRequest
- [`app/DTO/FinanceiroSearchDTO.php`](../../../app/DTO/FinanceiroSearchDTO.php) — SearchDTO
- [`app/Services/ContasService.php`](../../../app/Services/ContasService.php) — service com transação
- [`app/Repositories/ContaRepository.php`](../../../app/Repositories/ContaRepository.php) — repository com método extra
- [`app/Providers/AppServiceProvider.php`](../../../app/Providers/AppServiceProvider.php)
- [`app/DTO/Dto.php`](../../../app/DTO/Dto.php) e [`app/DTO/ContaDTO.php`](../../../app/DTO/ContaDTO.php)
- [`app/Http/Requests/StoreContaRequest.php`](../../../app/Http/Requests/StoreContaRequest.php)
- [`app/Services/ServiceAbstract.php`](../../../app/Services/ServiceAbstract.php)
- [`app/Repositories/AbstractRepository.php`](../../../app/Repositories/AbstractRepository.php)
- [`routes/web.php`](../../../routes/web.php)

## Controller — receber/responder

```
FormRequest → DTO::fromArray($request->validated()) → service → Inertia::render | redirect+flash
```

`index` passa dado com `Inertia::defer(fn () => $this->service->index())`.

try/catch no write devolve `redirect()->back()->with('error', ...)`. Sucesso: `redirect()->route('{plural}')->with('success', ...)`.

### Controller composto

Quando a feature agrega múltiplos services ou exibe entidades pai-filho, o controller herda de um `*AbstractController` vazio e injeta cada service no construtor. O padrão de cada camada não muda — só o número de dependências.

```php
class ExtratoController extends FinanceiroAbstractController
{
    public function __construct(
        private ContasServiceInterface $contaService,
        private CategoriaServiceInterface $categoriaService,
        private ExtratoServiceInterface $extratoService,
        private ProdutosServiceInterface $produtosService,
        private FuncionariosServiceInterface $funcionariosService,
        private FornecedoresServiceInterface $fornecedoresService,
        private GruposServiceInterface $gruposService
    ) {}

    public function index(FinanceiroSearchRequest $request)
    {
        $filters = FinanceiroSearchDTO::fromArray($request->validated());

        return Inertia::render('extrato/index', [
            'filters' => $filters->all(),
            'resumo' => Inertia::defer(fn () => $this->extratoService->resumo($filters)),
            'parcelas' => Inertia::defer(
                FinanceiroParcelaResource::collection($this->extratoService->index($filters))
            ),
        ]);
    }
}
```

- O `*AbstractController` é vazio (`class X extends Controller {}`). Sua função é marcar o tipo de controller, não abstrair lógica.
- `Inertia::defer` para props pesadas; `Inertia::lazy` para listas de referência sob demanda.

### API Resources

Quando o service retorna uma coleção de models e o front precisa de formato específico (datas como `toDateString()`, números formatados, relacionamentos), use um **Eloquent API Resource** em `app/Http/Resources/{Entidade}Resource.php`, estendendo `JsonResource`:

```php
class FinanceiroParcelaResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'descricao' => $this->descricao,
            'data_vencimento' => $this->data_vencimento?->toDateString(),
            'valor' => $this->valor !== null ? number_format($this->valor, 2, '.', '') : null,
            // ...
        ];
    }
}
```

- Coleções: `FinanceiroParcelaResource::collection($service->index($filters))`.
- Use quando houver formatação de saída ou quando o model tem mais colunas do que a tela exige.

### Busca / Filtro

Quando a rota de `index` recebe filtros, o fluxo é:

1. **`*SearchRequest`** (FormRequest específico) — autoriza e valida apenas os parâmetros de busca.
2. **`*SearchDTO`** (extends `Dto`) — normaliza tipos no `fromArray`: strings vazias → `null`, `*_id` → `int|null`, `per_page` restringido a um conjunto fixo.
3. O SearchDTO é passado ao service → repository, que aplica os filtros nas queries.

```php
// Exemplo: FinanceiroSearchDTO
public ?string $dataInicio = null;
public ?int $contaId = null;
public int $perPage = 20;

public static function fromArray(array $data): static
{
    if (array_key_exists('contaId', $data) && $data['contaId'] !== null && $data['contaId'] !== '') {
        $data['contaId'] = (int) $data['contaId'];
    } else {
        $data['contaId'] = null;
    }

    $perPage = isset($data['perPage']) ? (int) $data['perPage'] : 20;
    $data['perPage'] = in_array($perPage, [10, 20, 25, 50], true) ? $perPage : 20;

    return parent::fromArray($data);
}
```

- O `index` do controller recebe o `*SearchRequest` (não `Request` genérico).
- O `index` do service aceita `?SearchDTO` e repassa ao repository.

## Service — regra

Construtor recebe `*RepositoryInterface` e passa ao `parent::__construct`. CRUD genérico fica no abstract; método novo só quando há regra além de persistir.

Acesso a dado: chamar o repository. Query nova vira método no repository (e na interface se sair do abstract).

## Repository — banco

Construtor recebe o Model e passa ao `parent::__construct`.

`AbstractRepository` já: converte DTO com `all()`, `index` filtra `usuario_id` quando a coluna existe e há auth, `update`/`delete` via `findOrFail`.

Filtro, join, agregação, `Schema` e Eloquent extra: métodos neste arquivo.

## DTO e FormRequest

DTO: propriedades públicas = campos persistidos. `usuario_id` opcional quando o intake pediu escopo por usuário.

FormRequest: `authorize` true no padrão atual. `prepareForValidation` preenche `usuario_id` do user autenticado quando o intake pediu tenant. `rules()` cobrem create e update.

## Rotas

Grupo `auth`, prefixo plural:

```
GET    /{plural}        → index    name('{plural}')
POST   /{plural}        → store    name('{plural}.store')
PUT    /{plural}/{id}   → update   name('{plural}.update')
DELETE /{plural}/{id}   → destroy  name('{plural}.destroy')
```

Só os verbos do intake. Front usa o mesmo verbo HTTP (`put` com rota `PUT`).

### Rotas com prefixo diferente do nome

Algumas rotas usam um prefixo singular ou distinto do nome da rota, quando a entidade é subordinada a outra (ex: parcelas pertencem a um lançamento financeiro). O prefixo da URL pode divergir do `name()`, mas o verbo HTTP e o padrão de nomeação seguem o mesmo:

```php
Route::group(['prefix' => 'parcela'], function () {
    Route::put('/{id}', [ParcelaController::class, 'update'])->name('parcela.update');
    Route::delete('/{id}', [ParcelaController::class, 'destroy'])->name('parcela.destroy');
});
```

- O prefixo é `parcela` (singular), mas o `name()` é `parcela.update` / `parcela.destroy`.
- Front chama `route('parcela.update', { id })` com `put` — o verbo HTTP bate com a rota.
- Rotas de sub-recursos (filhas de outra entidade) podem ter prefixo singular mesmo que o controller seja plural (`ParcelaController`).

## Binds

Em `register()`:

```php
$this->app->bind(ContasServiceInterface::class, ContasService::class);
$this->app->bind(ContaRepositoryInterface::class, ContaRepository::class);
```

Controller e service dependem de interface. Sem `new` de service/repository na rotina.
