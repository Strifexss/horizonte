<?php

use App\Models\Fornecedor;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config([
        'admin.emails' => ['admin@horizonte.test'],
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);
});

function administrador(): User
{
    return User::factory()->create(['name' => 'Administrador', 'email' => 'admin@horizonte.test']);
}

it('responde 404 para visitante sem login que acessa o painel', function () {
    $this->get(route('admin.usuarios'))
        ->assertNotFound();
});

it('lista os usuarios cadastrados para o administrador', function () {
    $admin = administrador();
    User::factory()->create(['name' => 'Maria da Silva', 'email' => 'maria@email.com']);

    $this->actingAs($admin)
        ->get(route('admin.usuarios'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/usuarios/index')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('usuarios', 2)
                ->where('usuarios.1.name', 'Maria da Silva')
                ->where('usuarios.1.email', 'maria@email.com')
            )
        );
});

it('filtra a lista de usuarios por nome ou e-mail ignorando acentos', function (string $busca, string $nomeEncontrado) {
    $admin = administrador();
    User::factory()->create(['name' => 'Maria da Silva', 'email' => 'maria@email.com']);
    User::factory()->create(['name' => 'José Pereira', 'email' => 'contato@pereira.com']);

    $this->actingAs($admin)
        ->get(route('admin.usuarios', ['busca' => $busca]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.busca', $busca)
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->has('usuarios', 1)
                ->where('usuarios.0.name', $nomeEncontrado)
            )
        );
})->with([
    'parte do nome' => ['maria', 'Maria da Silva'],
    'parte do e-mail' => ['pereira.com', 'José Pereira'],
    'nome sem acento' => ['jose', 'José Pereira'],
]);

it('cria usuario com senha criptografada', function () {
    $admin = administrador();

    $this->actingAs($admin)
        ->post(route('admin.usuarios.store'), [
            'name' => 'Novo Usuário',
            'email' => 'novo@email.com',
            'password' => 'senha-segura-123',
        ])
        ->assertRedirect(route('admin.usuarios'))
        ->assertSessionHas('success');

    $criado = User::query()->where('email', 'novo@email.com')->firstOrFail();
    expect($criado->name)->toBe('Novo Usuário');
    expect(Hash::check('senha-segura-123', $criado->password))->toBeTrue();
});

it('rejeita criar usuario com e-mail ja cadastrado', function () {
    $admin = administrador();
    User::factory()->create(['email' => 'maria@email.com']);

    $this->actingAs($admin)
        ->from(route('admin.usuarios'))
        ->post(route('admin.usuarios.store'), [
            'name' => 'Outra Maria',
            'email' => 'maria@email.com',
            'password' => 'senha-segura-123',
        ])
        ->assertRedirect(route('admin.usuarios'))
        ->assertSessionHasErrors(['email' => 'The email has already been taken.']);

    expect(User::query()->where('email', 'maria@email.com')->count())->toBe(1);
});

function registrarSessao(string $id, User $user): void
{
    DB::table('sessions')->insert([
        'id' => $id,
        'user_id' => $user->id,
        'payload' => '',
        'last_activity' => now()->getTimestamp(),
    ]);
}

it('atualiza nome e senha do usuario e encerra as sessoes dele', function () {
    $admin = administrador();
    $alvo = User::factory()->create(['name' => 'Nome Antigo', 'email' => 'alvo@email.com']);
    $outro = User::factory()->create();
    registrarSessao('sessao-do-alvo', $alvo);
    registrarSessao('sessao-de-outro', $outro);

    $this->actingAs($admin)
        ->put(route('admin.usuarios.update', $alvo->id), [
            'name' => 'Nome Atualizado',
            'email' => 'alvo@email.com',
            'password' => 'nova-senha-123',
        ])
        ->assertRedirect(route('admin.usuarios'))
        ->assertSessionHas('success');

    $alvo->refresh();
    expect($alvo->name)->toBe('Nome Atualizado');
    expect(Hash::check('nova-senha-123', $alvo->password))->toBeTrue();
    $this->assertDatabaseMissing('sessions', ['id' => 'sessao-do-alvo']);
    $this->assertDatabaseHas('sessions', ['id' => 'sessao-de-outro']);
});

it('mantem a senha atual quando a senha enviada esta vazia', function () {
    $admin = administrador();
    $alvo = User::factory()->create(['password' => 'senha-original-123']);
    registrarSessao('sessao-do-alvo', $alvo);

    $this->actingAs($admin)
        ->put(route('admin.usuarios.update', $alvo->id), [
            'name' => 'Nome Atualizado',
            'email' => $alvo->email,
            'password' => '',
        ])
        ->assertRedirect(route('admin.usuarios'));

    $alvo->refresh();
    expect($alvo->name)->toBe('Nome Atualizado');
    expect(Hash::check('senha-original-123', $alvo->password))->toBeTrue();
    $this->assertDatabaseHas('sessions', ['id' => 'sessao-do-alvo']);
});

