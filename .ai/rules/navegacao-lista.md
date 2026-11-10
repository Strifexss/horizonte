# Navegação em listas paginadas

- Página, filtro, busca e ordenação de uma lista chamam `visitLista(url, dados, props)` (`resources/js/components/padrões/listaNavegacao.ts`), não `router.get` direto.
- `props` são as props da lista (as `Inertia::defer` da tela, ex.: `['parcelas', 'resumo']`); `filters` entra sozinho. Com `only`, o Inertia calcula as props adiadas na mesma resposta: a lista antiga fica esmaecida até a nova chegar, sem o fallback vazio do `<Deferred>`.
- O `TableWithFilters` escuta essas navegações: se a resposta passar de 300 ms, troca a lista por um skeleton da mesma altura (a página não encolhe), faz fade nos dados novos e rola suavemente até o topo da lista (respeita `prefers-reduced-motion`).
- Prop nova que muda com os filtros precisa entrar em `props`, senão a tela mostra o valor antigo.
