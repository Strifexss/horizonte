<?php

use App\Models\Novidade;
use App\Models\NovidadeImagem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    config([
        'admin.emails' => ['admin@horizonte.test'],
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);
    Storage::fake(Novidade::DISCO_IMAGEM);
});

function administradorDasNovidades(): User
{
    return User::factory()->create(['email' => 'admin@horizonte.test']);
}

/**
 * @param  array<string, mixed>  $sobrescrever
 * @return array<string, mixed>
 */
function payloadNovidade(array $sobrescrever = []): array
{
    return [
        'titulo' => 'Relatório de vendas',
        'descricao' => 'Veja o total vendido por forma de pagamento.',
        'categoria' => Novidade::CATEGORIA_MELHORIA,
        'cta_url' => 'https://horizonte.test/vendas',
        'popup_automatico' => '1',
        ...$sobrescrever,
    ];
}

function imagemDaNovidade(Novidade $novidade, string $nome = 'banner.png', int $ordem = 0): NovidadeImagem
{
    return NovidadeImagem::query()->create([
        'novidade_id' => $novidade->id,
        'caminho' => UploadedFile::fake()->image($nome)->store(Novidade::PASTA_IMAGENS, Novidade::DISCO_IMAGEM),
        'ordem' => $ordem,
    ]);
}

it('lista rascunhos e publicadas para o administrador com as imagens', function (): void {
    novidade(['titulo' => 'Rascunho antigo']);
    $publicada = novidadePublicada(['titulo' => 'Publicada recente']);
    $imagem = imagemDaNovidade($publicada);

    $this->actingAs(administradorDasNovidades())
        ->get(route('admin.novidades'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/novidades/index')
            ->missing('imagens')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('novidades', 2)
                ->where('novidades.0.titulo', 'Publicada recente')
                ->where('novidades.0.status', Novidade::STATUS_PUBLICADO)
                ->where('novidades.0.imagens.0.id', $imagem->id)
                ->where('novidades.1.titulo', 'Rascunho antigo')
                ->where('novidades.1.publicada_em', null)
                ->where('novidades.1.imagens', [])
            )
        );
});

it('cria a novidade como rascunho guardando todas as imagens enviadas', function (): void {
    $this->actingAs(administradorDasNovidades())
        ->post(route('admin.novidades.store'), payloadNovidade([
            'imagens' => [
                UploadedFile::fake()->image('primeira.png'),
                UploadedFile::fake()->image('segunda.jpg'),
                UploadedFile::fake()->image('terceira.gif'),
            ],
        ]))
        ->assertRedirect(route('admin.novidades'))
        ->assertSessionHas('success', 'Novidade criada como rascunho.');

    $criada = Novidade::query()->sole();
    expect($criada->titulo)->toBe('Relatório de vendas')
        ->and($criada->categoria)->toBe(Novidade::CATEGORIA_MELHORIA)
        ->and($criada->status)->toBe(Novidade::STATUS_RASCUNHO)
        ->and($criada->popup_automatico)->toBeTrue()
        ->and($criada->cta_url)->toBe('https://horizonte.test/vendas')
        ->and($criada->publicada_em)->toBeNull()
        ->and($criada->imagens)->toHaveCount(3)
        ->and($criada->imagens->pluck('ordem')->all())->toBe([1, 2, 3]);
    $criada->imagens->each(fn (NovidadeImagem $imagem) => Storage::disk(Novidade::DISCO_IMAGEM)->assertExists($imagem->caminho));
});

it('exige titulo, descricao e categoria', function (): void {
    $this->actingAs(administradorDasNovidades())
        ->from(route('admin.novidades'))
        ->post(route('admin.novidades.store'), [])
        ->assertRedirect(route('admin.novidades'))
        ->assertSessionHasErrors([
            'titulo' => 'O título é obrigatório.',
            'descricao' => 'A descrição é obrigatória.',
            'categoria' => 'A categoria é obrigatória.',
        ]);

    expect(Novidade::query()->count())->toBe(0);
});

it('rejeita valores invalidos sem gravar arquivo', function (string $campo, mixed $valor, string $campoDoErro, string $mensagem): void {
    $this->actingAs(administradorDasNovidades())
        ->from(route('admin.novidades'))
        ->post(route('admin.novidades.store'), payloadNovidade([$campo => $valor]))
        ->assertSessionHasErrors([$campoDoErro => $mensagem]);

    expect(Novidade::query()->count())->toBe(0)
        ->and(Storage::disk(Novidade::DISCO_IMAGEM)->allFiles())->toBe([]);
})->with([
    'categoria fora da lista' => fn (): array => ['categoria', 'outra', 'categoria', 'Categoria inválida.'],
    'link sem http' => fn (): array => ['cta_url', 'javascript:alert(1)', 'cta_url', 'Informe um link válido, começando com http:// ou https://.'],
    'um dos arquivos nao e imagem' => fn (): array => [
        'imagens',
        [UploadedFile::fake()->image('ok.png'), UploadedFile::fake()->create('manual.pdf', 10, 'application/pdf')],
        'imagens.1',
        'Todos os arquivos devem ser imagens.',
    ],
]);

