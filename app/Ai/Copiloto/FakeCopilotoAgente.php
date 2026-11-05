<?php

namespace App\Ai\Copiloto;

use App\Ai\Agents\Copiloto;
use App\Ai\Contracts\CopilotoAgenteInterface;
use App\DTO\CopilotoContextoDTO;
use App\DTO\CopilotoRespostaDTO;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Responde sem chamar a IA (COPILOTO_AGENTE=fake), para desenvolvimento local e prints.
 * Usa o fake do próprio SDK, então a conversa é gravada pelo mesmo caminho da implementação real.
 */
class FakeCopilotoAgente implements CopilotoAgenteInterface
{
    public function __construct(
        private LaravelAiCopilotoAgente $agenteReal
    ) {}

    public function responder(string $mensagem, ?string $conversaId, CopilotoContextoDTO $contexto, User $user): CopilotoRespostaDTO
    {
        Copiloto::fake(fn (string $prompt): array => $this->respostaSimulada($prompt));

        return $this->agenteReal->responder($mensagem, $conversaId, $contexto, $user);
    }

    /**
     * @return array{resposta: string, respondeu: bool}
     */
    private function respostaSimulada(string $pergunta): array
    {
        $texto = Str::lower(Str::ascii($pergunta));

        return match (true) {
            str_contains($texto, 'quanto') || str_contains($texto, 'gastei') || str_contains($texto, 'vendi') => [
                'resposta' => 'Não consigo consultar valores nem lançamentos da sua Empresa. Você encontra isso no **Extrato**: filtre pelo período e veja os totais de **Entradas**, **Saídas** e **Saldo Total** no topo da tela.',
                'respondeu' => true,
            ],
            str_contains($texto, 'despesa') => [
                'resposta' => "1. Abra o **Extrato** e toque em **+ Novo Lançamento**.\n2. Escolha a aba **Despesa**.\n3. Preencha **Descrição**, **Conta**, **Categoria**, **Valor**, **Forma de pagamento** e **Data**.\n4. Se já pagou, informe o **Valor pago**.\n5. Toque em **Adicionar**.",
                'respondeu' => true,
            ],
            str_contains($texto, 'venda') => [
                'resposta' => "1. Em **Vendas**, toque em **+ Nova Venda**.\n2. Busque os produtos pelo nome ou código e ajuste a quantidade.\n3. Em **Pagamentos**, escolha a forma e o valor.\n4. Toque em **Salvar venda**.\n\nSe os pagamentos somarem o total, a venda fica **Fechada** e a receita vai para o Extrato.",
                'respondeu' => true,
            ],
            str_contains($texto, 'tv') || str_contains($texto, 'cardapio') => [
                'resposta' => 'Mostrar o cardápio na TV faz parte do **Menu Board**, que a sua Empresa ainda não tem. Com ele, a TV do balcão mostra seus produtos e preços, com páginas que se alternam sozinhas e destaques como "Mais pedido". Para contratar, fale com o suporte pelo botão abaixo.',
                'respondeu' => true,
            ],
            str_contains($texto, 'produto') => [
                'resposta' => "1. Em **Produtos**, toque em **+ Novo Produto**.\n2. Preencha o **Nome** e o **Preço de compra** (obrigatórios).\n3. Se quiser, informe **Preço de venda**, **Fornecedor** e **Grupo**.\n4. Deixe **Produto ativo** marcado e salve.",
                'respondeu' => true,
            ],
            default => [
                'resposta' => 'Não encontrei isso na ajuda do Horizonte. O suporte pode te ajudar pelo WhatsApp.',
                'respondeu' => false,
            ],
        };
    }
}
