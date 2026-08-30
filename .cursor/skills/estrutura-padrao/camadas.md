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
| Model + migration | Forma da tabela. Só o repository fala com o Model. |

Referência viva (leia, não clone a page):

- [`app/Http/Controllers/ContasController.php`](../../../app/Http/Controllers/ContasController.php)
- [`app/Services/ContasService.php`](../../../app/Services/ContasService.php)
- [`app/Repositories/ContaRepository.php`](../../../app/Repositories/ContaRepository.php)
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

## Binds

Em `register()`:

```php
$this->app->bind(ContasServiceInterface::class, ContasService::class);
$this->app->bind(ContaRepositoryInterface::class, ContaRepository::class);
```

Controller e service dependem de interface. Sem `new` de service/repository na rotina.
