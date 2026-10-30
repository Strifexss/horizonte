# 0001 — Dados pertencem à Empresa (SaaS multi-empresa)

Status: aceito (não implementado)

## Contexto

Hoje todo dado financeiro pertence a um Usuário. Para virar um SaaS com planos, assinatura e, no futuro, vários usuários por negócio, o dono dos dados precisa ser o negócio, não a pessoa.

## Decisão

- **Isolamento**: banco único; tabelas com dados próprios ganham `empresa_id` e um global scope filtra pela Empresa ativa. Nada de banco ou schema por cliente.
- **Dados próprios** passam a ser da Empresa; `user_id` fica como autor do registro.
- **Padrões do sistema** (categorias, formas de pagamento) continuam globais e somente leitura.
- **Tabelas existentes não são renomeadas** (`users` continua `users`).
- **Vínculo** `empresa_user` com cargo (`admin_master`, `gerente`, `atendente`). Por enquanto uma Empresa por conta; convites e várias empresas ficam para depois.
- **Login**: e-mail e senha ou Google, como **contas independentes** — mesmo e-mail em métodos diferentes são contas e Empresas diferentes. A unicidade do e-mail passa a ser por método de login; recuperar senha só vale para contas com senha.
- **Clientes antigos**: a migration cria "Empresa de [nome]", vincula como `admin_master`, no plano mais completo com acesso de 1 mês, e marca o nome como não confirmado (modal pede o nome oficial).
- **Onboarding** de conta nova sem Empresa: nome do negócio e módulo; ganha 49 dias de trial no plano mais completo.
- **Planos**: ciclo de 1 mês; regras em chave/valor (liga/desliga ou cota, ex.: `ia_por_dia: 10`), editáveis no Painel Administrativo sem deploy. Consumo de cotas em tabela própria.
- **Módulo** é só preset das funcionalidades ligadas na criação; o Administrador liga qualquer funcionalidade em qualquer Empresa.
- **Funcionalidade disponível** = ligada na Empresa **e** permitida pelo plano; caso contrário some da interface e a rota bloqueia.
- **Status da assinatura** é calculado, nesta ordem: bloqueada → em trial → ativa → expirada (a partir de `bloqueada_em`, `trial_termina_em`, `acesso_ate`).
- **Expirada ou bloqueada**: bloqueio total do app; o usuário vai para a página de pagamento (placeholder até a cobrança existir). Logout e perfil continuam acessíveis. "Entrar como" funciona em qualquer Empresa.
- **Painel Administrativo** lista Empresas com filtros por status e plano e ações: liberar até data, estender trial, trocar plano, bloquear/desbloquear, Entrar como.

## Fases

1. Empresa, vínculo, `empresa_id`, migration dos antigos.
2. Onboarding (wizard e modal do nome).
3. Login com Google (dependência nova: Socialite).
4. Planos, regras, módulos e funcionalidades.
5. Admin de Empresas e bloqueio total.

Fora do escopo agora: cobrança real, cotas de IA, convites e várias Empresas por conta.

## Consequências

- Toda consulta de dado próprio depende do global scope; esquecer o scope vaza dados entre Empresas.
- Contas independentes por método podem confundir quem esquece por onde entrou; a tela de login deve lembrar da opção Google.
