<?php

use App\Models\Produto;
use App\Models\User;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use App\Repositories\ProdutoRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Storage::fake('public');
});

function produtoComFoto(User $user, ?string $fotoPath = null): Produto
{
    return Produto::query()->create([
        'nome' => 'Parmegiana',
        'preco_compra' => 10,
        'usuario_id' => $user->id,
        'foto_path' => $fotoPath,
    ]);
}

it('salva a foto do produto no disco publico', function (): void {
    $user = User::factory()->create();
    $produto = produtoComFoto($user);

    $this->actingAs($user)
        ->post(route('produtos.foto.store', $produto->id), [
            'foto' => UploadedFile::fake()->image('parmegiana.jpg', 800, 600),
        ])
        ->assertSessionHas('success');

    $fotoPath = $produto->fresh()->foto_path;

    expect($fotoPath)->toStartWith('produtos/'.$user->id.'/');
    Storage::disk('public')->assertExists($fotoPath);
});

it('troca a foto e apaga o arquivo anterior', function (): void {
    $user = User::factory()->create();
    Storage::disk('public')->put('produtos/antiga.jpg', 'conteudo');
    $produto = produtoComFoto($user, 'produtos/antiga.jpg');

    $this->actingAs($user)
        ->post(route('produtos.foto.store', $produto->id), [
            'foto' => UploadedFile::fake()->image('nova.png'),
        ]);

    Storage::disk('public')->assertMissing('produtos/antiga.jpg');
    expect($produto->fresh()->foto_path)->not->toBe('produtos/antiga.jpg');
});

it('apaga o arquivo novo quando a foto nao e gravada no produto', function (): void {
    $user = User::factory()->create();
    $produto = produtoComFoto($user);

    app()->bind(ProdutoRepositoryInterface::class, fn () => new class(new Produto) extends ProdutoRepository
    {
        public function atualizarFoto(int $id, ?string $fotoPath): Produto
        {
            throw new RuntimeException('Falha ao gravar');
        }
    });

    $this->actingAs($user)
        ->post(route('produtos.foto.store', $produto->id), [
            'foto' => UploadedFile::fake()->image('parmegiana.jpg'),
        ])
        ->assertSessionHas('error');

    Storage::disk('public')->assertDirectoryEmpty('produtos/'.$user->id);
    expect($produto->fresh()->foto_path)->toBeNull();
});

it('remove a foto do produto', function (): void {
    $user = User::factory()->create();
    Storage::disk('public')->put('produtos/foto.jpg', 'conteudo');
    $produto = produtoComFoto($user, 'produtos/foto.jpg');

    $this->actingAs($user)
        ->delete(route('produtos.foto.destroy', $produto->id))
        ->assertSessionHas('success');

    Storage::disk('public')->assertMissing('produtos/foto.jpg');
    expect($produto->fresh()->foto_path)->toBeNull();
});

it('recusa arquivo que nao e imagem ou passa de 2 MB', function (UploadedFile $arquivo): void {
    $user = User::factory()->create();
    $produto = produtoComFoto($user);

    $this->actingAs($user)
        ->post(route('produtos.foto.store', $produto->id), ['foto' => $arquivo])
        ->assertSessionHasErrors('foto');

    expect($produto->fresh()->foto_path)->toBeNull();
})->with([
    'pdf' => fn () => UploadedFile::fake()->create('cardapio.pdf', 100, 'application/pdf'),
    'grande' => fn () => UploadedFile::fake()->image('enorme.jpg')->size(3000),
]);

it('nao altera foto de produto de outro usuario', function (): void {
    $produto = produtoComFoto(User::factory()->create());

    $this->actingAs(User::factory()->create())
        ->post(route('produtos.foto.store', $produto->id), [
            'foto' => UploadedFile::fake()->image('foto.jpg'),
        ])
        ->assertNotFound();

    expect($produto->fresh()->foto_path)->toBeNull();
});

