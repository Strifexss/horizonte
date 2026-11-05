<?php

use App\Ai\Agents\Copiloto;
use App\Ai\Contracts\CopilotoAgenteInterface;
use App\Ai\Copiloto\TelaAjuda;
use App\DTO\CopilotoContextoDTO;
use App\DTO\CopilotoRespostaDTO;
use App\Models\CopilotoInteresse;
use App\Models\CopilotoPerguntaSemResposta;
use App\Models\EmpresaModulo;
use App\Models\User;
use App\Modulos;
use App\Repositories\Interfaces\AjudaRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;

beforeEach(function (): void {
    config([
        'copiloto.agente' => 'laravel_ai',
        'copiloto.perguntas_por_minuto' => 10,
        'copiloto.perguntas_por_dia' => 100,
        'insights.requisicoes_por_minuto' => 15,
    ]);
});

function copilotoDesligarModulo(User $user, string $modulo): void
{
    EmpresaModulo::query()->create(['empresa_id' => $user->empresa()->id, 'modulo' => $modulo, 'ligado' => false]);
    $user->esquecerEmpresaAtiva();
}

/**
 * Agente falso pela interface: guarda o contexto recebido e devolve a resposta configurada.
 */
function copilotoAgenteFalso(bool $respondeu = true, string $conversaId = '00000000-0000-0000-0000-000000000001'): object
{
    $agente = new class($respondeu, $conversaId) implements CopilotoAgenteInterface
    {
        public ?CopilotoContextoDTO $contexto = null;

        public function __construct(private bool $respondeu, private string $conversaId) {}

        public function responder(string $mensagem, ?string $conversaId, CopilotoContextoDTO $contexto, User $user): CopilotoRespostaDTO
        {
            $this->contexto = $contexto;

            return new CopilotoRespostaDTO($conversaId ?? $this->conversaId, 'Resposta de teste.', $this->respondeu);
        }
    };

    app()->instance(CopilotoAgenteInterface::class, $agente);

    return $agente;
}

it('abre o chat para qualquer empresa, sem depender de modulo', function (): void {
    $user = User::factory()->create();
    copilotoDesligarModulo($user, Modulos::COPILOTO);

    $this->actingAs($user)
        ->getJson(route('copiloto.abertura', ['componente' => 'extrato/index']))
        ->assertOk()
        ->assertJsonPath('conversa_id', null)
        ->assertJsonPath('mensagens', [])
        ->assertJsonPath('suporte_url', 'https://wa.me/5583988003516');
});

it('sugere perguntas da tela atual e oferece um modulo que a empresa nao tem', function (): void {
    $varejo = User::factory()->create();

    $this->actingAs($varejo)
        ->getJson(route('copiloto.abertura', ['componente' => 'extrato/index']))
        ->assertOk()
        ->assertJsonPath('sugestoes', ['Como lanço uma despesa?', 'Como dou baixa em um pagamento?'])
        ->assertJsonPath('oferta.modulo', Modulos::MENU_BOARD)
        ->assertJsonPath('oferta.oferta', 'Mostre seu cardápio na TV com o Menu Board');
});

it('mostra tres sugestoes e nenhuma oferta quando a empresa tem todos os modulos', function (): void {
    $restaurante = User::factory()->restaurante()->create();

    $this->actingAs($restaurante)
        ->getJson(route('copiloto.abertura', ['componente' => 'menu-boards/form']))
        ->assertOk()
        ->assertJsonCount(3, 'sugestoes')
        ->assertJsonPath('sugestoes.0', 'Como conecto a TV?')
        ->assertJsonPath('oferta', null);
});

it('usa as sugestoes do inicio fora das telas do menu', function (): void {
    $this->actingAs(User::factory()->restaurante()->create())
        ->getJson(route('copiloto.abertura', ['componente' => 'settings/profile']))
        ->assertJsonPath('sugestoes.0', 'Como faço minha primeira venda?');
});

it('nao sugere pergunta de modulo que a empresa nao tem', function (): void {
    $user = User::factory()->restaurante()->create();
    copilotoDesligarModulo($user, Modulos::COPILOTO);

    $sugestoes = app(AjudaRepositoryInterface::class)->sugestoes(TelaAjuda::Dashboard, $user->empresa()->modulosDisponiveis());

    expect($sugestoes)->not->toContain('Como funciona a análise com IA?')
        ->and(app(AjudaRepositoryInterface::class)->sugestoes(TelaAjuda::Dashboard, [Modulos::COPILOTO]))
        ->toContain('Como funciona a análise com IA?');
});

