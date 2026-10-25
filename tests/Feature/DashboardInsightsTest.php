<?php

use App\Ai\Agents\AnalistaDashboard;
use App\Jobs\GerarAnaliseDashboard;
use App\Models\Categoria;
use App\Models\Conta;
use App\Models\DashboardAnalise;
use App\Models\Financeiro;
use App\Models\FinanceiroParcela;
use App\Models\InsightAcao;
use App\Models\Produto;
use App\Models\User;
use App\Models\Venda;
use App\Models\VendaItem;
use App\Services\Interfaces\DashboardInsightsServiceInterface;
use App\Services\Interfaces\IndicadoresInsightsServiceInterface;
use Illuminate\JsonSchema\JsonSchemaTypeFactory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Ai\Exceptions\ProviderOverloadedException;
use Laravel\Ai\Exceptions\RateLimitedException;
use Laravel\Ai\ObjectSchema;

beforeEach(function (): void {
    $this->withoutVite();

    config([
        'inertia.testing.page_paths' => [resource_path('js/pages')],
        'insights.limite_analises' => 5,
        'insights.janela_limite_minutos' => 10,
        'insights.requisicoes_por_minuto' => 15,
    ]);
});

function insightLancar(User $user, string $tipo, string $competencia, float $valor, ?Produto $produto = null, ?float $quantidade = null, float $valorPago = 0, ?string $vencimento = null): FinanceiroParcela
{
    $conta = Conta::query()->firstOrCreate(['nome' => 'Caixa', 'usuario_id' => $user->id]);
    $categoria = Categoria::query()->firstOrCreate(['nome' => $tipo === 'RECEITA' ? 'Vendas balcão' : 'Insumos', 'tipo' => strtolower($tipo), 'usuario_id' => $user->id]);
    $financeiro = Financeiro::query()->create([
        'forma_pagamento_id' => formaPagamentoEspecieId(),
        'descricao' => $tipo.' '.$competencia,
        'valor' => $valor,
        'tipo' => $tipo,
        'usuario_id' => $user->id,
    ]);

    return FinanceiroParcela::query()->create([
        'descricao' => $tipo.' '.$competencia,
        'data_vencimento' => $vencimento ?? $competencia,
        'data_competencia' => $competencia,
        'valor' => $valor,
        'valor_pago' => $valorPago,
        'parcela' => 1,
        'financeiro_id' => $financeiro->id,
        'conta_id' => $conta->id,
        'categoria_id' => $categoria->id,
        'produto_id' => $produto?->id,
        'quantidade' => $quantidade ?? 1,
        'usuario_id' => $user->id,
    ]);
}

function insightVender(User $user, string $data, Produto $produto, float $quantidade, float $valorUnitario): void
{
    $venda = Venda::query()->create([
        'status' => Venda::STATUS_FECHADA,
        'total' => $quantidade * $valorUnitario,
        'data_venda' => $data.' 12:00:00',
        'usuario_id' => $user->id,
    ]);

    VendaItem::query()->create([
        'venda_id' => $venda->id,
        'produto_id' => $produto->id,
        'quantidade' => $quantidade ?? 1,
        'valor_unitario' => $valorUnitario,
        'valor_total' => $quantidade * $valorUnitario,
    ]);
}

/**
 * @param  list<float>  $numeros
 * @return array<string, mixed>
 */
function insightResposta(array $numeros = [1000.0], string $tipo = 'crescimento'): array
{
    return [
        'resumo' => 'Mês positivo.',
        'insights' => [[
            'tipo' => $tipo,
            'prioridade' => 'alta',
            'titulo' => 'Receita do mês',
            'explicacao' => 'A receita foi de R$ 1.000,00.',
            'impacto_rotulo' => 'Ganho estimado',
            'impacto_valor' => 200,
            'acao' => 'Mantenha o ritmo.',
            'base' => 'Resumo do mês',
            'numeros_usados' => $numeros,
        ]],
        'resultados_acoes' => [],
    ];
}

