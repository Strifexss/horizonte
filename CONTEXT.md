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