it('mantem a sessao atual do administrador ao trocar a propria senha', function () {
    $admin = administrador();
    $sessaoAtual = str_repeat('a', 40);
    registrarSessao($sessaoAtual, $admin);
    registrarSessao('outra-sessao-do-admin', $admin);

    $this->actingAs($admin)
        ->withCookie(config('session.cookie'), $sessaoAtual)
        ->put(route('admin.usuarios.update', $admin->id), [
            'name' => $admin->name,
            'email' => $admin->email,
            'password' => 'nova-senha-123',
        ])
        ->assertRedirect(route('admin.usuarios'));

    $this->assertDatabaseHas('sessions', ['id' => $sessaoAtual]);
    $this->assertDatabaseMissing('sessions', ['id' => 'outra-sessao-do-admin']);
});

it('exclui o usuario junto com os fornecedores dele', function () {
    $admin = administrador();
    $alvo = User::factory()->create();
    $outro = User::factory()->create();
    $fornecedorDoAlvo = Fornecedor::query()->create(['nome' => 'Fornecedor do Alvo', 'usuario_id' => $alvo->id]);
    $fornecedorDeOutro = Fornecedor::query()->create(['nome' => 'Fornecedor de Outro', 'usuario_id' => $outro->id]);

    $this->actingAs($admin)
        ->delete(route('admin.usuarios.destroy', $alvo->id))
        ->assertRedirect(route('admin.usuarios'))
        ->assertSessionHas('success');

    $this->assertModelMissing($alvo);
    $this->assertModelMissing($fornecedorDoAlvo);
    $this->assertModelExists($fornecedorDeOutro);
});

it('encerra a sessao do administrador que exclui a propria conta', function () {
    $admin = administrador();

    $this->actingAs($admin)
        ->delete(route('admin.usuarios.destroy', $admin->id))
        ->assertRedirect('/');

    $this->assertGuest();
    $this->assertModelMissing($admin);
});

it('troca a sessao do administrador pela do usuario alvo ao entrar como ele', function () {
    $admin = administrador();
    $alvo = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.usuarios.entrar-como', $alvo->id))
        ->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($alvo);
});

it('bloqueia entrar como outro administrador', function () {
    config(['admin.emails' => ['admin@horizonte.test', 'outro-admin@horizonte.test']]);
    $admin = administrador();
    $outroAdmin = User::factory()->create(['email' => 'outro-admin@horizonte.test']);

    $this->actingAs($admin)
        ->from(route('admin.usuarios'))
        ->post(route('admin.usuarios.entrar-como', $outroAdmin->id))
        ->assertRedirect(route('admin.usuarios'))
        ->assertSessionHas('error', 'Não é possível entrar como um Administrador.');

    $this->assertAuthenticatedAs($admin);
});

it('responde 404 para usuario comum que acessa o painel', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.usuarios'))
        ->assertNotFound();
});

it('mostra a empresa e o metodo de login de cada usuario na listagem', function () {
    $admin = administrador();
    $google = User::factory()->google()->create(['name' => 'Bruna Google']);
    $google->empresa()->update(['nome' => 'Padaria Bom Dia']);

    $this->actingAs($admin)
        ->get(route('admin.usuarios'))
        ->assertInertia(fn (Assert $page) => $page
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('usuarios.0.name', 'Administrador')
                ->where('usuarios.0.conta_google', false)
                ->where('usuarios.1.empresa', 'Padaria Bom Dia')
                ->where('usuarios.1.conta_google', true)));
});

it('cria o usuario do painel com a propria empresa ainda a confirmar', function () {
    $this->actingAs(administrador())->post(route('admin.usuarios.store'), [
        'name' => 'Carlos Lima',
        'email' => 'carlos@email.com',
        'password' => 'senha-segura-123',
    ]);

    $empresa = User::query()->where('email', 'carlos@email.com')->firstOrFail()->empresa();
    expect($empresa->nome)->toBe('Empresa de Carlos Lima')
        ->and($empresa->nomeConfirmado())->toBeFalse();
});

it('exclui a empresa junto com o usuario que era o unico membro dela', function () {
    $alvo = User::factory()->create();
    $empresaId = $alvo->empresa()->id;

    $this->actingAs(administrador())->delete(route('admin.usuarios.destroy', $alvo->id));

    $this->assertDatabaseMissing('empresas', ['id' => $empresaId]);
});

it('nao trata como administrador a conta google com e-mail de administrador', function () {
    $googleDoAdmin = User::factory()->google()->create(['email' => 'admin@horizonte.test']);

    $this->actingAs($googleDoAdmin)
        ->get(route('admin.usuarios'))
        ->assertNotFound();
});
