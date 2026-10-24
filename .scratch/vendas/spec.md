# Vendas

Status: ready-for-agent
Origem: https://github.com/Strifexss/horizonte/issues/21

Decisões fechadas no grill de 24/10/2026.

## Formas de pagamento

- Tabela `forma_pagamento`: `nome`, `ativo`, `baixa_automatica`, `padrao`, `usuario_id` (null nas padrões).
- Padrões (migration): Espécie e Pix com baixa automática; Cartão de Crédito e Cartão de Débito sem.
- Formas novas do usuário nascem com baixa automática ligada.
- Padrões são somente leitura. Nome único entre as padrões e as do usuário.
- Forma já usada (financeiro ou venda) não pode ser excluída, só desativada.
- Tela própria no menu.

## Financeiro / Extrato

- `financeiro.forma_pagamento_id` obrigatório em todo lançamento (receita e despesa). Lançamentos antigos recebem Espécie.
- `financeiro.venda_id` nullable.
- Extrato: forma de pagamento como coluna e filtro (desktop e mobile).
- Lançamento manual: escolher forma com baixa automática preenche o valor pago como sugestão.
- Receita de venda no Extrato: só baixa (valor pago). Valor, forma e exclusão bloqueados, orientando cancelar a venda.

## Venda

- Tabelas `venda`, `venda_item`, `venda_pagamento`.
- Aberta enquanto a soma dos pagamentos < total; fechada quando iguala. Soma nunca maior que o total.
- Aberta: tudo editável. Fechada: só cancelar.
- Fechamento: um `financeiro` (receita) por pagamento, uma parcela cada, categoria de sistema "Venda", conta padrão do usuário, vencimento e competência na data da venda, descrição "Venda #N - Forma". Baixa automática → `valor_pago = valor`; senão `0`.
- Sem conta: não fecha; tela oferece o modal de cadastro de conta.
- Cancelar: status `cancelada` (aberta ou fechada) e exclui as receitas vinculadas, com aviso na confirmação.

## Itens

- `valor_unitario` e `valor_total` gravados (snapshot).
- Preço editável por item, > 0.
- Quantidade `decimal(10,3)`, > 0; stepper de 1 em 1, digitação decimal.
- Só produtos ativos. Sem produto repetido: adicionar ou trocar para um produto já presente soma na linha existente.
- Trocar o produto da linha (autocomplete) volta o preço para o `preco_venda` do novo produto e mantém a quantidade.

## Tela

- Página Vendas no menu, listagem com filtro por data, forma de pagamento e status.
- Modal Nova Venda conforme protótipo, com: valor unitário na linha, cartões das 4 padrões + "Mais" (próprias), "Dividir pagamento" e "Falta pagar", botão "Voltar".

## Fora do escopo

Estoque, desconto, troco, cliente, parcelamento, comissão, cupom fiscal.
