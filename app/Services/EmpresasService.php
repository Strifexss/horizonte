<?php

namespace App\Services;

use App\DTO\EmpresaModulosDTO;
use App\Models\Empresa;
use App\Models\Segmento;
use App\Models\User;
use App\Repositories\Interfaces\EmpresaRepositoryInterface;
use App\Services\Interfaces\EmpresasServiceInterface;
use Illuminate\Support\Facades\DB;

class EmpresasService extends ServiceAbstract implements EmpresasServiceInterface
{
    public function __construct(
        private EmpresaRepositoryInterface $empresaRepository
    ) {
        parent::__construct($empresaRepository);
    }

    public function criarNoOnboarding(User $usuario, string $nome, int $segmentoId): Empresa
    {
        return DB::transaction(function () use ($usuario, $nome, $segmentoId) {
            $empresa = $this->empresaRepository->store([
                'nome' => $nome,
                'segmento_id' => $segmentoId,
                'nome_confirmado_em' => now(),
            ]);

            $this->vincularAdminMaster($usuario, $empresa);

            return $empresa;
        });
    }

    public function criarParaUsuario(User $usuario): Empresa
    {
        $empresa = $this->empresaRepository->store([
            'nome' => mb_substr('Empresa de '.$usuario->name, 0, 120),
            'segmento_id' => Segmento::varejoId(),
        ]);

        $this->vincularAdminMaster($usuario, $empresa);

        return $empresa;
    }

    public function confirmarNome(Empresa $empresa, string $nome): Empresa
    {
        $empresa->update([
            'nome' => $nome,
            'nome_confirmado_em' => now(),
        ]);

        return $empresa;
    }

    public function findComModulos(int $id): Empresa
    {
        return $this->empresaRepository->findComModulos($id);
    }

    public function atualizarModulos(int $id, EmpresaModulosDTO $dados): Empresa
    {
        return DB::transaction(function () use ($id, $dados) {
            $this->empresaRepository->update($id, ['segmento_id' => $dados->segmento_id]);
            $this->empresaRepository->sincronizarAjustes($id, $dados->ajustesExplicitos());

            return $this->empresaRepository->findComModulos($id);
        });
    }

    private function vincularAdminMaster(User $usuario, Empresa $empresa): void
    {
        $usuario->empresas()->attach($empresa->id, ['cargo' => Empresa::CARGO_ADMIN_MASTER]);
        $usuario->esquecerEmpresaAtiva();
    }
}
