<?php

namespace App\Services;

use App\DTO\UsuarioDTO;
use App\Models\User;
use App\Repositories\Interfaces\UsuarioRepositoryInterface;
use App\Services\Interfaces\FornecedoresServiceInterface;
use App\Services\Interfaces\UsuariosServiceInterface;
use DomainException;
use Illuminate\Support\Facades\DB;

class UsuariosService extends ServiceAbstract implements UsuariosServiceInterface
{
    public function __construct(
        private UsuarioRepositoryInterface $usuarioRepository,
        private FornecedoresServiceInterface $fornecedoresService
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

        if ($this->isAdministrador($usuario->email)) {
            throw new DomainException('Não é possível entrar como um Administrador.');
        }

        return $usuario;
    }

    public function delete($id)
    {
        return DB::transaction(function () use ($id) {
            $this->fornecedoresService->deleteByUsuario((int) $id);

            return parent::delete($id);
        });
    }
}
