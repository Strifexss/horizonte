<?php

use App\Http\Controllers\TvController;
use App\Models\TvDispositivo;
use App\Models\TvPareamentoPin;
use App\Models\User;
use App\Repositories\Interfaces\TvPareamentoPinRepositoryInterface;
use App\Repositories\TvPareamentoPinRepository;
use Illuminate\Database\UniqueConstraintViolationException;

function pinValido(User $user, string $pin = '7492'): TvPareamentoPin
{
    return TvPareamentoPin::query()->create([
        'usuario_id' => $user->id,
        'pin' => $pin,
        'expira_em' => now()->addMinutes(10),
    ]);
}

it('gera pin de 4 digitos e invalida o anterior', function (): void {
    $user = User::factory()->create();
    $anterior = pinValido($user, '1111');

    $this->actingAs($user)
        ->post(route('tv.pin.store'))
        ->assertSessionHas('success');

    $novo = TvPareamentoPin::query()->where('usuario_id', $user->id)->latest('id')->first();

    expect($novo->pin)->toMatch('/^\d{4}$/')
        ->and($novo->expira_em->isFuture())->toBeTrue()
        ->and($anterior->fresh()->expira_em->isFuture())->toBeFalse();
});

it('gera pin valido por exatamente 10 minutos', function (): void {
    $this->freezeSecond();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('tv.pin.store'));

    $pin = TvPareamentoPin::query()->where('usuario_id', $user->id)->sole();

    expect($pin->expira_em->equalTo(now()->addMinutes(10)))->toBeTrue();
});

it('libera os codigos de pins usados ou expirados ao gerar um novo', function (): void {
    $outro = User::factory()->create();
    $usado = pinValido($outro, '1111');
    $usado->update(['usado_em' => now()]);
    $expirado = pinValido($outro, '2222');
    $expirado->update(['expira_em' => now()->subMinute()]);
    $valido = pinValido($outro, '3333');

    $this->actingAs(User::factory()->create())->post(route('tv.pin.store'));

    expect($usado->fresh())->toBeNull()
        ->and($expirado->fresh())->toBeNull()
        ->and($valido->fresh())->not->toBeNull();
});

it('nao permite dois pins com o mesmo codigo', function (): void {
    pinValido(User::factory()->create(), '7492');

    expect(fn () => pinValido(User::factory()->create(), '7492'))
        ->toThrow(UniqueConstraintViolationException::class);
});

it('recusa pin consumido por outro pareamento entre a leitura e o uso', function (): void {
    pinValido(User::factory()->create());

    app()->bind(TvPareamentoPinRepositoryInterface::class, fn () => new class(new TvPareamentoPin) extends TvPareamentoPinRepository
    {
        public function findValido(string $pin): ?TvPareamentoPin
        {
            $encontrado = parent::findValido($pin);
            TvPareamentoPin::query()->whereKey($encontrado->id)->update(['usado_em' => now()]);

            return $encontrado;
        }
    });

    $this->post(route('tv.parear'), ['pin' => '7492'])
        ->assertSessionHasErrors('pin')
        ->assertCookieMissing(TvController::COOKIE_DISPOSITIVO);

    expect(TvDispositivo::query()->count())->toBe(0);
});

it('pareia a tv com pin valido e guarda somente o hash do token', function (): void {
    $user = User::factory()->create();
    $pin = pinValido($user);

    $response = $this->post(route('tv.parear'), ['pin' => '7492'])
        ->assertRedirect(route('tv'))
        ->assertCookie(TvController::COOKIE_DISPOSITIVO);

    $token = $response->getCookie(TvController::COOKIE_DISPOSITIVO)->getValue();
    $dispositivo = TvDispositivo::query()->sole();

    expect($dispositivo->usuario_id)->toBe($user->id)
        ->and($dispositivo->token_hash)->toBe(hash('sha256', $token))
        ->and($dispositivo->token_hash)->not->toBe($token)
        ->and($pin->fresh()->usado_em)->not->toBeNull();
});

it('recusa pin usado expirado ou inexistente', function (string $situacao): void {
    $user = User::factory()->create();
    $pin = pinValido($user);

    if ($situacao === 'usado') {
        $pin->update(['usado_em' => now()]);
    }

    if ($situacao === 'expirado') {
        $pin->update(['expira_em' => now()->subMinute()]);
    }

    $digitado = $situacao === 'inexistente' ? '0000' : '7492';

    $this->post(route('tv.parear'), ['pin' => $digitado])
        ->assertSessionHasErrors('pin')
        ->assertCookieMissing(TvController::COOKIE_DISPOSITIVO);

    expect(TvDispositivo::query()->count())->toBe(0);
})->with(['usado', 'expirado', 'inexistente']);

it('recusa pin fora do formato', function (): void {
    $this->post(route('tv.parear'), ['pin' => '12a4'])
        ->assertSessionHasErrors('pin');
});

it('limita tentativas de pareamento por minuto', function (): void {
    foreach (range(1, 5) as $tentativa) {
        $this->post(route('tv.parear'), ['pin' => '0000'])->assertSessionHasErrors('pin');
    }

    $this->post(route('tv.parear'), ['pin' => '0000'])->assertTooManyRequests();
});

it('desconecta tv do proprio usuario', function (): void {
    $user = User::factory()->create();
    $dispositivo = TvDispositivo::query()->create(['usuario_id' => $user->id, 'token_hash' => hash('sha256', 'token')]);

    $this->actingAs($user)
        ->delete(route('tv.dispositivos.destroy', $dispositivo->id))
        ->assertSessionHas('success');

    expect($dispositivo->fresh()->revogado_em)->not->toBeNull();
});

it('nao desconecta tv de outro usuario', function (): void {
    $dispositivo = TvDispositivo::query()->create([
        'usuario_id' => User::factory()->create()->id,
        'token_hash' => hash('sha256', 'token'),
    ]);

    $this->actingAs(User::factory()->create())
        ->delete(route('tv.dispositivos.destroy', $dispositivo->id))
        ->assertNotFound();

    expect($dispositivo->fresh()->revogado_em)->toBeNull();
});