it('limita a quantidade de imagens por envio', function (): void {
    $imagens = array_map(fn (int $indice) => UploadedFile::fake()->image("imagem-{$indice}.png", 10, 10), range(1, 21));

    $this->actingAs(administradorDasNovidades())
        ->from(route('admin.novidades'))
        ->post(route('admin.novidades.store'), payloadNovidade(['imagens' => $imagens]))
        ->assertSessionHasErrors(['imagens' => 'Envie até 20 imagens por vez; salve e adicione o restante em seguida.']);

    expect(Novidade::query()->count())->toBe(0);
});

it('adiciona imagens ao fim e remove as marcadas apagando os arquivos', function (): void {
    $novidade = novidade(['cta_url' => 'https://horizonte.test/antigo']);
    $mantida = imagemDaNovidade($novidade, 'mantida.png', 1);
    $removida = imagemDaNovidade($novidade, 'removida.png', 2);

    $this->actingAs(administradorDasNovidades())
        ->put(route('admin.novidades.update', $novidade->id), payloadNovidade([
            'titulo' => 'Título revisado',
            'cta_url' => '',
            'remover_imagens' => [$removida->id],
            'imagens' => [UploadedFile::fake()->image('nova.png')],
        ]))
        ->assertRedirect(route('admin.novidades'))
        ->assertSessionHas('success', 'Novidade atualizada com sucesso.');

    $novidade->refresh();
    expect($novidade->titulo)->toBe('Título revisado')
        ->and($novidade->cta_url)->toBeNull()
        ->and($novidade->imagens)->toHaveCount(2)
        ->and($novidade->imagens->first()->id)->toBe($mantida->id);
    $this->assertModelMissing($removida);
    Storage::disk(Novidade::DISCO_IMAGEM)->assertMissing($removida->caminho);
    Storage::disk(Novidade::DISCO_IMAGEM)->assertExists($mantida->caminho);
    Storage::disk(Novidade::DISCO_IMAGEM)->assertExists($novidade->imagens->last()->caminho);
});

it('ignora pedido de remover imagem de outra novidade', function (): void {
    $editada = novidade();
    $outra = novidade(['titulo' => 'Outra']);
    $imagemDaOutra = imagemDaNovidade($outra);

    $this->actingAs(administradorDasNovidades())
        ->put(route('admin.novidades.update', $editada->id), payloadNovidade(['remover_imagens' => [$imagemDaOutra->id]]))
        ->assertRedirect(route('admin.novidades'));

    $this->assertModelExists($imagemDaOutra);
    Storage::disk(Novidade::DISCO_IMAGEM)->assertExists($imagemDaOutra->caminho);
});

it('exclui a novidade junto com todas as imagens', function (): void {
    $novidade = novidade();
    $primeira = imagemDaNovidade($novidade, 'a.png');
    $segunda = imagemDaNovidade($novidade, 'b.png');

    $this->actingAs(administradorDasNovidades())
        ->delete(route('admin.novidades.destroy', $novidade->id))
        ->assertRedirect(route('admin.novidades'))
        ->assertSessionHas('success', 'Novidade excluída com sucesso.');

    $this->assertModelMissing($novidade);
    $this->assertModelMissing($primeira);
    Storage::disk(Novidade::DISCO_IMAGEM)->assertMissing([$primeira->caminho, $segunda->caminho]);
});

it('lista a pasta de imagens indicando a novidade dona de cada arquivo', function (): void {
    $novidade = novidade(['titulo' => 'Tela de vendas']);
    $this->travelTo('2026-10-01 09:00:00');
    $usada = imagemDaNovidade($novidade);
    $this->travelTo('2026-10-02 09:00:00');
    $solta = UploadedFile::fake()->image('solta.png')->store(Novidade::PASTA_IMAGENS, Novidade::DISCO_IMAGEM);
    touch(Storage::disk(Novidade::DISCO_IMAGEM)->path($usada->caminho), strtotime('2026-10-01 09:00:00'));
    touch(Storage::disk(Novidade::DISCO_IMAGEM)->path($solta), strtotime('2026-10-02 09:00:00'));

    $this->actingAs(administradorDasNovidades())
        ->get(route('admin.novidades'))
        ->assertInertia(fn (Assert $page) => $page
            ->reloadOnly('imagens', fn (Assert $reload) => $reload
                ->has('imagens', 2)
                ->where('imagens.0.arquivo', basename($solta))
                ->where('imagens.0.novidade', null)
                ->where('imagens.0.urls.destroy', route('admin.novidades.imagens.destroy', basename($solta)))
                ->where('imagens.1.arquivo', basename($usada->caminho))
                ->where('imagens.1.novidade.titulo', 'Tela de vendas')
                ->where('imagens.1.modificado_em', '2026-10-01')
            )
        );
});

