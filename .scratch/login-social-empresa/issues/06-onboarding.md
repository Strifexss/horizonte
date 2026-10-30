# 06 — Onboarding de conta sem Empresa

Status: ready-for-agent
Blocked by: 01, 03

## O quê
- Middleware (registrado em `bootstrap/app.php`) nas rotas autenticadas do app: sem Empresa → onboarding. Liberadas: onboarding, logout, rotas de auth/verificação.
- Página Inertia em 2 passos (um formulário, estado no front): nome do negócio (obrigatório, até 120) e módulo (`varejo` | `restaurante`).
- Concluir: cria Empresa (`nome_confirmado_em` = agora) e vínculo `admin_master` numa transação; redireciona ao app.
- Com Empresa, acessar o onboarding redireciona ao app.
- Visual: `AuthHorizonteLayout` (design no canvas, desktop e mobile).

## Pronto quando
- Testes: conta nova (senha e Google) cai no onboarding; concluir cria Empresa e vínculo; validações; com Empresa não volta ao onboarding; rotas do app bloqueadas sem Empresa.
