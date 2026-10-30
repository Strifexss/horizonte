<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;
use Throwable;

class GoogleController extends Controller
{
    /**
     * Envia o visitante para a tela de consentimento do Google.
     */
    public function redirect(): SymfonyRedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Entra com a conta Google; no primeiro acesso cria a conta (independente da conta com senha de mesmo e-mail).
     */
    public function callback(Request $request): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $erro) {
            report($erro);

            return to_route('login')->withErrors(['email' => 'Não foi possível entrar com o Google. Tente de novo.']);
        }

        $user = User::query()->where('google_id', $googleUser->getId())->first();

        if (! $user) {
            $user = new User;
            $user->forceFill([
                'name' => $googleUser->getName() ?: $googleUser->getEmail(),
                'email' => mb_strtolower((string) $googleUser->getEmail()),
                'google_id' => (string) $googleUser->getId(),
                'password' => null,
                'email_verified_at' => now(),
            ])->save();
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
