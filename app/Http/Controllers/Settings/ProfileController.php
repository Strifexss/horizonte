<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\Interfaces\UsuariosServiceInterface;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $dados = $request->validated();

        if ($request->user()->ehContaGoogle()) {
            unset($dados['email']);
        }

        $request->user()->fill($dados);

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request, UsuariosServiceInterface $usuariosService): RedirectResponse
    {
        $user = $request->user();

        if (! $user->ehContaGoogle()) {
            $request->validate([
                'password' => ['required', 'current_password'],
            ]);
        }

        Auth::logout();

        $usuariosService->delete($user->id);

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
