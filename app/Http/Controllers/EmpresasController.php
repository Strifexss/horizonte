<?php

namespace App\Http\Controllers;

use App\DTO\EmpresaModulosDTO;
use App\DTO\EmpresasSearchDTO;
use App\Http\Requests\EmpresaModulosRequest;
use App\Http\Requests\EmpresasSearchRequest;
use App\Http\Resources\EmpresaResource;
use App\Http\Resources\SegmentoResource;
use App\Models\Segmento;
use App\Services\Interfaces\EmpresasServiceInterface;
use App\Services\Interfaces\SegmentosServiceInterface;
use Inertia\Inertia;

class EmpresasController extends Controller
{
    public function __construct(
        private EmpresasServiceInterface $empresasService,
        private SegmentosServiceInterface $segmentosService
    ) {}

    public function index(EmpresasSearchRequest $request)
    {
        $filters = EmpresasSearchDTO::fromArray($request->validated());

        return Inertia::render('admin/empresas/index', [
            'filters' => ['busca' => $filters->busca, 'segmento_id' => $filters->segmento_id],
            'urls' => [
                'index' => route('admin.empresas'),
            ],
            'segmentos' => SegmentoResource::collection($this->segmentosService->index())->resolve(),
            'modulos_opcionais' => collect(Segmento::MODULOS_OPCIONAIS)
                ->map(fn (array $modulo, string $chave) => ['chave' => $chave, ...$modulo])
                ->values(),
            'empresas' => Inertia::defer(
                fn () => EmpresaResource::collection($this->empresasService->index($filters))->resolve()
            ),
        ]);
    }

    public function update(EmpresaModulosRequest $request, int $id)
    {
        $this->empresasService->atualizarModulos($id, EmpresaModulosDTO::fromArray($request->validated()));

        return redirect()->back()->with('success', 'Empresa atualizada com sucesso.');
    }
}
