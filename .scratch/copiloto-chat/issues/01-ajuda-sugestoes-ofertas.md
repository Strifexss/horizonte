# 01 — Ajuda com sugestões e textos de venda

Status: resolved

- `sugestoes:` no frontmatter de cada `resources/ajuda/*.md`; seções autossuficientes.
- `resources/ajuda/modulos/menu_board.md` e `copiloto.md` (texto de venda + `oferta:`).
- `TelaAjuda` (enum) e `AjudaRepository` (+Interface): ajuda filtrada por módulo, sugestões por tela, ofertas dos módulos ausentes.
- Regra `ajuda-de-uso` atualizada (sugestões, seções autossuficientes, textos de venda).
- Testes: toda tela do menu tem `.md`; seção de módulo desligado some; ajuda abaixo do limite de tokens.