function insightUsuarioComReceita(): User
{
    $user = User::factory()->create();
    insightLancar($user, 'RECEITA', now()->startOfMonth()->toDateString(), 1000);

    return $user;
}

it('gera a análise do período e guarda os insights com chave', function (): void {
    $user = insightUsuarioComReceita();
    AnalistaDashboard::fake([insightResposta()]);

    $this->actingAs($user)
        ->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month])
        ->assertSessionHasNoErrors();

    $analise = DashboardAnalise::query()->sole();

    expect($analise->usuario_id)->toBe($user->id)
        ->and($analise->status)->toBe(DashboardAnalise::STATUS_CONCLUIDA)
        ->and($analise->resumo)->toBe('Mês positivo.')
        ->and($analise->insights)->toHaveCount(1)
        ->and($analise->insights[0]['chave'])->toBeString()->not->toBeEmpty()
        ->and($analise->insights[0])->not->toHaveKey('numeros_usados');
    AnalistaDashboard::assertPrompted(fn ($prompt): bool => $prompt->contains('"receitas":1000'));
});

it('descarta insight que cita número fora do pacote', function (): void {
    $user = insightUsuarioComReceita();
    $resposta = insightResposta();
    $resposta['insights'][] = [...$resposta['insights'][0], 'titulo' => 'Número inventado', 'numeros_usados' => [987654.32]];
    AnalistaDashboard::fake([$resposta]);

    $this->actingAs($user)->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month]);

    $analise = DashboardAnalise::query()->sole();

    expect(collect($analise->insights)->pluck('titulo')->all())->toBe(['Receita do mês'])
        ->and($analise->insights_descartados)->toBe(1);
});

it('exige da IA entre 4 e 8 insights', function (): void {
    $schema = (new ObjectSchema((new AnalistaDashboard)->schema(new JsonSchemaTypeFactory)))->toArray();

    expect($schema['properties']['insights'])
        ->toMatchArray(['minItems' => 4, 'maxItems' => 8]);
});

it('descarta insight com tipo desconhecido', function (): void {
    $user = insightUsuarioComReceita();
    AnalistaDashboard::fake([insightResposta(tipo: 'investimento')]);

    $this->actingAs($user)->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month]);

    expect(DashboardAnalise::query()->sole()->insights)->toBe([]);
});

it('reaproveita a análise quando os dados não mudaram e gera de novo ao forçar', function (): void {
    $user = insightUsuarioComReceita();
    AnalistaDashboard::fake([insightResposta(), insightResposta()]);
    $periodo = ['ano' => now()->year, 'mes' => now()->month];

    $this->actingAs($user)->post(route('dashboard.insights.store'), $periodo);
    $this->actingAs($user)->post(route('dashboard.insights.store'), $periodo);

    expect(DashboardAnalise::query()->count())->toBe(1);
    AnalistaDashboard::assertPromptedTimes(1);

    $this->actingAs($user)->post(route('dashboard.insights.store'), [...$periodo, 'forcar' => true]);

    expect(DashboardAnalise::query()->count())->toBe(2);
});

it('bloqueia novas análises acima do limite da janela de minutos', function (): void {
    config(['insights.limite_analises' => 1]);
    $user = insightUsuarioComReceita();
    AnalistaDashboard::fake([insightResposta(), insightResposta()]);
    $periodo = ['ano' => now()->year, 'mes' => now()->month, 'forcar' => true];

    $this->actingAs($user)->post(route('dashboard.insights.store'), $periodo);
    $this->actingAs($user)->post(route('dashboard.insights.store'), $periodo)
        ->assertSessionHas('error', 'Você já gerou 1 análises nos últimos 10 minutos. Aguarde alguns minutos e tente de novo.');

    expect(DashboardAnalise::query()->count())->toBe(1);
});

