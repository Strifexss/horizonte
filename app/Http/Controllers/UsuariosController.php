<?php

namespace App\Http\Controllers;

use App\DTO\UsuarioDTO;
use App\DTO\UsuariosSearchDTO;
use App\Http\Requests\TransferirDadosRequest;
use App\Http\Requests\UsuarioRequest;
use App\Http\Requests\UsuariosSearchRequest;
use App\Http\Resources\UsuarioResource;
use App\Services\Interfaces\UsuariosServiceInterface;
use App\Services\Interfaces\UsuariosTransferServiceInterface;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UsuariosController extends Controller
{
    public function __construct(
        private UsuariosServiceInterface $usuariosService, private UsuariosTransferServiceInterface $transferService
    ) {}

    public function index(UsuariosSearchRequest $request)
    {
        $filters = UsuariosSearchDTO::fromArray($request->validated());

        return Inertia::render('admin/usuarios/index', [
            'filters' => ['busca' => $filters->busca],
            'urls' => [
                'index' => route('admin.usuarios'),
                'store' => route('admin.usuarios.store'),
                'autocomplete' => route('admin.usuarios.autocomplete'),
                'transfer' => route('admin.usuarios.transfer'),
                'transfer_counts' => route('admin.usuarios.transfer.counts', '__ID__'),
                'novidades' => route('admin.novidades'),
            ],
            'usuarios' => Inertia::defer(
                fn () => UsuarioResource::collection($this->usuariosService->index($filters))->resolve()
            ),
        ]);
    }

    public function store(UsuarioRequest $request)
    {
        try {
            $this->usuariosService->store(UsuarioDTO::fromArray($request->validated()));

            return redirect()->route('admin.usuarios')->with('success', 'Usuário criado com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao criar usuário: '.$e->getMessage());
        }
    }

    public function update(UsuarioRequest $request, $id)
    {
        try {
            $this->usuariosService->update(
                $id,
                UsuarioDTO::fromArray($request->validated()),
                $request->session()->getId()
            );

            return redirect()->route('admin.usuarios')->with('success', 'Usuário atualizado com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar usuário: '.$e->getMessage());
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $this->usuariosService->delete($id);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir usuário: '.$e->getMessage());
        }

        if ((int) $id === $request->user()->id) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/');
        }

        return redirect()->route('admin.usuarios')->with('success', 'Usuário excluído com sucesso.');
    }

    public function entrarComo(Request $request, $id)
    {
        try {
            $usuario = $this->usuariosService->entrarComo((int) $id);
        } catch (DomainException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        Auth::guard('web')->login($usuario);
        $request->session()->regenerate();
        $request->session()->regenerateToken();

        return redirect()->route('dashboard');
    }

    public function transfer(TransferirDadosRequest $request)
    {
        $payload = $request->validated();

        $result = $this->transferService->transfer($payload);

        if (! ($result['ok'] ?? false)) {
            return redirect()->back()->with('error', $result['message'] ?? 'Erro na transferência')->with('transfer_counts', $result['counts'] ?? []);
        }

        return redirect()->back()->with('success', 'Transferência de dados concluída com sucesso!')->with('transfer_result', $result);
    }

    public function transferCounts($id)
    {
        return response()->json($this->transferService->contagens((int) $id));
    }

    public function autocomplete(Request $request)
    {
        $usuarios = $this->usuariosService->autocomplete((string) $request->query('q', ''));

        return response()->json($usuarios->map(fn ($usuario) => [
            'id' => $usuario->id,
            'nome' => "{$usuario->name} ({$usuario->email})",
        ])->values());
    }
}
