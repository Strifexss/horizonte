<?php

namespace App\Services;

use App\DTO\FormaPagamentoDTO;
use App\Exceptions\FormaPagamentoEmUsoException;
use App\Models\FormaPagamento;
use App\Repositories\Interfaces\FormaPagamentoRepositoryInterface;
use App\Services\Interfaces\FormasPagamentoServiceInterface;
use Illuminate\Support\Collection;

class FormasPagamentoService extends ServiceAbstract implements FormasPagamentoServiceInterface
{
    private const PADRAO_BLOQUEIO_MSG = 'Formas de pagamento padrão não podem ser alteradas ou excluídas.';

    public function __construct(
        private FormaPagamentoRepositoryInterface $formaPagamentoRepository
    ) {
        parent::__construct($formaPagamentoRepository);
    }

    public function ativas(): Collection
    {
        return $this->formaPagamentoRepository->ativas();
    }

    /**
     * @param  FormaPagamentoDTO  $data
     */
    public function store($data)
    {
        return parent::store([...$data->all(), 'padrao' => 0]);
    }

    /**
     * @param  FormaPagamentoDTO  $data
     */
    public function update($id, $data)
    {
        $this->assertNaoEhPadrao($this->formaPagamentoRepository->findVisivel((int) $id));

        $dados = $data->all();
        unset($dados['usuario_id']);

        return parent::update((int) $id, $dados);
    }

    public function delete($id)
    {
        $this->assertNaoEhPadrao($this->formaPagamentoRepository->findVisivel((int) $id));

        if ($this->formaPagamentoRepository->countUsos((int) $id) > 0) {
            throw new FormaPagamentoEmUsoException;
        }

        return parent::delete((int) $id);
    }

    private function assertNaoEhPadrao(FormaPagamento $formaPagamento): void
    {
        if ($formaPagamento->ehPadrao()) {
            throw new \DomainException(self::PADRAO_BLOQUEIO_MSG);
        }
    }
}
