<?php

namespace App\Services;

use App\DTO\SegmentoDTO;
use App\Repositories\Interfaces\SegmentoRepositoryInterface;
use App\Services\Interfaces\SegmentosServiceInterface;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class SegmentosService extends ServiceAbstract implements SegmentosServiceInterface
{
    public function __construct(
        private SegmentoRepositoryInterface $segmentoRepository
    ) {
        parent::__construct($segmentoRepository);
    }

    public function ativos(): Collection
    {
        return $this->segmentoRepository->ativos();
    }

    /**
     * @param  SegmentoDTO  $data
     */
    public function store($data)
    {
        return $this->segmentoRepository->store([...$this->dados($data), 'chave' => $this->chaveLivre($data->nome)]);
    }

    /**
     * A chave não muda depois de criada: ela identifica o Segmento para o código e a cobrança futura.
     *
     * @param  SegmentoDTO  $data
     */
    public function update($id, $data)
    {
        return $this->segmentoRepository->update((int) $id, $this->dados($data));
    }

    public function delete($id)
    {
        if ($this->segmentoRepository->contarEmpresas((int) $id) > 0) {
            throw new DomainException('Há empresas neste segmento. Mova-as para outro segmento antes de excluir.');
        }

        return parent::delete($id);
    }

    /**
     * @return array{nome: string, descricao: ?string, modulos: list<string>, ativo: bool}
     */
    private function dados(SegmentoDTO $data): array
    {
        return [
            'nome' => $data->nome,
            'descricao' => $data->descricao,
            'modulos' => array_values(array_unique($data->modulos)),
            'ativo' => $data->ativo,
        ];
    }

    private function chaveLivre(string $nome): string
    {
        $base = Str::slug($nome, '_') ?: 'segmento';
        $chave = $base;

        for ($sufixo = 2; $this->segmentoRepository->chaveEmUso($chave); $sufixo++) {
            $chave = $base.'_'.$sufixo;
        }

        return $chave;
    }
}