it('envia a ajuda sem o uso de modulos ausentes e com o texto de venda deles', function (): void {
    $agente = copilotoAgenteFalso();

    $this->actingAs(User::factory()->create())
        ->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Como lanço uma despesa?', 'componente' => 'vendas/index'])
        ->assertOk()
        ->assertJsonPath('resposta', 'Resposta de teste.');

    expect($agente->contexto->ajuda)->toContain('# Extrato')
        ->and($agente->contexto->ajuda)->toContain('## Analisar com IA')
        ->and($agente->contexto->ajuda)->not->toContain('# Menu Board')
        ->and($agente->contexto->ofertas)->toHaveCount(1)
        ->and($agente->contexto->ofertas[0])->toContain('Menu Board')
        ->and($agente->contexto->telaAtual)->toBe('vendas')
        ->and($agente->contexto->tools)->toBe([]);
});

it('remove a secao de modulo desligado da ajuda', function (): void {
    $ajuda = app(AjudaRepositoryInterface::class)->paraPergunta('qualquer', []);

    expect($ajuda)->toContain('## Escolher o mês')
        ->and($ajuda)->not->toContain('## Analisar com IA')
        ->and($ajuda)->not->toContain('<!-- modulo');
});

it('registra a pergunta sem resposta sem guardar o usuario', function (): void {
    copilotoAgenteFalso(respondeu: false);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Como emito nota fiscal?', 'componente' => 'vendas/index'])
        ->assertOk()
        ->assertJsonPath('respondeu', false);

    $registro = CopilotoPerguntaSemResposta::query()->sole();

    expect($registro->pergunta)->toBe('Como emito nota fiscal?')
        ->and($registro->empresa_id)->toBe($user->empresa()->id)
        ->and($registro->tela)->toBe('vendas')
        ->and(array_keys($registro->getAttributes()))->not->toContain('user_id');
});

it('nao registra quando o copiloto responde', function (): void {
    copilotoAgenteFalso(respondeu: true);

    $this->actingAs(User::factory()->create())
        ->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Como faço uma venda?'])
        ->assertOk();

    expect(CopilotoPerguntaSemResposta::query()->count())->toBe(0);
});

it('grava a conversa pelo laravel ai e a devolve na abertura', function (): void {
    Copiloto::fake([['resposta' => 'Em Vendas, toque em **+ Nova Venda**.', 'respondeu' => true]]);
    $user = User::factory()->create();

    $conversaId = $this->actingAs($user)
        ->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Como faço uma venda?'])
        ->assertOk()
        ->assertJsonPath('resposta', 'Em Vendas, toque em **+ Nova Venda**.')
        ->json('conversa_id');

    $this->getJson(route('copiloto.abertura'))
        ->assertJsonPath('conversa_id', $conversaId)
        ->assertJsonPath('mensagens', [
            ['papel' => 'usuario', 'texto' => 'Como faço uma venda?'],
            ['papel' => 'copiloto', 'texto' => 'Em Vendas, toque em **+ Nova Venda**.'],
        ]);
});

it('nao deixa continuar a conversa de outro usuario', function (): void {
    Copiloto::fake([['resposta' => 'Ok.', 'respondeu' => true]]);
    $dono = User::factory()->create();

    $conversaId = $this->actingAs($dono)
        ->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Como faço uma venda?'])
        ->json('conversa_id');

    $this->actingAs(User::factory()->create())
        ->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'E agora?', 'conversa_id' => $conversaId])
        ->assertNotFound();
});

it('apaga a conversa anterior ao comecar uma nova', function (): void {
    Copiloto::fake([['resposta' => 'Ok.', 'respondeu' => true]]);
    $user = User::factory()->create();

    $this->actingAs($user)->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Como faço uma venda?'])->assertOk();

    $this->deleteJson(route('copiloto.conversa.destroy'))->assertOk();

    expect(DB::table('agent_conversations')->count())->toBe(0)
        ->and(DB::table('agent_conversation_messages')->count())->toBe(0);
    $this->getJson(route('copiloto.abertura'))->assertJsonPath('conversa_id', null);
});

