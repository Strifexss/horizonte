# Horizonte

Gestão financeira corporativa: contas, parcelas, categorias, produtos, fornecedores, grupos e funcionários, sempre pertencentes a um usuário.

## Language

### Acesso

**Usuário**:
Pessoa com login no sistema, dona dos próprios dados financeiros.
_Avoid_: Cliente, conta (conta é outra coisa no domínio)

**Administrador**:
Usuário cujo e-mail está na lista de e-mails autorizados do ambiente; não é um papel gravado no banco.
_Avoid_: Admin role, superusuário

**Painel Administrativo**:
Área restrita ao Administrador, servida num caminho secreto definido pelo ambiente, que finge não existir (404) para qualquer outra pessoa.
_Avoid_: Backoffice, admin

**Entrar como**:
Ação do Administrador de trocar a própria sessão pela sessão de um Usuário, sem caminho de volta além de sair e entrar de novo.
_Avoid_: Impersonar, logar como

### Dinheiro

**Competência**:
Data que situa a parcela no mês do saldo.
_Avoid_: Vencimento, data de pagamento

**Saldo do mês**:
Líquido de um mês: valor das parcelas de receita menos valor das parcelas de despesa daquele mês, pagas ou não.
_Avoid_: Saldo acumulado, saldo de caixa

**Forma de pagamento**:
Meio pelo qual um lançamento é pago ou recebido (Espécie, Pix, cartão...). Todo lançamento tem uma.
_Avoid_: Meio de pagamento, método

**Forma de pagamento padrão**:
Forma de pagamento do sistema, igual para todos os Usuários e somente leitura para eles.
_Avoid_: Forma de pagamento global

**Forma de pagamento própria**:
Forma de pagamento cadastrada por um Usuário, visível só para ele.
_Avoid_: Forma customizada

**Baixa automática**:
Propriedade da Forma de pagamento que faz a receita de uma Venda nascer paga; sem ela, a receita nasce em aberto.
_Avoid_: Pagamento automático

> "Padrão" muda de sentido: em Categoria e Forma de pagamento é "do sistema, para todos"; em Conta é "a conta preferida do Usuário".

### Vendas

**Venda**:
Conjunto de itens vendidos pelo Usuário com os pagamentos recebidos por eles. Nasce **aberta**, fica **fechada** quando a soma dos pagamentos iguala o total e pode ser **cancelada** a qualquer momento.
_Avoid_: Pedido, caixa

**Item da venda**:
Produto, quantidade e valor unitário gravados na Venda; não mudam se o produto mudar depois.
_Avoid_: Linha, produto da venda

**Pagamento da venda**:
Parte do total da Venda recebida por uma Forma de pagamento. No fechamento, cada um vira uma receita.
_Avoid_: Parcela (parcela é do financeiro)

**Cancelar venda**:
Marcar a Venda como cancelada e excluir as receitas que ela gerou.
_Avoid_: Excluir venda, estornar

### Novidades

**Novidade**:
Aviso do Administrador sobre o que mudou no sistema (Novo, Melhoria ou Correção). Nasce **rascunho** e só os Usuários a veem depois de **publicada**; a data de publicação é a da primeira publicação.
_Avoid_: Release note, changelog, aviso

**Pop-up automático**:
Propriedade da Novidade publicada que a faz abrir sozinha para cada Usuário até ele dispensá-la.
_Avoid_: Modal obrigatório

**Dispensar novidade**:
Ação do Usuário de marcar "Não mostrar novamente": a Novidade para de abrir sozinha para ele, mas continua no histórico de novidades.
_Avoid_: Marcar como lida, excluir novidade

### Dashboard

**Período de referência**:
Ano e mês escolhidos no topo do Dashboard; cada bloco usa a parte que precisa (o ano inteiro ou o mês inteiro, sempre pela competência).
_Avoid_: Filtro global, período do dashboard

**Semana da receita**:
Semana de segunda a domingo, escolhida dentro do card de receitas por dia da semana, entre as semanas que cruzam o mês do Período de referência.
_Avoid_: Semana do filtro, semana global