it('exclui da pasta a imagem e o vinculo com a novidade', function (): void {
    $imagem = imagemDaNovidade(novidade());

    $this->actingAs(administradorDasNovidades())
        ->delete(route('admin.novidades.imagens.destroy', basename($imagem->caminho)))
        ->assertRedirect(route('admin.novidades'))
        ->assertSessionHas('success', 'Imagem excluída com sucesso.');

    $this->assertModelMissing($imagem);
    Storage::disk(Novidade::DISCO_IMAGEM)->assertMissing($imagem->caminho);
});

it('responde 404 ao excluir imagem que nao esta na pasta', function (): void {
    Storage::disk(Novidade::DISCO_IMAGEM)->put('fora-da-pasta.png', 'conteudo');

    $this->actingAs(administradorDasNovidades())
        ->delete(route('admin.novidades.imagens.destroy', 'fora-da-pasta.png'))
        ->assertNotFound();

    Storage::disk(Novidade::DISCO_IMAGEM)->assertExists('fora-da-pasta.png');
});

it('grava a data na primeira publicacao e a mantem ao republicar', function (): void {
    $novidade = novidade();
    $admin = administradorDasNovidades();

    $this->travelTo('2026-10-01 09:00:00');
    $this->actingAs($admin)
        ->put(route('admin.novidades.status', $novidade->id), ['status' => Novidade::STATUS_PUBLICADO])
        ->assertRedirect(route('admin.novidades'))
        ->assertSessionHas('success', 'Novidade publicada.');

    $this->travelTo('2026-10-20 09:00:00');
    $this->actingAs($admin)
        ->put(route('admin.novidades.status', $novidade->id), ['status' => Novidade::STATUS_RASCUNHO])
        ->assertSessionHas('success', 'Novidade voltou para rascunho.');
    expect($novidade->refresh()->status)->toBe(Novidade::STATUS_RASCUNHO);

    $this->actingAs($admin)->put(route('admin.novidades.status', $novidade->id), ['status' => Novidade::STATUS_PUBLICADO]);

    $novidade->refresh();
    expect($novidade->status)->toBe(Novidade::STATUS_PUBLICADO)
        ->and($novidade->publicada_em->toDateString())->toBe('2026-10-01');
});

it('rejeita status desconhecido', function (): void {
    $novidade = novidade();

    $this->actingAs(administradorDasNovidades())
        ->from(route('admin.novidades'))
        ->put(route('admin.novidades.status', $novidade->id), ['status' => 'arquivado'])
        ->assertSessionHasErrors(['status' => 'Status inválido.']);

    expect($novidade->refresh()->status)->toBe(Novidade::STATUS_RASCUNHO);
});

it('responde 404 para usuario comum em qualquer rota do admin de novidades', function (string $metodo, string $rota): void {
    $novidade = novidade();
    $imagem = imagemDaNovidade($novidade);

    $this->actingAs(User::factory()->create())
        ->call($metodo, route($rota, ['id' => $novidade->id, 'arquivo' => basename($imagem->caminho)]), payloadNovidade(['status' => Novidade::STATUS_PUBLICADO]))
        ->assertNotFound();

    expect($novidade->refresh()->only(['titulo', 'status']))->toBe([
        'titulo' => 'Nova tela de vendas',
        'status' => Novidade::STATUS_RASCUNHO,
    ]);
    expect(Novidade::query()->count())->toBe(1);
    $this->assertModelExists($imagem);
    Storage::disk(Novidade::DISCO_IMAGEM)->assertExists($imagem->caminho);
})->with([
    'listar' => ['GET', 'admin.novidades'],
    'criar' => ['POST', 'admin.novidades.store'],
    'editar' => ['PUT', 'admin.novidades.update'],
    'excluir' => ['DELETE', 'admin.novidades.destroy'],
    'alterar status' => ['PUT', 'admin.novidades.status'],
    'excluir imagem da pasta' => ['DELETE', 'admin.novidades.imagens.destroy'],
]);
