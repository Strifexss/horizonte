<?php

namespace App\Http\Controllers;

use App\DTO\SegmentoDTO;
use App\Http\Requests\SegmentoRequest;
use App\Http\Resources\SegmentoResource;
use App\Models\Segmento;
use App\Services\Interfaces\SegmentosServiceInterface;
use DomainException;
use Inertia\Inertia;

class SegmentosController extends Controller
{
    public function __construct(
        private SegmentosServiceInterface $segmentosService
    ) {}

    public function index()
    {
        return Inertia::render('admin/segmentos/index', [
            'urls' => [
                'store' => route('admin.segmentos.store'),
            ],
            'modulos_opcionais' => collect(Segmento::MODULOS_OPCIONAIS)
                ->map(fn (array $modulo, string $chave) => ['chave' => $chave, ...$modulo])
                ->values(),
            'modulos_obrigatorios' => Segmento::MODULOS_OBRIGATORIOS,
            'segmentos' => Inertia::defer(
                fn () => SegmentoResource::collection($this->segmentosService->index())->resolve()
            ),
        ]);
    }

    public function store(SegmentoRequest $request)
    {
        $this->segmentosService->store(SegmentoDTO::fromArray($request->validated()));

        return redirect()->route('admin.segmentos')->with('success', 'Segmento criado com sucesso.');
    }

    public function update(SegmentoRequest $request, int $id)
    {
        $this->segmentosService->update($id, SegmentoDTO::fromArray($request->validated()));

        return redirect()->route('admin.segmentos')->with('success', 'Segmento atualizado com sucesso.');
    }

    public function destroy(int $id)
    {
        try {
            $this->segmentosService->delete($id);
        } catch (DomainException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->route('admin.segmentos')->with('success', 'Segmento excluído com sucesso.');
    }
}
