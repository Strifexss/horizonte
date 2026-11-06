# Input de arquivo oculto precisa de pai `relative`

- `<input type="file" className="sr-only">` dentro de um `<label>` exige `relative` no label (ou num ancestral próximo).
- `sr-only` é `position:absolute`; sem pai posicionado, o input escapa do contêiner que rola (ex.: o `<form>` do editor de Menu Board, `overflow-y-auto`). Ao clicar, o foco força a rolagem de um contêiner `overflow:hidden` externo: a tela salta e pode ficar branca.
