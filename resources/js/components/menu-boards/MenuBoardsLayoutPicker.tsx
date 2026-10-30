import MenuBoardsMiniatura from '@/components/menu-boards/MenuBoardsMiniatura';
import { LAYOUTS } from '@/components/menu-boards/layouts';
import type { LayoutPagina } from '@/components/menu-boards/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check } from 'lucide-react';
import { useState } from 'react';

type Props = {
    aberto: boolean;
    titulo: string;
    textoConfirmar: string;
    atual?: LayoutPagina;
    onOpenChange: (aberto: boolean) => void;
    onEscolher: (layout: LayoutPagina) => void;
};

/**
 * Escolha de layout pronto, usada para criar uma página nova e para trocar o layout de uma existente.
 */
export default function MenuBoardsLayoutPicker({ aberto, titulo, textoConfirmar, atual, onOpenChange, onEscolher }: Props) {
    const [escolhido, setEscolhido] = useState<LayoutPagina>(atual ?? 'destaques_grade');

    return (
        <Dialog
            open={aberto}
            onOpenChange={(valor) => {
                if (valor) {
                    setEscolhido(atual ?? 'destaques_grade');
                }
                onOpenChange(valor);
            }}
        >
            <DialogContent className="max-h-[92vh] w-[calc(100vw-1rem)] overflow-y-auto md:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{titulo}</DialogTitle>
                    <DialogDescription>Escolha um layout. Dá para trocar depois sem perder os produtos escolhidos.</DialogDescription>
                </DialogHeader>

                <div role="radiogroup" aria-label="Layouts" className="grid gap-2 md:grid-cols-3 md:gap-3">
                    {LAYOUTS.map((layout) => {
                        const selecionado = layout.id === escolhido;

                        return (
                            <button
                                key={layout.id}
                                type="button"
                                role="radio"
                                aria-checked={selecionado}
                                onClick={() => setEscolhido(layout.id)}
                                onDoubleClick={() => onEscolher(layout.id)}
                                className={`flex items-center gap-3 rounded-xl text-left md:flex-col md:items-stretch ${
                                    selecionado
                                        ? 'border-2 border-blue-600 bg-blue-50 p-[9px] md:p-[11px] dark:bg-blue-950/30'
                                        : 'border border-slate-200 bg-white p-2.5 md:p-3 dark:border-slate-700 dark:bg-slate-900'
                                }`}
                            >
                                <MenuBoardsMiniatura layout={layout.id} escura={false} className="w-24 shrink-0 md:w-full" />
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2 text-[15px] font-semibold">
                                        {layout.nome}
                                        {selecionado ? (
                                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                                                <Check className="size-3 stroke-[3]" />
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className="text-muted-foreground mt-0.5 block text-[13px] leading-snug">{layout.descricao}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                <DialogFooter className="flex flex-row gap-2">
                    <Button type="button" variant="secondary" className="h-11 flex-1 md:h-10 md:flex-none" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        className="h-11 flex-1 justify-center md:h-10 md:flex-none"
                        onClick={() => onEscolher(escolhido)}
                    >
                        {textoConfirmar}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