it('apaga conversas sem atividade ha mais de 30 dias', function (): void {
    Copiloto::fake([['resposta' => 'Ok.', 'respondeu' => true], ['resposta' => 'Ok.', 'respondeu' => true]]);
    $antigo = User::factory()->create();
    $recente = User::factory()->create();

    $this->actingAs($antigo)->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Oi'])->assertOk();
    DB::table('agent_conversations')->update(['updated_at' => now()->subDays(31)]);
    $this->actingAs($recente)->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Oi'])->assertOk();

    $this->artisan('copiloto:apagar-conversas')->assertSuccessful();

    expect(DB::table('agent_conversations')->pluck('participant_id')->all())->toBe([$recente->id]);
});

it('limita as perguntas por usuario', function (): void {
    config(['copiloto.perguntas_por_minuto' => 2]);
    copilotoAgenteFalso();
    $this->actingAs(User::factory()->create());

    $this->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Um'])->assertOk();
    $this->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Dois'])->assertOk();
    $this->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Três'])
        ->assertStatus(429)
        ->assertJsonPath('message', 'Você fez muitas perguntas seguidas. Espere um pouco e tente de novo.');
});

it('respeita o limite global da chave de ia dividido com os insights', function (): void {
    config(['insights.requisicoes_por_minuto' => 1]);
    copilotoAgenteFalso();
    RateLimiter::hit(md5('insights-ia'), 60);

    $this->actingAs(User::factory()->create())
        ->postJson(route('copiloto.mensagens.store'), ['mensagem' => 'Como faço uma venda?'])
        ->assertStatus(429)
        ->assertJsonPath('message', 'O Copiloto está atendendo muita gente agora. Tente de novo em instantes.');
});

it('valida a pergunta', function (): void {
    $this->actingAs(User::factory()->create())
        ->postJson(route('copiloto.mensagens.store'), ['mensagem' => ''])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['mensagem' => 'Escreva sua dúvida.']);
});

it('registra o interesse e devolve o whatsapp com a mensagem pronta', function (): void {
    $user = User::factory()->create();

    $url = $this->actingAs($user)
        ->postJson(route('copiloto.interesses.store'), ['modulo' => Modulos::MENU_BOARD])
        ->assertOk()
        ->json('whatsapp_url');

    expect($url)->toStartWith('https://wa.me/5583988003516?text=')
        ->and(rawurldecode($url))->toContain('quero conhecer o Menu Board')
        ->and(CopilotoInteresse::query()->sole()->only(['empresa_id', 'user_id', 'modulo']))
        ->toBe(['empresa_id' => $user->empresa()->id, 'user_id' => $user->id, 'modulo' => Modulos::MENU_BOARD]);
});

it('recusa interesse em modulo inexistente', function (): void {
    $this->actingAs(User::factory()->create())
        ->postJson(route('copiloto.interesses.store'), ['modulo' => 'financeiro'])
        ->assertUnprocessable();
});

it('exige login', function (): void {
    $this->getJson(route('copiloto.abertura'))->assertUnauthorized();
});

it('tem ajuda para toda tela do menu', function (): void {
    $sidebar = file_get_contents(resource_path('js/components/app-sidebar.tsx'));
    preg_match_all("/url: '\\/([a-z-]+)'/", $sidebar, $urls);

    expect($urls[1])->not->toBeEmpty();

    foreach ($urls[1] as $url) {
        expect(TelaAjuda::tryFrom($url))->not->toBeNull("Tela /{$url} sem caso em TelaAjuda")
            ->and(resource_path("ajuda/{$url}.md"))->toBeFile();
    }
});

it('mantem a ajuda completa abaixo do limite de tokens', function (): void {
    $ajuda = app(AjudaRepositoryInterface::class)->paraPergunta('qualquer', array_keys(Modulos::OPCIONAIS));
    $tokensEstimados = (int) ceil(mb_strlen($ajuda) / 4);

    expect($tokensEstimados)->toBeLessThan(config('copiloto.limite_tokens_ajuda'),
        'A ajuda passou do limite: é hora de trocar a ajuda completa por busca por seção (ver .scratch/copiloto-chat/spec.md).');
});