it('libera nova análise quando a janela de minutos passa', function (): void {
    config(['insights.limite_analises' => 1]);
    $user = insightUsuarioComReceita();
    AnalistaDashboard::fake([insightResposta(), insightResposta()]);
    $periodo = ['ano' => now()->year, 'mes' => now()->month, 'forcar' => true];

    $this->actingAs($user)->post(route('dashboard.insights.store'), $periodo);
    $this->travel(11)->minutes();
    $this->actingAs($user)->post(route('dashboard.insights.store'), $periodo)
        ->assertSessionMissing('error');

    expect(DashboardAnalise::query()->count())->toBe(2);
});

it('devolve o job para a fila quando o provedor está sobrecarregado, sem marcar falha, e registra o motivo', function (): void {
    Queue::fake();
    Log::spy();
    $user = insightUsuarioComReceita();
    $this->actingAs($user)->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month]);
    $analise = DashboardAnalise::query()->sole();
    AnalistaDashboard::fake(fn () => throw ProviderOverloadedException::forProvider('gemini', 503));

    $job = (new GerarAnaliseDashboard($analise->id))->withFakeQueueInteractions();
    $job->handle(app(DashboardInsightsServiceInterface::class));

    $job->assertReleased(30);
    AnalistaDashboard::assertPromptedTimes(1);
    expect($analise->fresh()->status)->toBe(DashboardAnalise::STATUS_PROCESSANDO);
    Log::shouldHaveReceived('warning')
        ->withArgs(fn (string $mensagem, array $contexto): bool => str_contains($mensagem, ProviderOverloadedException::class)
            && $contexto['analise_id'] === $analise->id)
        ->once();
});

it('marca a análise como falha sem voltar para a fila quando a cota do provedor acaba, e registra no log', function (): void {
    Queue::fake();
    Log::spy();
    $user = insightUsuarioComReceita();
    $this->actingAs($user)->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month]);
    $analise = DashboardAnalise::query()->sole();
    AnalistaDashboard::fake(fn () => throw RateLimitedException::forProvider('gemini', 429));

    $job = (new GerarAnaliseDashboard($analise->id))->withFakeQueueInteractions();
    $job->handle(app(DashboardInsightsServiceInterface::class));

    $job->assertNotReleased();
    expect($analise->fresh())
        ->status->toBe(DashboardAnalise::STATUS_FALHOU)
        ->erro->toBe('Não foi possível gerar a análise agora. Tente novamente mais tarde.');
    Log::shouldHaveReceived('error')
        ->withArgs(fn (string $mensagem, array $contexto): bool => str_contains($mensagem, RateLimitedException::class)
            && $contexto['analise_id'] === $analise->id)
        ->once();
});

it('marca a análise como falha quando o job esgota o tempo na fila', function (): void {
    Queue::fake();
    $user = insightUsuarioComReceita();
    $this->actingAs($user)->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month]);
    $analise = DashboardAnalise::query()->sole();

    (new GerarAnaliseDashboard($analise->id))->failed(new RuntimeException('tempo esgotado'));

    expect($analise->fresh()->status)->toBe(DashboardAnalise::STATUS_FALHOU)
        ->and($analise->fresh()->erro)->toBe('O serviço de IA está ocupado agora. Tente de novo em alguns minutos.');
});

it('respeita o limite global de chamadas à IA por minuto, somando todos os usuários', function (): void {
    config(['insights.requisicoes_por_minuto' => 1]);
    AnalistaDashboard::fake([insightResposta(), insightResposta()]);
    $primeiro = insightUsuarioComReceita();
    $segundo = insightUsuarioComReceita();
    $periodo = ['ano' => now()->year, 'mes' => now()->month];

    $this->actingAs($primeiro)->post(route('dashboard.insights.store'), $periodo);
    $this->actingAs($segundo)->post(route('dashboard.insights.store'), $periodo);

    AnalistaDashboard::assertPromptedTimes(1);
    expect(DashboardAnalise::query()->where('usuario_id', $primeiro->id)->sole()->status)->toBe(DashboardAnalise::STATUS_CONCLUIDA)
        ->and(DashboardAnalise::query()->where('usuario_id', $segundo->id)->sole()->status)->toBe(DashboardAnalise::STATUS_PROCESSANDO);
});

