<?php

namespace App\Http\Controllers;

use App\DTO\MenuBoardDTO;
use App\Http\Requests\StoreMenuBoardRequest;
use App\Http\Resources\MenuBoardResource;
use App\Http\Resources\ProdutoResource;
use App\Http\Resources\TvDispositivoResource;
use App\Services\Interfaces\MenuBoardsServiceInterface;
use App\Services\Interfaces\ProdutosServiceInterface;
use App\Services\Interfaces\TvPareamentoServiceInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuBoardsController extends Controller
{
    public function __construct(
        private MenuBoardsServiceInterface $menuBoardsService,
        private ProdutosServiceInterface $produtosService,
        private TvPareamentoServiceInterface $tvPareamentoService,
    ) {}

    public function index(Request $request): Response
    {
        $usuarioId = (int) $request->user()->id;

        return Inertia::render('menu-boards/index', [
            'boards' => Inertia::defer(
                fn () => MenuBoardResource::collection($this->menuBoardsService->indexDoUsuario($usuarioId))->resolve()
            ),
            'pareamento' => fn () => $this->pareamento($usuarioId),
        ]);
    }

    public function create(Request $request): Response
    {
        $usuarioId = (int) $request->user()->id;

        return Inertia::render('menu-boards/form', [
            'board' => null,
            'produtos' => fn () => ProdutoResource::collection($this->produtosService->ativosDoUsuario($usuarioId))->resolve(),
            'pareamento' => fn () => $this->pareamento($usuarioId),
        ]);
    }

    public function edit(Request $request, int $id): Response
    {
        $usuarioId = (int) $request->user()->id;
        $board = $this->menuBoardsService->findComPaginas($id, $usuarioId);

        return Inertia::render('menu-boards/form', [
            'board' => MenuBoardResource::make($board)->resolve(),
            'produtos' => fn () => ProdutoResource::collection($this->produtosService->ativosDoUsuario($usuarioId))->resolve(),
            'pareamento' => fn () => $this->pareamento($usuarioId),
        ]);
    }

    public function store(StoreMenuBoardRequest $request): RedirectResponse
    {
        try {
            $this->menuBoardsService->store(
                MenuBoardDTO::fromArray($request->validated())
            );

            return redirect()->route('menu-boards')->with('success', 'Menu Board criado com sucesso.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao criar Menu Board: '.$e->getMessage());
        }
    }

    public function update(StoreMenuBoardRequest $request, int $id): RedirectResponse
    {
        try {
            $this->menuBoardsService->update(
                $id,
                MenuBoardDTO::fromArray($request->validated())
            );

            return redirect()->route('menu-boards')->with('success', 'Menu Board atualizado com sucesso.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar Menu Board: '.$e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->menuBoardsService->delete($id);

            return redirect()->route('menu-boards')->with('success', 'Menu Board excluído com sucesso.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir Menu Board: '.$e->getMessage());
        }
    }

    public function ativar(Request $request, int $id): RedirectResponse
    {
        $board = $this->menuBoardsService->ativar($id, (int) $request->user()->id);

        return redirect()->back()->with('success', "“{$board->nome}” agora é o board da TV. A TV troca no próximo Sync.");
    }

    /**
     * @return array{url: string, pin: ?string, pin_expira_em: ?string, dispositivos: array<int, array<string, mixed>>}
     */
    private function pareamento(int $usuarioId): array
    {
        $pin = $this->tvPareamentoService->pinValidoDoUsuario($usuarioId);

        return [
            'url' => route('tv'),
            'pin' => $pin?->pin,
            'pin_expira_em' => $pin?->expira_em?->toIso8601String(),
            'dispositivos' => TvDispositivoResource::collection($this->tvPareamentoService->dispositivosDoUsuario($usuarioId))->resolve(),
        ];
    }
}
