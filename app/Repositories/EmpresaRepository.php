<?php

namespace App\Repositories;

use App\DTO\EmpresasSearchDTO;
use App\Models\Empresa;
use App\Models\EmpresaModulo;
use App\Repositories\Interfaces\EmpresaRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;

class EmpresaRepository extends AbstractRepository implements EmpresaRepositoryInterface
{
    public function __construct(Empresa $empresa)
    {
        parent::__construct($empresa);
    }

    /**
     * @param  EmpresasSearchDTO|null  $data
     */
    public function index($data = null)
    {
        $query = $this->model->newQuery()->with(['segmento', 'ajustesDeModulo', 'usuarios']);

        if ($data?->busca !== null) {
            $query->where(function (Builder $subQuery) use ($data) {
                $this->applyAccentInsensitiveLike($subQuery, 'nome', $data->busca);
                $subQuery->orWhereHas('usuarios', function (Builder $usuarios) use ($data) {
                    $usuarios->where(function (Builder $campos) use ($data) {
                        $this->applyAccentInsensitiveLike($campos, 'users.name', $data->busca);
                        $campos->orWhere('users.email', 'like', '%'.mb_strtolower($data->busca).'%');
                    });
                });
            });
        }

        if ($data?->segmento_id !== null) {
            $query->where('segmento_id', $data->segmento_id);
        }

        return $query->orderBy('nome')->get();
    }

    public function findComModulos(int $id): Empresa
    {
        return $this->model->newQuery()->with(['segmento', 'ajustesDeModulo', 'usuarios'])->findOrFail($id);
    }

    public function sincronizarAjustes(int $empresaId, array $ajustes): void
    {
        EmpresaModulo::query()->where('empresa_id', $empresaId)->whereNotIn('modulo', array_keys($ajustes))->delete();

        foreach ($ajustes as $modulo => $ligado) {
            EmpresaModulo::query()->updateOrCreate(
                ['empresa_id' => $empresaId, 'modulo' => $modulo],
                ['ligado' => $ligado],
            );
        }
    }
}