it('coloca a análise na fila e não duplica enquanto ela está em andamento', function (): void {
    Queue::fake();
    $user = insightUsuarioComReceita();
    $periodo = ['ano' => now()->year, 'mes' => now()->month, 'forcar' => true];

    $this->actingAs($user)->post(route('dashboard.insights.store'), $periodo);
    $this->actingAs($user)->post(route('dashboard.insights.store'), $periodo);

    $analise = DashboardAnalise::query()->sole();

    expect($analise->status)->toBe(DashboardAnalise::STATUS_PROCESSANDO)
        ->and($analise->pacote['resumo_do_mes']['receitas'])->toBe(1000);
    Queue::assertPushed(GerarAnaliseDashboard::class, 1);
    Queue::assertPushed(GerarAnaliseDashboard::class, fn (GerarAnaliseDashboard $job): bool => $job->analiseId === $analise->id);
});

it('marca como falha a análise que ficou presa na fila', function (): void {
    Queue::fake();
    $user = insightUsuarioComReceita();
    $this->actingAs($user)->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month]);
    $this->travel(11)->minutes();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->reloadOnly('insights', fn (Assert $reload) => $reload
            ->where('insights.status', DashboardAnalise::STATUS_FALHOU)
            ->where('insights.erro', 'A análise demorou demais. Tente de novo.')
        ));
});

it('recusa período inválido', function (): void {
    $this->actingAs(User::factory()->create())
        ->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => 13])
        ->assertSessionHasErrors('mes');
});

it('registra vou fazer e dispensar com motivo e permite desfazer', function (): void {
    $user = insightUsuarioComReceita();
    AnalistaDashboard::fake([insightResposta()]);
    $this->actingAs($user)->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month]);
    $analise = DashboardAnalise::query()->sole();
    $chave = $analise->insights[0]['chave'];

    $this->actingAs($user)->post(route('dashboard.insights.acoes.store', $analise->id), ['chave' => $chave, 'acao' => 'dispensado', 'motivo' => 'nao_se_aplica']);

    $acao = InsightAcao::query()->sole();
    expect($acao->acao)->toBe('dispensado')
        ->and($acao->motivo)->toBe('nao_se_aplica')
        ->and($acao->titulo)->toBe('Receita do mês');

    $this->actingAs($user)->post(route('dashboard.insights.acoes.store', $analise->id), ['chave' => $chave, 'acao' => 'feito']);

    expect(InsightAcao::query()->sole()->acao)->toBe('feito')
        ->and(InsightAcao::query()->sole()->motivo)->toBeNull();

    $this->actingAs($user)->delete(route('dashboard.insights.acoes.destroy', [$analise->id, $chave]));

    expect(InsightAcao::query()->count())->toBe(0);
});

it('não registra ação em análise de outro usuário nem em chave inexistente', function (): void {
    $dono = insightUsuarioComReceita();
    AnalistaDashboard::fake([insightResposta()]);
    $this->actingAs($dono)->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month]);
    $analise = DashboardAnalise::query()->sole();

    $this->actingAs(User::factory()->create())
        ->post(route('dashboard.insights.acoes.store', $analise->id), ['chave' => $analise->insights[0]['chave'], 'acao' => 'feito'])
        ->assertNotFound();

    $this->actingAs($dono)
        ->post(route('dashboard.insights.acoes.store', $analise->id), ['chave' => 'inexistente', 'acao' => 'feito'])
        ->assertNotFound();

    expect(InsightAcao::query()->count())->toBe(0);
});

