<?php

namespace App\Repositories;

use App\DTO\UsuariosSearchDTO;
use App\Models\User;
use App\Repositories\Interfaces\UsuarioRepositoryInterface;
use Illuminate\Support\Facades\DB;

class UsuarioRepository extends AbstractRepository implements UsuarioRepositoryInterface
{
    public function __construct(User $user)
    {
        parent::__construct($user);
    }

    /**
     * @param  UsuariosSearchDTO|null  $data
     */
    public function index($data = null)
    {
        $query = $this->model->newQuery();

        if ($data instanceof UsuariosSearchDTO && $data->busca !== null) {
            $query->where(function ($subQuery) use ($data) {
                $this->applyAccentInsensitiveLike($subQuery, 'name', $data->busca);
                $subQuery->orWhere('email', 'like', '%'.$data->busca.'%');
            });
        }

        return $query->orderBy('name')->get();
    }

    public function autocomplete($q = null)
    {
        $query = $this->model->newQuery();

        if ($q !== null && $q !== '') {
            $query->where(function ($subQuery) use ($q) {
                $this->applyAccentInsensitiveLike($subQuery, 'name', $q);
                $subQuery->orWhere('email', 'like', '%'.$q.'%');
            });
        }

        return $query->orderBy('name')->limit(20)->get(['id', 'name', 'email']);
    }

    public function encerrarSessoes(int $usuarioId, ?string $excetoSessaoId = null): int
    {
        $query = DB::table(config('session.table', 'sessions'))
            ->where('user_id', $usuarioId);

        if ($excetoSessaoId !== null) {
            $query->where('id', '!=', $excetoSessaoId);
        }

        return $query->delete();
    }
}
