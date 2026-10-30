<?php

namespace App\Services;

use App\Models\Empresa;
use App\Repositories\Interfaces\FornecedorRepositoryInterface;
use App\Repositories\Interfaces\ProdutoRepositoryInterface;
use App\Services\Interfaces\UsuariosTransferServiceInterface;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UsuariosTransferService implements UsuariosTransferServiceInterface
{
    public function __construct(
        private ProdutoRepositoryInterface $produtoRepository,
        private FornecedorRepositoryInterface $fornecedorRepository
    ) {}

    public function contagens(int $usuarioId): array
    {
        return [
            'produtos' => $this->produtoRepository->countByEmpresa((int) Empresa::idDoUsuario($usuarioId)),
            'fornecedores' => $this->fornecedorRepository->countByEmpresa((int) Empresa::idDoUsuario($usuarioId)),
        ];
    }

    public function transfer(array $payload): array
    {
        $origem = (int) ($payload['origem_id'] ?? 0);
        $destino = (int) ($payload['destino_id'] ?? 0);
        $modulos = $payload['modulos'] ?? [];
        $migrar = (bool) ($payload['migrar_relacionamentos'] ?? false);
        $empresaOrigem = (int) Empresa::idDoUsuario($origem);
        $empresaDestino = (int) Empresa::idDoUsuario($destino);

        $max = (int) config('admin.transferencia.max', 1000);
        $chunk = (int) config('admin.transferencia.chunk', 100);

        // Contagens iniciais
        $total = 0;
        $counts = [];
        if (in_array('produtos', $modulos, true)) {
            $counts['produtos'] = $this->produtoRepository->countByEmpresa($empresaOrigem);
            $total += $counts['produtos'];
        }
        if (in_array('fornecedores', $modulos, true)) {
            $counts['fornecedores'] = $this->fornecedorRepository->countByEmpresa($empresaOrigem);
            $total += $counts['fornecedores'];
        }

        if ($total > $max) {
            return [
                'ok' => false,
                'reason' => 'total_exceeds_limit',
                'message' => "Total de registros ({$total}) excede o limite síncrono ({$max}). Use modo assíncrono.",
                'counts' => $counts,
            ];
        }

        $skipped = ['produtos' => [], 'fornecedores' => []];
        $created = ['produtos' => 0, 'fornecedores' => 0];

        DB::transaction(function () use (&$skipped, &$created, $empresaOrigem, $empresaDestino, $destino, $modulos, $migrar, $chunk) {
            // If fornecedores selected and migrate relationships true, duplicate fornecedores first to build map
            $fornecedorMap = [];
            if (in_array('fornecedores', $modulos, true)) {
                $fornecedores = $this->fornecedorRepository->getByEmpresa($empresaOrigem);
                foreach ($fornecedores->chunk($chunk) as $batch) {
                    foreach ($batch as $fornecedor) {
                        $attrs = $fornecedor->toArray();
                        unset($attrs['id'], $attrs['created_at'], $attrs['updated_at']);
                        $attrs['usuario_id'] = $destino;
                        $attrs['empresa_id'] = $empresaDestino;

                        try {
                            $novo = $this->fornecedorRepository->store($attrs);
                            $fornecedorMap[$fornecedor->id] = $novo->id;
                            $created['fornecedores']++;
                        } catch (QueryException $e) {
                            Log::warning('Fornecedor skip: '.$e->getMessage());
                            $skipped['fornecedores'][] = ['id' => $fornecedor->id, 'reason' => $e->getMessage()];
                        }
                    }
                }
            }

            // Produtos
            if (in_array('produtos', $modulos, true)) {
                $produtos = $this->produtoRepository->getByEmpresa($empresaOrigem);
                foreach ($produtos->chunk($chunk) as $batch) {
                    foreach ($batch as $produto) {
                        try {
                            // replicate the Eloquent model to preserve required attributes
                            $novo = $produto->replicate();
                            // adjust fornecedor FK if migrating and mapping exists
                            if ($migrar && $novo->fornecedor_id !== null && isset($fornecedorMap[$novo->fornecedor_id])) {
                                $novo->fornecedor_id = $fornecedorMap[$novo->fornecedor_id];
                            }
                            $novo->usuario_id = $destino;
                            $novo->empresa_id = $empresaDestino;
                            $novo->push(); // saves the model
                            $created['produtos']++;
                        } catch (QueryException $e) {
                            Log::warning('Produto skip: '.$e->getMessage());
                            $skipped['produtos'][] = ['id' => $produto->id, 'reason' => $e->getMessage()];
                        }
                    }
                }
            }
        });

        return [
            'ok' => true,
            'counts' => $created,
            'skipped' => $skipped,
        ];
    }
}
