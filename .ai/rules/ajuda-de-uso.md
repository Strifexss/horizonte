# Ajuda de uso acompanha a tela

O Copiloto responde dúvidas de uso a partir de `resources/ajuda/<tela>.md`, um arquivo por item do menu (`components/app-sidebar.tsx`). Uma ajuda desatualizada faz o Copiloto ensinar errado.

## Quando atualizar

Atualize o `.md` da tela no mesmo commit sempre que uma mudança alterar o que o usuário vê ou faz:

- botão, campo, aba, filtro, status ou mensagem novos, renomeados ou removidos;
- passo ou ordem de um fluxo (cadastrar, lançar, vender, cancelar);
- regra de negócio ou validação que o usuário percebe (campo obrigatório, limite, unicidade, bloqueio de exclusão, efeito de uma ação, mensagem de erro);
- comportamento no celular (botão **+**, cartões, barra de filtros, etapas).

Não precisa atualizar em refatoração sem efeito visível, ajuste de estilo, correção de texto que não muda o sentido ou mudança só de backend que o usuário não percebe.

## Como escrever

- Mapeie a tela pelo item do menu: `pages/extrato/**` e `components/extrato/**` → `extrato.md`. Cadastros sem item no menu ficam no arquivo da tela onde são usados (Fornecedores, Categorias e Funcionários em `extrato.md`; Grupos em `produtos.md`).
- Tela nova no menu ganha arquivo novo, um caso em `App\Ai\Copiloto\TelaAjuda` e frontmatter `titulo`, `rota` (nome da rota), `modulo` (`null` ou o módulo exigido) e `sugestoes` (até 3 perguntas, uma por linha `  - texto`; prefixe `[modulo]` na que depende de módulo). O cabeçalho é lido por um parser simples: só `chave: valor` e listas, sem YAML completo.
- Cada seção `##` precisa fazer sentido sozinha: no futuro a busca vai trazer seções isoladas.
- Módulo opcional novo ganha `resources/ajuda/modulos/<chave>.md` com o texto de venda e `oferta:` (o texto do botão no Copiloto). Nunca prometa o que o módulo não faz.
- Seção que depende de módulo vem precedida de `<!-- modulo: <nome> -->`.
- Use os rótulos exatos da interface em negrito. Escreva para o usuário final, em pt-BR: nada de tabela, classe, rota ou regra interna.
- Mantenha a seção `## Regras e validações` alinhada com os FormRequests, as exceptions e os Services da tela: obrigatórios, limites, bloqueios e efeitos colaterais. Cite a mensagem de erro exata quando ajudar o usuário a reconhecê-la.
- Mantenha a seção `## No celular` quando a tela muda no celular.