it('cria o produto ja com a foto enviada pelo formulario', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('produtos.store'), [
            'nome' => 'Parmegiana',
            'preco_compra' => 10,
            'foto' => UploadedFile::fake()->image('parmegiana.jpg', 800, 600),
        ])
        ->assertSessionHasNoErrors();

    $fotoPath = Produto::query()->where('nome', 'Parmegiana')->value('foto_path');

    expect($fotoPath)->not->toBeNull();
    Storage::disk('public')->assertExists($fotoPath);
});

it('troca a foto ao editar o produto pelo formulario', function (): void {
    $user = User::factory()->create();
    Storage::disk('public')->put('produtos/antiga.jpg', 'conteudo');
    $produto = produtoComFoto($user, 'produtos/antiga.jpg');

    $this->actingAs($user)
        ->post(route('produtos.update', $produto->id), [
            '_method' => 'put',
            'nome' => 'Parmegiana',
            'preco_compra' => 10,
            'foto' => UploadedFile::fake()->image('nova.webp'),
        ])
        ->assertSessionHasNoErrors();

    Storage::disk('public')->assertMissing('produtos/antiga.jpg');
    Storage::disk('public')->assertExists($produto->fresh()->foto_path);
});

it('remove a foto ao editar o produto com remover_foto', function (): void {
    $user = User::factory()->create();
    Storage::disk('public')->put('produtos/antiga.jpg', 'conteudo');
    $produto = produtoComFoto($user, 'produtos/antiga.jpg');

    $this->actingAs($user)
        ->put(route('produtos.update', $produto->id), [
            'nome' => 'Parmegiana',
            'preco_compra' => 10,
            'remover_foto' => true,
        ])
        ->assertSessionHasNoErrors();

    expect($produto->fresh()->foto_path)->toBeNull();
    Storage::disk('public')->assertMissing('produtos/antiga.jpg');
});

it('mantem a foto ao editar o produto sem mexer nela', function (): void {
    $user = User::factory()->create();
    $produto = produtoComFoto($user, 'produtos/antiga.jpg');

    $this->actingAs($user)
        ->put(route('produtos.update', $produto->id), ['nome' => 'Parmegiana 2', 'preco_compra' => 10])
        ->assertSessionHasNoErrors();

    expect($produto->fresh()->foto_path)->toBe('produtos/antiga.jpg');
});

it('recusa foto fora do formato no formulario do produto', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('produtos.store'), [
            'nome' => 'Parmegiana',
            'preco_compra' => 10,
            'foto' => UploadedFile::fake()->create('cardapio.pdf', 100, 'application/pdf'),
        ])
        ->assertSessionHasErrors('foto');

    expect(Produto::query()->where('nome', 'Parmegiana')->exists())->toBeFalse();
});

it('nao cria o produto quando a foto do formulario falha ao gravar', function (): void {
    $user = User::factory()->create();

    app()->bind(ProdutoRepositoryInterface::class, fn () => new class(new Produto) extends ProdutoRepository
    {
        public function atualizarFoto(int $id, ?string $fotoPath): Produto
        {
            throw new RuntimeException('Falha ao gravar');
        }
    });

    $this->actingAs($user)
        ->post(route('produtos.store'), [
            'nome' => 'Parmegiana',
            'preco_compra' => 10,
            'foto' => UploadedFile::fake()->image('parmegiana.jpg'),
        ])
        ->assertSessionHas('error');

    expect(Produto::query()->where('nome', 'Parmegiana')->exists())->toBeFalse();
    Storage::disk('public')->assertDirectoryEmpty('produtos/'.$user->id);
});

it('nao altera a foto de produto de outra empresa pelo formulario', function (): void {
    $dono = User::factory()->create();
    $outro = User::factory()->create();
    $produto = produtoComFoto($dono, 'produtos/antiga.jpg');

    $this->actingAs($outro)
        ->put(route('produtos.update', $produto->id), [
            'nome' => 'Invadido',
            'preco_compra' => 10,
            'remover_foto' => true,
        ]);

    expect($produto->fresh())
        ->nome->toBe('Parmegiana')
        ->foto_path->toBe('produtos/antiga.jpg');
});
