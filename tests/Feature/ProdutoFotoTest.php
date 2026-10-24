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
