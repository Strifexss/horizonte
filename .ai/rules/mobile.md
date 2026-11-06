# Telas no celular: alvo de toque e tamanho de texto

Vale abaixo de 768 px (`md`). Use classes `max-md:` para não mudar o desktop.

- **Alvo de toque com pelo menos 44 px** de altura (e de largura, em botões só com ícone): botões, links de texto soltos, chips, abas, setas, paginação e selects. Ex.: `max-md:size-11`, `max-md:min-h-11`, `max-md:h-11`.
  - Botões dentro de um grupo segmentado (ex.: "Hoje / Este mês") podem ficar com 40 px (`max-md:min-h-10`).
  - Ao aumentar alvos numa linha, confira se ela ainda cabe em 360 px: dê `flex-wrap` ou mais largura à parte com texto, em vez de truncar (ex.: a pílula do mês no `MobileFilterDock`).
- **Texto de interface com pelo menos 12 px.** Rótulos e selos de status: `text-xs` (12 px); rótulos de card de resumo: 13 px.
  - Se o componente também aparece no desktop (tabela, card em grid), troque só no celular: `text-xs md:text-[10px]`.
  - Ficam de fora: números de eixo de gráfico, contadores dentro de bolinhas de 20 px e a prévia da TV no Menu Board (imita a TV).
- **Como provar:** varredura com Playwright (`tests/visual/login.cjs`) a 390 px listando elementos interativos menores que 44 px e textos menores que 12 px, mais diff de pixels do desktop (1280 px) antes e depois, que deve dar zero.
