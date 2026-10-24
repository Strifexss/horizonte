<?php

namespace App\Http\Controllers;

use App\DTO\NovidadeDTO;
use App\Http\Requests\AlterarStatusNovidadeRequest;
use App\Http\Requests\StoreNovidadeRequest;
use App\Http\Resources\ImagemDiretorioResource;
use App\Http\Resources\NovidadeResource;
use App\Http\Resources\UsuarioDispensaResource;
use App\Models\Novidade;
use App\Models\User;
use App\Services\Interfaces\NovidadesServiceInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NovidadesController extends Controller
{
    public function __construct(
        private NovidadesServiceInterface $novidadesService
    ) {}

    public function index(Request $request)
    {
        $novidadeId = $request->integer('novidade');

        return Inertia::render('admin/novidades/index', [
            'urls' => [
                'usuarios' => route('admin.usuarios'),
                'index' => route('admin.novidades'),
                'store' => route('admin.novidades.store'),
            ],
            'novidades' => Inertia::defer(
                fn () => NovidadeResource::collection($this->novidadesService->index())->resolve()
            ),
            'imagens' => Inertia::optional(
                fn () => ImagemDiretorioResource::collection($this->novidadesService->diretorioImagens())->resolve()
            ),
            'dispensas' => Inertia::optional(
                fn () => $this->novidadesService->usuariosDaNovidade($novidadeId)
                    ->map(fn (User $usuario): array => (new UsuarioDispensaResource($usuario, $novidadeId))->resolve())
                    ->all()
            ),
        ]);
    }

    public function relancar(int $id)
    {
        try {
            $this->novidadesService->relancar($id);

            return redirect()->route('admin.novidades', ['novidade' => $id])->with('success', 'Novidade relançada para todos os usuários.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\DomainException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao relançar novidade: '.$e->getMessage());
        }
    }

    public function marcarDispensa(int $id, int $usuarioId)
    {
        try {
            $this->novidadesService->marcarDispensa($id, $usuarioId);

            return redirect()->route('admin.novidades', ['novidade' => $id])->with('success', 'O pop-up desta novidade não abrirá mais para o usuário.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao marcar dispensa: '.$e->getMessage());
        }
    }

    public function desmarcarDispensa(int $id, int $usuarioId)
    {
        try {
            $this->novidadesService->desmarcarDispensa($id, $usuarioId);

            return redirect()->route('admin.novidades', ['novidade' => $id])->with('success', 'A novidade voltará a abrir para o usuário.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao desmarcar dispensa: '.$e->getMessage());
        }
    }

    public function excluirImagem(string $arquivo)
    {
        try {
            $this->novidadesService->excluirImagemDoDiretorio($arquivo);

            return redirect()->route('admin.novidades')->with('success', 'Imagem excluída com sucesso.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir imagem: '.$e->getMessage());
        }
    }

    public function store(StoreNovidadeRequest $request)
    {
        try {
            $this->novidadesService->store(NovidadeDTO::fromArray($request->validated()));

            return redirect()->route('admin.novidades')->with('success', 'Novidade criada como rascunho.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao criar novidade: '.$e->getMessage());
        }
    }

    public function update(StoreNovidadeRequest $request, int $id)
    {
        try {
            $this->novidadesService->update($id, NovidadeDTO::fromArray($request->validated()));

            return redirect()->route('admin.novidades')->with('success', 'Novidade atualizada com sucesso.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao atualizar novidade: '.$e->getMessage());
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->novidadesService->delete($id);

            return redirect()->route('admin.novidades')->with('success', 'Novidade excluída com sucesso.');
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao excluir novidade: '.$e->getMessage());
        }
    }

    public function status(AlterarStatusNovidadeRequest $request, int $id)
    {
        try {
            $novidade = $this->novidadesService->alterarStatus($id, $request->validated('status'));

            return redirect()->route('admin.novidades')->with(
                'success',
                $novidade->status === Novidade::STATUS_PUBLICADO ? 'Novidade publicada.' : 'Novidade voltou para rascunho.'
            );
        } catch (ModelNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao alterar status: '.$e->getMessage());
        }
    }
}
