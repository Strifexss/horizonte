# Análise com IA no Dashboard

Status: ready-for-human

Planejamento de 24/10/2026. Design no canvas "Menu Board Digital", linha "Dashboard · Análise com IA" (IaDashboard, IaCarregando, IaPainel, IaMobile).

## Objetivo

Botão "Analisar com IA" no Dashboard que lê os números do Período de referência e devolve insights de crescimento, lucro e redução de custos, com ação sugerida e impacto em R$.

## Experiência

- Botão no topo do Dashboard, ao lado do Período de referência.
- Abre um painel sobre a área de conteúdo; a sidebar continua visível. No mobile ocupa a tela inteira.
- Carregando: três etapas (lendo os números, comparando com os 3 meses anteriores, escrevendo) e skeleton dos cards.
- Resultado:
  - Resumo do mês em texto e totais (receita e lucro a ganhar, custos a reduzir, alertas de caixa).
  - Bloco "Resultado do que você fez" com o efeito das ações marcadas no mês anterior.
  - Filtros: Todos, Crescimento, Lucro, Custos, Alertas, Sinais positivos, Minha lista.
  - Card: tipo, prioridade, título, explicação com os números usados, impacto, "O que fazer", "Baseado em".
  - Ações do card: **Vou fazer** (vai para Minha lista e é conferido na próxima análise) e **Dispensar** (some; pergunta opcional "Por quê?": Já sei disso, Não se aplica ao meu negócio, Número errado). Ambas com Desfazer.
- Fechar volta ao Dashboard no mesmo período.

## Tipos de insight

| Tipo | Quando |
|---|---|
| Crescimento | Oportunidade de aumentar receita (dias fracos, ticket médio, concentração de receita, curva ABC) |
| Lucro | Oportunidade de aumentar margem (produto com margem baixa e alto volume, preço de venda zerado ou abaixo do custo) |
| Custos | Custo por unidade ou custo fixo subiu sem ganho correspondente |
| Alerta | Risco de caixa (vencimentos maiores que recebimentos previstos, recebimentos atrasados) |
| Sinal positivo | Custo ou volume subiu porque o negócio cresceu; acompanhar e proteger, não cortar |

## Pacote de dados (calculado no backend)

A IA não calcula nada. O backend monta um JSON com números já agregados e relacionados; só agregados, sem dados pessoais.

Para cada produto e grupo de produto no mês e na média dos 3 meses anteriores (e no mesmo mês do ano anterior, quando houver):

- Quantidade comprada e custo total (despesas com `produto_id`).
- Custo por unidade (custo total ÷ quantidade comprada).
- Quantidade vendida, receita e preço médio de venda (vendas).
- Margem em R$ e em %.
- Custo como % da receita do produto ou grupo.
- Quantidade de lançamentos (tamanho da amostra).

Além disso: resumo do mês, séries mensais do ano, despesas por categoria e por fornecedor, receitas por dia da semana, ticket médio e itens por venda, parcelas a vencer e atrasadas nos próximos 30 dias, categorias marcadas como investimento, e o histórico de Vou fazer e Dispensar do usuário.

## Regras da IA

Base das instruções de sistema. Cada regra deve ter caso de teste (ver abaixo).

1. **Papel:** analisar os números de um pequeno negócio e escrever insights curtos e acionáveis em português. Usar apenas os números do pacote e citá-los. Nunca calcular nem estimar valores que não estejam no pacote.
2. **Nunca julgar um custo isolado.** Antes de chamar aumento de custo de problema, olhar a receita e a quantidade do mesmo produto ou grupo.
3. **Custo subiu junto com a venda:** custo por unidade estável (variação de até 5%) e receita do mesmo produto ou grupo crescendo igual ou mais que o custo não é problema. Tipo **Sinal positivo**, explicando a relação e o ganho de margem.
4. **Custo por unidade subiu** mais de 5% sem aumento proporcional no preço de venda: tipo **Custos**, informando a margem perdida em R$.
5. **Compra cresceu muito mais que a venda:** tipo **Alerta** de possível perda, desperdício ou estoque parado. Não afirmar a causa; sugerir o que conferir.
6. **Margem antes de faturamento:** receita maior com margem menor não é crescimento saudável e deve ser dito.
7. **Sazonalidade:** comparar com o mesmo mês do ano anterior antes de chamar uma variação de anormal.
8. **Amostra pequena:** com menos de 3 meses de histórico ou poucos lançamentos, usar "acompanhe" em vez de recomendar corte ou reajuste.
9. **Investimento não é desperdício:** despesas de categorias marcadas como investimento (equipamento, reforma, marketing) não viram insight de redução de custo no mês em que acontecem.
10. **Não inventar causa:** sem dados para explicar, dizer o que mudou e o que conferir.
11. **Ação proporcional:** não sugerir cortar o que gera lucro. Em crescimento com custo maior, a ação é proteger (negociar volume, garantir abastecimento).
12. **Respeitar o histórico do usuário:** não repetir insights dispensados com "Não se aplica". Os dispensados com "Já sei disso" só voltam se o número piorar. Priorizar tipos que o usuário costuma seguir.
13. **Acompanhar o "Vou fazer":** para cada ação marcada no período anterior, informar se o indicador ligado a ela melhorou, piorou ou não mudou, com os números.
14. **Formato:** saída estruturada; cada insight com tipo, prioridade, título, explicação, números usados, impacto em R$ (quando calculável), ação e base. Sem insight relevante, dizer isso; não forçar quantidade.

