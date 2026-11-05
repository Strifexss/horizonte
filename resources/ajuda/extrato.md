---
titulo: Extrato
rota: extrato.index
modulo: null
sugestoes:
  - Como lanço uma despesa?
  - Como dou baixa em um pagamento?
  - Como gero o PDF do Extrato?
---

# Extrato

Todos os lançamentos de receita e despesa da Empresa. É aqui que você lança despesas, confere o que entrou e saiu e dá baixa no que foi pago.

## Lançar uma receita ou despesa

1. Toque em **+ Novo Lançamento**. No celular, ele fica no botão **+** do canto da tela.
2. Escolha a aba **Receita** ou **Despesa**.
3. Preencha os campos obrigatórios, marcados com *:
   - **Descrição**: o que é o lançamento.
   - **Conta**: de qual conta ou banco o dinheiro sai ou entra.
   - **Categoria**: o tipo do lançamento, como aluguel ou energia.
   - **Valor**.
   - **Forma de pagamento**.
   - **Data**.
4. Se já foi pago, informe o **Valor pago**. Formas de pagamento com baixa automática preenchem esse campo sozinhas.
5. Toque em **Adicionar**.

Alguns campos aparecem conforme a categoria:

- Na categoria **Produto**, aparecem **Produto**, **Fornecedor** e **Quantidade**. Use para registrar a compra de mercadoria.
- Na categoria **Salário**, aparece **Funcionário**.

Não achou a categoria, o produto, o fornecedor ou o funcionário na lista? Use o botão de cadastrar ao lado do campo para criar na hora, sem sair do lançamento.

## Status do lançamento

- **Aberto**: nada foi pago ainda.
- **Parcial**: parte do valor foi paga.
- **Pago**: o valor todo foi pago.

## Dar baixa em um pagamento

Abra o lançamento em **Editar**, preencha o **Valor pago** e toque em **Salvar alterações**.

## Lançamentos que vieram de uma venda

As vendas fechadas geram receitas no Extrato. Nesses lançamentos, só dá para mudar o **Valor pago**. Para mudar o valor, a forma de pagamento ou excluir, cancele a venda na tela de Vendas.

## Filtrar e buscar

- Use a busca para achar um lançamento pelo texto.
- Os filtros permitem escolher o período, **Conta**, **Categoria**, **Produto**, **Grupo**, **Fornecedor**, **Forma de pagamento** e **Status**.
- No topo ficam os totais do que está filtrado: **Entradas**, **Saídas** e **Saldo Total**.

## Gerar o PDF

Toque em **Gerar PDF**. O arquivo sai com os lançamentos dos filtros que estão na tela.

## Excluir um lançamento

No lançamento, toque em **Excluir** e confirme. A exclusão não pode ser desfeita.

## Cadastros auxiliares

No menu ao lado do título do Extrato (só no computador) você gerencia **Categorias**, **Produtos**, **Funcionários** e **Fornecedores**.

## Regras e validações

- Obrigatórios: **Descrição** (até 255 caracteres), **Conta**, **Categoria**, **Valor**, **Forma de pagamento** e **Data**.
- O **Valor** precisa ser maior que zero. O **Valor pago** não pode ser negativo.
- Na categoria **Produto**, a **Quantidade** é obrigatória e precisa ser um número inteiro de pelo menos 1.
- Só aparecem formas de pagamento ativas. Se a forma escolhida for desativada, aparece "Forma de pagamento inválida ou inativa".
- Lançamento gerado por uma venda não pode ser excluído nem ter valor ou forma de pagamento alterados: só dá para dar baixa. Para o resto, cancele a venda.
- A exclusão de um lançamento não pode ser desfeita.
- **Categorias**: as que vêm com o sistema (como **Produto**, **Salário** e **Venda**) não podem ser alteradas nem excluídas. Atenção: excluir uma categoria sua apaga também os lançamentos dela.
- **Funcionários**: nome e salário são obrigatórios, e o salário precisa ser maior que zero. Excluir um funcionário mantém os lançamentos, só tira o vínculo com ele.
- **Fornecedores**: só o nome é obrigatório. Excluir um fornecedor mantém os produtos, só tira o vínculo com ele.

## No celular

- Os lançamentos aparecem em cartões. **Toque** num cartão para abrir e editar. **Segure por 1 segundo** para ver as ações **Editar** e **Excluir**.
- O botão **+** no canto inferior direito abre as ações rápidas: **+ Novo Lançamento**, **+ Cadastrar Funcionário**, **+ Cadastrar Produto** e **Gerar PDF**.
- A barra fixa no rodapé mostra o mês. Use as setas para ir ao mês anterior ou ao próximo, e toque no mês para escolher outro período. O botão **Filtros** abre os mesmos filtros do computador.
- A barra some ao rolar para baixo e volta ao rolar para cima.
- O menu de **Categorias** e **Fornecedores** ao lado do título não aparece no celular. Cadastre esses itens dentro do lançamento, pelo botão ao lado do campo.
