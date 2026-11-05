<?php

use App\Models\Configuracao;
use App\Models\CopilotoPerguntaSemResposta;
use App\Models\User;
use App\Services\Interfaces\ConfiguracoesServiceInterface;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->withoutVite();

    config([
        'admin.emails' => ['admin@horizonte.test'],
        'inertia.testing.page_paths' => [resource_path('js/pages')],
    ]);
});

function administradorDeConfiguracoes(): User
{
    return User::factory()->create(['email' => 'admin@horizonte.test']);
}

it('mostra o whatsapp do suporte e as perguntas sem resposta ao administrador', function (): void {
    CopilotoPerguntaSemResposta::query()->create(['pergunta' => 'Como emito nota fiscal?', 'tela' => 'vendas']);

    $this->actingAs(administradorDeConfiguracoes())
        ->get(route('admin.configuracoes'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/configuracoes/index')
            ->where('configuracoes.suporte_whatsapp', '83988003516')
            ->loadDeferredProps(fn (Assert $reload) => $reload
                ->where('perguntas_sem_resposta.0.pergunta', 'Como emito nota fiscal?')
                ->has('interesses', 0)));
});

it('esconde as configuracoes de quem nao e administrador', function (): void {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.configuracoes'))
        ->assertNotFound();
});

it('salva o whatsapp so com numeros e atualiza o link do copiloto', function (): void {
    $this->actingAs(administradorDeConfiguracoes())
        ->put(route('admin.configuracoes.update'), ['suporte_whatsapp' => '(11) 91234-5678'])
        ->assertRedirect(route('admin.configuracoes'));

    expect(Configuracao::query()->where('chave', Configuracao::SUPORTE_WHATSAPP)->value('valor'))->toBe('11912345678')
        ->and(app(ConfiguracoesServiceInterface::class)->linkWhatsappSuporte())->toBe('https://wa.me/5511912345678');
});

it('recusa numero sem ddd', function (): void {
    $this->actingAs(administradorDeConfiguracoes())
        ->put(route('admin.configuracoes.update'), ['suporte_whatsapp' => '988003516'])
        ->assertSessionHasErrors(['suporte_whatsapp' => 'Informe o número com DDD: 10 ou 11 dígitos, sem o 55.']);
});

it('aceita o whatsapp vazio e o copiloto deixa de indicar contato', function (): void {
    $this->actingAs(administradorDeConfiguracoes())
        ->put(route('admin.configuracoes.update'), ['suporte_whatsapp' => ''])
        ->assertSessionHasNoErrors();

    expect(app(ConfiguracoesServiceInterface::class)->linkWhatsappSuporte())->toBeNull();
});
