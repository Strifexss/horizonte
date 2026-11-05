import { Button } from '@/components/ui/button';
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useHideOnScroll } from '@/hooks/use-hide-on-scroll';
import { cn } from '@/lib/utils';
import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

type FormDialogContextValue = ReturnType<typeof useHideOnScroll>;

const FormDialogContext = React.createContext<FormDialogContextValue | null>(null);

function useFormDialog(): FormDialogContextValue {
    const context = React.useContext(FormDialogContext);

    if (!context) {
        throw new Error('Use as partes do FormDialog dentro de <FormDialogContent>.');
    }

    return context;
}

type FormDialogContentProps = React.ComponentPropsWithoutRef<typeof DialogContent>;

/**
 * Padrão de modal de formulário: tela cheia no celular, com cabeçalho que recolhe ao rolar
 * e rodapé fixo; caixa centralizada a partir de `md`. Passe a largura do desktop em
 * `className` (ex.: `md:w-[700px]`). Monte com FormDialogHeader, FormDialogBody e FormDialogFooter.
 */
const FormDialogContent = React.forwardRef<React.ElementRef<typeof DialogContent>, FormDialogContentProps>(
    ({ className, children, onOpenAutoFocus, ...props }, ref) => {
        const cabecalho = useHideOnScroll();

        return (
            <FormDialogContext.Provider value={cabecalho}>
                <DialogContent
                    ref={ref}
                    onOpenAutoFocus={(event) => {
                        // No celular, focar o primeiro campo abre o teclado e cobre o formulário.
                        if (window.innerWidth < MOBILE_BREAKPOINT) {
                            event.preventDefault();
                        }
                        onOpenAutoFocus?.(event);
                    }}
                    className={cn(
                        'h-[100dvh] w-[100vw] max-w-none gap-0 overflow-hidden p-0 max-md:rounded-none',
                        'md:h-auto md:max-h-[90dvh] md:w-[700px] md:max-w-full md:gap-4 md:p-6',
                        '[&>button:last-child]:transition-opacity',
                        cabecalho.hidden && 'max-md:[&>button:last-child]:pointer-events-none max-md:[&>button:last-child]:opacity-0',
                        className,
                    )}
                    {...props}
                >
                    {children}
                </DialogContent>
            </FormDialogContext.Provider>
        );
    },
);
FormDialogContent.displayName = 'FormDialogContent';

type FormDialogHeaderProps = {
    title: React.ReactNode;
    /** Linha curta acima do título (ex.: categoria e data). */
    eyebrow?: React.ReactNode;
    description?: React.ReactNode;
    /** Esconde a descrição visualmente, mantendo-a para leitores de tela. */
    hideDescription?: boolean;
    className?: string;
    children?: React.ReactNode;
};

/** Título à esquerda e o X à direita. No celular recolhe enquanto o corpo rola para baixo. */
function FormDialogHeader({ title, eyebrow, description, hideDescription = false, className, children }: FormDialogHeaderProps) {
    const { hidden } = useFormDialog();

    return (
        <div
            className={cn(
                'grid shrink-0 transition-[grid-template-rows] duration-200 md:grid-rows-[1fr]',
                hidden ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
            )}
        >
            <div className={cn('min-h-0 overflow-hidden transition-opacity duration-200', hidden && 'max-md:opacity-0')}>
                <DialogHeader className={cn('space-y-1 border-b py-3 pr-16 pl-4 text-left md:border-0 md:p-0', className)}>
                    {eyebrow}
                    <DialogTitle className="text-left text-lg md:text-2xl">{title}</DialogTitle>
                    {description ? (
                        <DialogDescription className={cn('text-sm md:text-base', hideDescription && 'sr-only')}>{description}</DialogDescription>
                    ) : (
                        <DialogDescription className="sr-only">{title}</DialogDescription>
                    )}
                    {children}
                </DialogHeader>
            </div>
        </div>
    );
}

/** Área que rola. É ela que comanda o recolhimento do cabeçalho. */
const FormDialogBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, onScroll, ...props }, ref) => {
    const cabecalho = useFormDialog();

    return (
        <div
            ref={ref}
            onScroll={(event) => {
                cabecalho.onScroll(event);
                onScroll?.(event);
            }}
            className={cn('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 md:p-0', className)}
            {...props}
        />
    );
});
FormDialogBody.displayName = 'FormDialogBody';

/** Ações fixas no rodapé no celular, respeitando a área segura da tela. */
function FormDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <DialogFooter
            className={cn(
                'flex shrink-0 flex-row gap-2 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:space-x-0',
                'md:border-0 md:px-0 md:pt-2 md:pb-0 max-md:[&>*]:flex-1',
                className,
            )}
            {...props}
        />
    );
}

/** `<form>` que ocupa o espaço entre cabeçalho e rodapé; use com Body e Footer dentro dele. */
const FormDialogForm = React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(({ className, ...props }, ref) => (
    <form ref={ref} className={cn('flex min-h-0 flex-1 flex-col md:gap-4', className)} {...props} />
));
FormDialogForm.displayName = 'FormDialogForm';

/** Cancelar só no desktop: no celular o X e o gesto de voltar já fecham o modal. */
function FormDialogCancel({ children = 'Cancelar', className, ...props }: React.ComponentProps<typeof Button>) {
    return (
        <DialogClose asChild>
            <Button type="button" variant="secondary" className={cn('hidden md:inline-flex', className)} {...props}>
                {children}
            </Button>
        </DialogClose>
    );
}

/**
 * Modais de "cadastrar e listar": o formulário fica num card só no desktop; no celular os
 * campos vão direto no corpo, sem margem dupla.
 */
const FORM_DIALOG_PANEL = 'md:border-sidebar-border/70 md:rounded-lg md:border md:bg-white md:p-4 md:shadow-sm md:dark:bg-slate-900';

/** Lista abaixo do formulário: no celular rola junto com o corpo, sem rolagem aninhada. */
const FORM_DIALOG_LIST = 'mt-4 md:mt-2 md:max-h-[340px] md:min-h-[200px] md:overflow-y-auto';

export { FORM_DIALOG_LIST, FORM_DIALOG_PANEL, FormDialogBody, FormDialogCancel, FormDialogContent, FormDialogFooter, FormDialogForm, FormDialogHeader };
