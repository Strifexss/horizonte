# MVP1 — Login Social + Empresa

Status: ready-for-agent
Branch: `feature-login-social-empresa`
Decisões: `docs/adr/0001-dados-pertencem-a-empresa.md` (vale o que está lá; abaixo, o recorte do MVP1)
Design: canvas "Horizonte SaaS — Telas" (Login, Onboarding 1/2 e 2/2, Cliente antigo — nome; desktop e mobile)

## Objetivo

1. Os dados próprios passam a pertencer à **Empresa**, não ao Usuário.
2. Entrar com Google, como conta independente da conta com senha.
3. Toda conta trabalha dentro de uma Empresa: contas novas criam a sua no onboarding; clientes antigos ganham uma automaticamente e confirmam o nome num modal.

## Fora do escopo

Planos, trial, status de assinatura, bloqueio/pagamento, admin de Empresas e Planos, funcionalidades por módulo/plano, convites e várias Empresas por conta.

## Decisões

### Empresa
- Tabela `empresas`: `id`, `nome`, `modulo` (`varejo` | `restaurante`), `nome_confirmado_em` (nullable), timestamps.
- Tabela `empresa_user`: `empresa_id`, `user_id`, `cargo` (`admin_master` | `gerente` | `atendente`), timestamps; único (`empresa_id`, `user_id`).
- No MVP1 cada conta tem **exatamente uma** Empresa. A **Empresa ativa** é a única Empresa do usuário logado; um ponto central resolve isso (ex.: `$user->empresa()`), nunca consultas soltas.
- O módulo só é gravado: não muda menus nem telas no MVP1.

### Dono dos dados
- Toda tabela que hoje tem `usuario_id` como dono ganha `empresa_id` (FK `empresas`, cascade on delete), preenchido a partir da Empresa do dono atual, depois `NOT NULL` — exceto nas tabelas com registros padrão do sistema, onde `empresa_id` nulo = padrão.
- `usuario_id` permanece como **autor** do registro (quem criou); deixa de filtrar acesso.
- Toda leitura, escrita, validação de unicidade e checagem de posse passa a usar `empresa_id` da Empresa ativa.
- **Padrões do sistema** (categorias e formas de pagamento com `usuario_id` nulo) continuam globais e somente leitura: passam a ser identificados por `empresa_id` nulo.
- **Conta padrão** é por Empresa.
- **Continua por Usuário**: `novidade_dispensada` (dispensar novidade é escolha pessoal).
- Inventário completo em `issues/03-escopo-por-empresa.md`; nenhum fluxo pode ficar filtrando por `usuario_id`.

### Clientes antigos
- Migration cria, para cada usuário existente, uma Empresa "Empresa de [nome]" (`modulo` = `varejo`, `nome_confirmado_em` nulo) e o vincula como `admin_master`.
- Na primeira tela autenticada com `nome_confirmado_em` nulo aparece o **modal do nome** (não dispensável: só fecha salvando). Salvar grava o nome e `nome_confirmado_em`.

### Contas por método de login (opção B do ADR)
- `users.password` nullable, `users.google_id` nullable e único.
- Unicidade de e-mail **por método**: entre contas com senha (`google_id` nulo) e, separadamente, entre contas Google. Mesmo e-mail nos dois métodos = duas contas, duas Empresas.
- Login com senha, cadastro com senha, "esqueci a senha" e redefinição consideram **só contas com senha**.
- Conta Google: e-mail verificado na criação; **sem** aba/tela de senha em Configurações, sem confirmar senha e sem trocar e-mail (vem do Google).
- Tela de login lembra: "Conta Google e conta com senha são separadas".

### Login com Google
- Pacote `laravel/socialite` (aprovado). Credenciais em `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (já no `.env.example`; o dono do projeto cria o OAuth no Google Cloud e preenche).
- Rotas `auth/google/redirect` e `auth/google/callback` (guest).
- Callback: acha a conta pelo `google_id`; se não existir, cria (`name`, `email`, `google_id`, sem senha, e-mail verificado). Loga com "lembrar".
- Usuário cancela ou o Google falha: volta ao login com mensagem de erro, sem criar nada.
- Botão "Entrar com Google" no login e no cadastro.

### Onboarding (conta sem Empresa)
- Middleware nas rotas autenticadas do app: conta sem Empresa vai para o onboarding (exceto onboarding, logout e rotas de auth).
- Passo 1: nome do negócio (obrigatório, até 120). Passo 2: módulo. Concluir cria a Empresa com `nome_confirmado_em` = agora e o vínculo `admin_master`, e leva ao app.
- Vale para conta nova com senha e conta nova Google.
- Conta com Empresa que acessa o onboarding vai para o app.

### Administrador
- Painel Administrativo e "Entrar como" seguem como hoje.
- Listagem de usuários mostra a Empresa e o método (Senha/Google).
- "Transferir dados" passa a transferir entre as Empresas dos usuários escolhidos.
- Excluir um usuário que é o único membro da Empresa exclui a Empresa e seus dados (mesmo efeito de hoje).

## Em aberto

- **Administrador com e-mail duplicado**: com contas por método, a lista `ADMIN_EMAILS` reconheceria as duas contas do mesmo e-mail. Proposta: só a conta **com senha** é Administrador. Confirmar antes do ticket 06.

## Tickets

1. `issues/01-empresa-e-vinculo.md`
2. `issues/02-migracao-dados-para-empresa.md`
3. `issues/03-escopo-por-empresa.md`
4. `issues/04-contas-por-metodo.md`
5. `issues/05-login-google.md`
6. `issues/06-onboarding.md`
7. `issues/07-modal-nome-clientes-antigos.md`
8. `issues/08-admin-usuarios.md`
9. `issues/09-glossario-e-adr.md`
