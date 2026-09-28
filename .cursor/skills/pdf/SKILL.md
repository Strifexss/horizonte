# Geração de PDFs (skill)

Propósito
- Padronizar como gerar PDFs no Horizonte: onde colocar views, como expor rota/controller/service/repository, e checagens obrigatórias (assinaturas, interfaces, testes, formatação).

Contexto
- Projeto: Laravel 12 + Inertia.js v2. Preferimos `barryvdh/laravel-dompdf` quando já está instalado; se outro gerador for usado (Spatie, Gotenberg, etc.) verifique a sua documentação antes de chamar qualquer método.

Quando usar
- Use esta skill sempre que criar ou alterar uma rotina que exporte ou gere um PDF (relatórios, extratos, faturas, recibos).

Onde colocar
- View Blade do PDF: `resources/views/pdfs/{nome}.blade.php`
- Controller: `app/Http/Controllers/{Recurso}PdfController.php` — controller fino, recebe FormRequest/FinanceiroSearchRequest e delega ao service.
- Service: `app/Services/{Recurso}Service.php` — adiciona método `export(...)` que delega ao repository.
- Repository: método `export...(...)` que retorna uma `\Illuminate\Support\Collection` com os models/relacionamentos necessários (SEM paginação).
- Rota: `GET /{recurso}/pdf` com nome `recurso.pdf` dentro do grupo `auth`.

Assinaturas e tipagem (obrigatório)
- Repository: declare no `app/Repositories/Interfaces/*RepositoryInterface.php` um método com phpdoc e retorno `\Illuminate\Support\Collection`.
- Service: declare no respectivo `app/Services/Interfaces/*ServiceInterface.php` um método `export($data = null)` com phpdoc.
- Implemente o método no repositório concreto e no service; nunca faça queries diretamente no controller.

Uso recomendado com barryvdh/laravel-dompdf
- No controller, gere o arquivo assim:

```php
use Barryvdh\DomPDF\Facade\Pdf;

return Pdf::loadView('pdfs.extrato', $data)->download($fileName);
```

- Se preferir stream: `->stream($fileName)`.
- Garanta UTF-8 na view: `<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>`.
- Para fontes/embutimento e PDF/A, verifique a doc do pacote (fonts DejaVu recomendadas).

Frontend (Inertia)
- Não use Inertia.get/post para iniciar um download direto — usar:
  - criar um iframe oculto apontando para a rota do PDF (preserva a página e inicia download), ou
  - abrir a rota em nova aba (`window.open(url)`) quando apropriado.
- Mostre loading singelo no botão (desabilitar + spinner) enquanto o iframe carrega.

Testes e verificações (obrigatório antes de merge)
- Atualize as interfaces (repository + service) e implementação.
- Rode `composer dump-autoload`.
- Rode `vendor/bin/pint --format agent` para formatar PHP.
- Escreva um teste Pest/Feature simples que chama a rota `extrato.pdf` (autenticado) e verifica `200` e `Content-Type: application/pdf` (não precisa validar conteúdo binário).
- Execute `php artisan test --filter=NomeDoTeste`.

Checklist de entrega
- [ ] Interface do repository atualizada e versionada.
- [ ] Service interface atualizada.
- [ ] Implementação no repository retornando Collection.
- [ ] Controller fino que delega ao service.
- [ ] View blade em `resources/views/pdfs`.
- [ ] Rota nomeada `recurso.pdf` registrada em `routes/web.php`.
- [ ] Teste Pest cobrindo o endpoint (verifica status e Content-Type).
- [ ] Pint e autoload rodados sem erros.

Nota sobre pacotes externos
- Sempre confirme a versão do pacote no `composer.lock` antes de chamar APIs (ex.: Spatie v2 usa `Pdf::view(...)`, barryvdh usa `Pdf::loadView(...)`).
- Documente no PR qual driver foi escolhido e por quê.

