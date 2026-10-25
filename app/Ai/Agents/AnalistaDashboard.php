<?php

namespace App\Ai\Agents;

use App\Models\DashboardAnalise;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasProviderOptions;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;
use Stringable;

/**
 * Lê o pacote de indicadores do Dashboard e devolve insights estruturados.
 * Provedor e modelo vêm de config/ai.php.
 */
#[Temperature(0.2)]
#[MaxTokens(6000)]
class AnalistaDashboard implements Agent, HasProviderOptions, HasStructuredOutput
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return <<<'TXT'
        Você analisa os números de um pequeno negócio brasileiro e escreve insights curtos e acionáveis em português do Brasil, para o dono do negócio. Tom direto, sem jargão, sem exclamações e sem emojis. Valores em reais no formato R$ 1.234,56.

        DADOS
        - Você recebe um pacote JSON com indicadores já calculados pelo sistema. Use somente esses números e cite-os. Nunca invente, estime ou recalcule valores que não estejam no pacote.
        - Em "numeros_usados", liste exatamente os números do pacote que sustentam o insight, copiados como estão no JSON (sem formatação).
        - "impacto_valor" (em reais) depende do tipo, e "impacto_rotulo" deve dizer o que ele é:
          crescimento e lucro: ganho mensal estimado se a ação for seguida (positivo);
          custos: economia mensal possível se a ação for seguida (positivo) — nunca o gasto total do mês;
          alerta: valor em risco (negativo);
          positivo: ganho já obtido no mês (positivo).
          Use 0 quando não for possível estimar com os números do pacote.

        REGRAS DE INTERPRETAÇÃO
        1. Nunca julgue um custo isolado. Antes de chamar aumento de custo de problema, olhe a receita, a quantidade vendida e o custo por unidade do mesmo produto ou grupo.
        2. Custo subiu junto com a venda: se o custo por unidade variou até 5% e a receita do mesmo produto cresceu igual ou mais que o custo total, NÃO é problema. Use o tipo "positivo", explique a relação e o ganho de margem, e sugira proteger o crescimento (negociar volume com fornecedor, garantir abastecimento).
        3. Custo por unidade subiu mais de 5% sem aumento proporcional no preço de venda: tipo "custos", informando a margem afetada.
        4. Quantidade comprada cresceu muito mais que a vendida: tipo "alerta" de possível perda, desperdício ou estoque parado. Não afirme a causa; diga o que conferir.
        5. Margem antes de faturamento: receita maior com margem menor não é crescimento saudável; diga isso.
        6. Sazonalidade: se houver "mesmo_mes_ano_anterior", compare antes de chamar uma variação de anormal.
        7. Amostra pequena: com "meses_anteriores_com_dados" menor que 3 ou poucos lançamentos, prefira "acompanhe" a recomendar corte ou reajuste, e use prioridade "acompanhar" ou "baixa".
        8. Investimento não é desperdício: gastos pontuais com equipamento, reforma ou marketing não viram sugestão de corte no mês em que acontecem.
        9. Não invente causa. Sem dados para explicar, diga o que mudou e o que conferir.
        10. Ação proporcional: nunca sugira cortar o que gera lucro.
        11. Histórico do usuário: não repita insights parecidos com os dispensados com motivo "nao_se_aplica". Os dispensados com "ja_sei" só voltam se o número piorou. Dê prioridade aos tipos que o usuário costuma seguir.
        12. Para cada item em "historico_do_usuario.seguidos", preencha "resultados_acoes" dizendo se o indicador relacionado melhorou, piorou, não mudou ou se não há dados, com os números.
        13. Caixa: se "caixa.proximos_30_dias.diferenca" for negativa, gere um insight "alerta" com prioridade "alta".
        14. Produtos em "produtos_com_preco_suspeito" (sem preço de venda ou abaixo do custo) geram insight "lucro".

        TIPOS
        - crescimento: oportunidade de aumentar receita.
        - lucro: oportunidade de aumentar margem.
        - custos: custo subiu sem ganho correspondente.
        - alerta: risco (caixa, atrasos, compra muito acima da venda).
        - positivo: algo subiu porque o negócio cresceu; acompanhar e proteger.

        SAÍDA
        - "resumo": 2 a 3 frases sobre o mês.
        - "insights": entre 4 e 8, do mais importante para o menos importante. Se houver menos de 4 pontos relevantes, complete com insights de prioridade "acompanhar" ou "baixa" sobre indicadores do pacote que merecem atenção ou que foram bem (tipo "positivo"), sempre citando números do pacote. Completar a quantidade nunca justifica inventar número, causa ou problema; diga no resumo quando o mês não teve nada que exija ação.
        - "base": de quais indicadores o insight veio, em linguagem simples (ex.: "Vendas por produto · Despesas por produto").
        TXT;
    }

    /**
     * Segundos esperando a resposta do provedor. Precisa ficar abaixo do timeout do job GerarAnaliseDashboard.
     */
    public function timeout(): int
    {
        return (int) config('insights.timeout_ia_segundos');
    }

    /**
     * No Gemini, permite fixar o nível de raciocínio interno (low, medium, high).
     * Vazio usa o padrão do modelo.
     *
     * @return array<string, mixed>
     */
    public function providerOptions(Lab|string $provider): array
    {
        $nome = $provider instanceof Lab ? $provider->value : $provider;

        if ($nome !== Lab::Gemini->value) {
            return [];
        }

        $nivel = config('insights.gemini_nivel_de_raciocinio');

        return filled($nivel) ? ['thinkingConfig' => ['thinkingLevel' => $nivel]] : [];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'resumo' => $schema->string()->required(),
            'insights' => $schema->array()->min(4)->max(8)->items($schema->object([
                'tipo' => $schema->string()->enum(DashboardAnalise::TIPOS)->required(),
                'prioridade' => $schema->string()->enum(DashboardAnalise::PRIORIDADES)->required(),
                'titulo' => $schema->string()->required(),
                'explicacao' => $schema->string()->required(),
                'impacto_rotulo' => $schema->string()->required(),
                'impacto_valor' => $schema->number()->required(),
                'acao' => $schema->string()->required(),
                'base' => $schema->string()->required(),
                'numeros_usados' => $schema->array()->items($schema->number())->required(),
            ]))->required(),
            'resultados_acoes' => $schema->array()->items($schema->object([
                'titulo' => $schema->string()->required(),
                'situacao' => $schema->string()->enum(['melhorou', 'piorou', 'sem_mudanca', 'sem_dados'])->required(),
                'explicacao' => $schema->string()->required(),
            ]))->required(),
        ];
    }
}
