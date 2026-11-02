# Design e acessibilidade

## Direção

Interface em português do Brasil para donos e atendentes de pequenos negócios, usada no computador (balcão, escritório) e no celular. Telas de operação (Nova venda, Extrato) priorizam velocidade: atalhos de teclado, leitor de código de barras no AsyncSelect e etapas no celular.

## Sistema existente

- Tokens: variáveis CSS e `@theme` em `resources/css/app.css` (Tailwind 4, tema claro/escuro via `.dark`). Fonte: Instrument Sans.
- Componentes: shadcn/ui com base Radix (`components.json`, `resources/js/components/ui/`), ícones lucide, toasts `react-toastify`.
- Padrões de domínio e mobile: seção **Front** da skill `estrutura-padrao` (`front.md`). Listagem com tabela no desktop e cards no mobile, `MobileFab`, `MobileFilterDock` e o contrato **Modal no mobile**. Referências vivas: `pages/extrato/index.tsx`, `pages/vendas/index.tsx`, `components/categorias/CategoriasModal.tsx`.

## Interação

HTML semântico, navegação por teclado, foco visível e contraste adequado. Campos com `Label` e erro do servidor ao lado (`InputError`). Operações assíncronas mostram progresso (skeleton em `<Deferred>`, botão desabilitado com `processing`). Respeite movimento reduzido.

## Revisão

- Antes de concluir mudança de UI, revise com a skill `web-design-guidelines` e, em componentes shadcn, com a skill `shadcn` (rode `npx shadcn@latest info --json` para o contexto).
- Verifique o fluxo no navegador local (`http://localhost:8080`) em largura de desktop e de celular.
- Nenhuma auditoria completa de acessibilidade foi registrada até agora.

## Manutenção

Mudança visual atualiza o token/componente de origem; mudança de regra de interação atualiza este documento ou `front.md`.
