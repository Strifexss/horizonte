<?php

namespace App\Services;

use App\DTO\UsuarioDTO;
use App\Models\Empresa;
use App\Models\User;
use App\Repositories\Interfaces\UsuarioRepositoryInterface;
use App\Services\Interfaces\EmpresasServiceInterface;
use App\Services\Interfaces\FornecedoresServiceInterface;
use App\Services\Interfaces\UsuariosServiceInterface;
use DomainException;
use Illuminate\Support\Facades\DB;

class UsuariosService extends ServiceAbstract implements UsuariosServiceInterface
{
    public function __construct(
        private UsuarioRepositoryInterface $usuarioRepository,
        private FornecedoresServiceInterface $fornecedoresService,
        private EmpresasServiceInterface $empresasService
    ) {
        parent::__construct($usuarioRepository);
    }

    public function isAdministrador(?string $email): bool
    {
        if ($email === null || $email === '') {
            return false;
        }

        return in_array(mb_strtolower(trim($email)), config('admin.emails', []), true);
    }

    /**
     * Conta criada pelo Administrador nasce com a sua Empresa, ainda com nome a confirmar.
     *
     * @param  UsuarioDTO  $data
     */
    public function store($data)
    {
        return DB::transaction(function () use ($data) {
            $usuario = parent::store($data);

            $this->empresasService->criarParaUsuario($usuario);

            return $usuario;
        });
    }

    /**
     * @param  UsuarioDTO  $data
     */
    public function update($id, $data, ?string $sessaoAtualId = null)
    {
        return DB::transaction(function () use ($id, $data, $sessaoAtualId) {
            $usuario = parent::update($id, $data);

            if ($data instanceof UsuarioDTO && $data->password !== null) {
                $this->usuarioRepository->encerrarSessoes((int) $id, $sessaoAtualId);
            }

            return $usuario;
        });
    }

    public function entrarComo(int $id): User
    {
        /** @var User $usuario */
        $usuario = $this->usuarioRepository->find($id);

        if (! $usuario->ehContaGoogle() && $this->isAdministrador($usuario->email)) {
            throw new DomainException('Não é possível entrar como um Administrador.');
        }

        return $usuario;
    }

    public function delete($id)
    {
        return DB::transaction(function () use ($id) {
            $empresasSoDele = Empresa::query()
                ->whereHas('usuarios', fn ($query) => $query->whereKey($id))
                ->withCount('usuarios')
                ->get()
                ->filter(fn (Empresa $empresa) => $empresa->usuarios_count === 1);

            foreach ($empresasSoDele as $empresa) {
                $this->fornecedoresService->deleteByEmpresa($empresa->id);
                $empresa->delete();
            }

            return parent::delete($id);
        });
    }
}