## Validação no backend

- Todo número citado no texto deve existir no pacote; insight com número desconhecido é descartado.
- Tipo e prioridade só dos valores permitidos.
- Dispensas com motivo "Número errado" entram numa fila de revisão do time.

## Casos de teste das regras

Meses fictícios rodados a cada mudança nas instruções:

| Cenário | Esperado |
|---|---|
| Frango: compra +40%, custo/kg +1,7%, venda +65% | Sinal positivo, nunca Custos |
| Frango: custo/kg +12%, preço de venda igual | Custos, com margem perdida em R$ |
| Compra +40%, venda +10% | Alerta de perda ou estoque, sem afirmar causa |
| Receita +20%, margem −5 p.p. | Menciona queda de margem |
| Dezembro +30% sobre novembro e +2% sobre dezembro anterior | Não trata como anormal |
| Usuário com 1 mês de histórico | Usa "acompanhe" |
| Compra de equipamento (categoria investimento) | Não sugere reduzir |
| Folha dispensada com "Não se aplica" no mês anterior | Não aparece |

## Aprendizado por usuário

- Não há treino de modelo. O histórico de Vou fazer e Dispensar (tipo, motivo, data) fica no banco, por usuário, e entra no pacote da próxima análise.
- Peso por tipo de insight sobe quando seguido e desce quando dispensado; usado na ordenação.
- Ajustes gerais de instruções e cálculos são manuais, feitos pelo time a partir das métricas agregadas.

## Operação

- Cache por usuário, período e hash do pacote; sem mudança nos dados, não chama a IA de novo.
- Limite de análises por dia por usuário.
- Chamada direta com tela de carregamento; se passar de cerca de 15 s, vira job em fila e a tela recarrega ao terminar (sem WebSocket).
- Chave da API no `.env`.

## Fases

1. Insights com o que o Dashboard já calcula: tendência, dias da semana, concentração de receita, margem do mês, despesa fora do padrão, caixa e atrasos.
2. Vendas e margem por produto, custo por unidade, fornecedores, custos fixos e Sinal positivo.
3. Alertas automáticos (ex.: aviso no painel de Novidades).

## Decisões tomadas (25/10/2026)

- SDK oficial `laravel/ai` na série 0.11 (a 1.x conflita com o `laravel/mcp` exigido pelo Boost). PHP ^8.3.
- Provedor Gemini (`gemini-flash-latest`), plano gratuito, configurado por `.env` (`AI_DEFAULT_PROVIDER`, `GEMINI_API_KEY`, `GEMINI_TEXT_MODEL`).
- A chamada leva perto de 1 minuto no plano gratuito: a análise roda em job na fila (`GerarAnaliseDashboard`) e a tela consulta o andamento a cada 3 s. Exige worker de fila em produção.
- Análise presa em "processando" por mais de 10 minutos vira falha.
- O plano gratuito do Gemini aceita 15 requisições por minuto por chave, somando todos os usuários. Um limitador global (`INSIGHTS_REQUISICOES_POR_MINUTO`, padrão 15) segura os jobs na fila até haver vaga; cada execução do job faz uma única chamada. Resposta 429 ou 503 devolve o job à fila após 30 s, por até 8 minutos; depois disso a análise vira falha. O limitador usa o cache, que precisa ser compartilhado entre os workers (database ou redis).
- Limite diário por usuário em `INSIGHTS_LIMITE_DIARIO` (padrão 5); análise reaproveitada do cache não conta.
- Desenvolvimento na branch `feature-insight`.

## Decisões em aberto

- Provedor e modelo de IA; custo aceitável por análise.
- Limite diário e se a função é paga ou de algum plano.
- Começar pela fase 1 ou direto pela 2.
- Como marcar categorias como investimento (campo novo na categoria ou lista fixa).
- Dados novos: taxa por forma de pagamento, histórico de preço de compra, metas mensais.