it('entrega a análise do período no dashboard só quando pedida, com a ação do usuário', function (): void {
    $user = insightUsuarioComReceita();
    AnalistaDashboard::fake([insightResposta()]);
    $this->actingAs($user)->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month]);
    $analise = DashboardAnalise::query()->sole();
    $this->actingAs($user)->post(route('dashboard.insights.acoes.store', $analise->id), ['chave' => $analise->insights[0]['chave'], 'acao' => 'feito']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->component('dashboard/index')->missing('insights'));

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->reloadOnly('insights', fn (Assert $reload) => $reload
                ->where('insights.id', $analise->id)
                ->where('insights.insights.0.titulo', 'Receita do mês')
                ->where('insights.insights.0.acao_usuario', 'feito')
            )
        );
});

it('monta o pacote com custo por unidade, venda e margem do mesmo produto', function (): void {
    $user = User::factory()->create();
    $frango = Produto::query()->create(['nome' => 'Frango', 'preco_compra' => 17.5, 'preco_venda' => 32.9, 'usuario_id' => $user->id]);
    $mes = now()->startOfMonth();

    foreach ([1, 2, 3] as $indice) {
        $anterior = $mes->copy()->subMonthsNoOverflow($indice);
        insightLancar($user, 'DESPESA', $anterior->toDateString(), 1750, $frango, 100);
        insightVender($user, $anterior->toDateString(), $frango, 100, 30);
    }

    insightLancar($user, 'DESPESA', $mes->toDateString(), 2450, $frango, 140);
    insightVender($user, $mes->toDateString(), $frango, 165, 30);

    $this->actingAs($user);
    $pacote = app(IndicadoresInsightsServiceInterface::class)->montar($user->id, $mes->year, $mes->month);
    $produto = collect($pacote['produtos'])->firstWhere('produto', 'Frango');

    expect($produto['compra']['custo_por_unidade'])->toBe(17.5)
        ->and($produto['compra_media_3_meses']['custo_por_unidade'])->toBe(17.5)
        ->and($produto['variacao_percentual']['custo_por_unidade'])->toBe(0.0)
        ->and($produto['variacao_percentual']['quantidade_comprada'])->toBe(40.0)
        ->and($produto['variacao_percentual']['quantidade_vendida'])->toBe(65.0)
        ->and($produto['margem']['valor'])->toBe(2062.5)
        ->and($pacote['periodo']['meses_anteriores_com_dados'])->toBe(3);
});

it('leva o histórico de ações do usuário no pacote', function (): void {
    $user = insightUsuarioComReceita();
    AnalistaDashboard::fake([insightResposta()]);
    $this->actingAs($user)->post(route('dashboard.insights.store'), ['ano' => now()->year, 'mes' => now()->month]);
    $analise = DashboardAnalise::query()->sole();
    $this->actingAs($user)->post(route('dashboard.insights.acoes.store', $analise->id), ['chave' => $analise->insights[0]['chave'], 'acao' => 'dispensado', 'motivo' => 'ja_sei']);

    $pacote = app(IndicadoresInsightsServiceInterface::class)->montar($user->id, now()->year, now()->month);

    expect($pacote['historico_do_usuario']['dispensados'][0])->toMatchArray(['titulo' => 'Receita do mês', 'motivo' => 'ja_sei'])
        ->and($pacote['historico_do_usuario']['seguidos'])->toBe([]);
});

it('não mistura dados de outro usuário no pacote', function (): void {
    $user = insightUsuarioComReceita();
    insightLancar(User::factory()->create(), 'RECEITA', now()->startOfMonth()->toDateString(), 5000);

    $this->actingAs($user);
    $pacote = app(IndicadoresInsightsServiceInterface::class)->montar($user->id, now()->year, now()->month);

    expect($pacote['resumo_do_mes']['receitas'])->toBe(1000.0);
});
