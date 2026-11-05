# Modais de formulário e listagem: use o FormDialog

- Modal que ocupa a tela toda no celular (formulário, "cadastrar e listar", correção) é montado com `@/components/ui/form-dialog`: `FormDialogContent` > `FormDialogHeader` > (`FormDialogForm` >) `FormDialogBody` + `FormDialogFooter`.
- Não repita `h-[100dvh] w-[100vw] ...` à mão. Passe só a largura do desktop em `className` (ex.: `md:w-[560px]`).
- No celular: cabeçalho recolhe ao rolar o corpo para baixo e volta ao subir; ações ficam fixas no rodapé; Cancelar some (use `FormDialogCancel`), porque o X fecha. Se o Cancelar fazia algo além de fechar (ex.: `reset()`), mova isso para o `onOpenChange(false)` do `Dialog`.
- "Cadastrar e listar": envolva o formulário com `FORM_DIALOG_PANEL` e a lista com `FORM_DIALOG_LIST` (card e rolagem própria só no desktop).
- Validação: envolva o `FormDialogForm` (com `id`) em `FormDialogCorrecao errors={errors} formId="..."` e cada campo em `FormDialogField name="campo_do_backend"` (no lugar do `<div className="grid gap-2">`). Quando o salvar volta com erro, abre um modal só com os campos com erro (padrão da venda), no desktop e no celular. Erro sem `FormDialogField` aparece como texto no modal.
- Ficam fora: confirmações pequenas (`DialogContent` padrão, centralizado) e telas com layout próprio (Nova Venda, prévia do Menu Board).
- A Nova Venda mantém o layout próprio (etapas, catálogo), mas no celular segue a casca do padrão com classes `max-md:` no `VendaModal`: cabeçalho compacto com título à esquerda, sem padding duplo, rodapé com área segura e sem Cancelar (o X fecha). O desktop dela não muda.
