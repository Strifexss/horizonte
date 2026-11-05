# Telas em pt-BR

Traduzir para português do Brasil as telas de **Configurações** (perfil, senha, aparência, excluir conta) e de **Cadastro de usuário**.

## Levantamento de outras telas ainda em inglês

- `auth/forgot-password.tsx`, `auth/reset-password.tsx`, `auth/confirm-password.tsx`, `auth/verify-email.tsx`
- Menu do usuário (`components/user-menu-content.tsx`: "Settings", "Log out") e `appearance-dropdown.tsx` ("Toggle theme")
- Mensagens de validação do backend: `config/app.php` usa `locale = en` e não há pasta `lang/`, então erros como "The email field is required." vêm em inglês.
