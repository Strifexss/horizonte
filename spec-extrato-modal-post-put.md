## Problem Statement

O componente `ExtratoModal` (`resources/js/components/extrato/ExtratoModal.tsx`) não dispara `post` nem `put`. A função `submit` monta `cleaned` (dados sanitizados) e chama `submitMethod(url as any, { preserveState: true, preserveScroll: true, onSuccess: () => { reset(); onOpenChange(false); } })`, mas **não passa os dados (`cleaned`)** para o `post`/`put` do `useForm`. Sem dados, a requisição não é enviada corretamente e `onSuccess` nunca ocorre. Além disso, o botão/ação de adicionar deve ativar o refresh da tela **apenas quando o submit for sucesso**.

## Solution

Corrigir `submit` para passar `cleaned` como dados (primeiro argumento dos métodos `post`/`put` do `useForm`), garantindo que a requisição seja enviada e `onSuccess` seja executado no sucesso. Adicionar prop `onSuccess?: () => void` ao `ExtratoModal`; chamar `onSuccess()` apenas dentro do `onSuccess` do submit, assim o pai (`extrato/index.tsx`) pode fazer `visitExtrato()` somente no sucesso.

## User Stories

1. As an usuário do extrato, I want que o modal envie o lançamento (post/put), so that o dado seja salvo.
2. As an usuário do extrato, I want que o modal só feche e dê refresh após sucesso, so that não haja refresh falso em erro.
3. As an usuário do extrato, I want que a tela atualize só quando a operação der certo, so that a lista reflita o dado real.
4. As an usuário do extrato, I want que o botão de adicionar não dispare refresh automaticamente, so that o comportamento seja previsível.

## Implementation Decisions

- **Módulo**: `resources/js/components/extrato/ExtratoModal.tsx` (função `submit` e props do componente).
- **Interface modificada**: prop `onSuccess?: () => void` adicionada ao componente `ExtratoModal`; chamada dentro do `onSuccess` do `submitMethod`.
- **Correção técnica**: `submitMethod(url as any, cleaned, { preserveState: true, preserveScroll: true, onSuccess: () => { reset(); onOpenChange(false); onSuccess?.(); } })` (dados como segundo argumento, conforme `useForm` do Inertia).
- **Seam de teste (escolhido: `modal-on-success`)**: prop `onSuccess` do componente; não é necessário modificar o pai para validar o comportamento isolado do modal.
- **Pai (`extrato/index.tsx`)**: receber `onSuccess={() => visitExtrato()}` no `<ExtratoModal ... />`; o refresh só ocorre no sucesso.

## Testing Decisions

- **Bom teste**: verificar que `post`/`put` são chamados com dados e URL corretos; que `reset()` e `onOpenChange(false)` ocorrem; que `onSuccess` prop é invocado somente no `onSuccess` do submit.
- **Seam usado**: prop `onSuccess` do componente; prioriza comportamento externo (chamada da prop) sobre implementação interna.
- **Prior art**: testes de componentes modais do projeto que verificam `onOpenChange` e `onCreated` em modais auxiliares (`ProdutosModal`, `FuncionariosModal`).

## Out of Scope

- Refatoração de outros modais auxiliares (`ProdutosModal`, `FuncionariosModal`).
- Mudança no backend (`ExtratoController`, `ParcelaController`).
- Ajustes de layout/estilo do modal.

## Further Notes

A causa raiz é a falta do argumento de dados no `submitMethod`. O `setData(cleaned)` antes do submit não é suficiente porque o `useForm` precisa que os métodos `post`/`put` recebam os dados explicitamente (ou no objeto de opções, mas a assinatura padrão do Inertia aceita dados como primeiro/segundo argumento). Corrigir para `submitMethod(url, cleaned, { ... })` resolve o envio e permite que `onSuccess` seja confiável para acionar o refresh do pai.
