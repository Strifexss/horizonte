import { TEMAS } from '@/components/menu-boards/temas';
import type { TemaMenuBoard } from '@/components/menu-boards/types';
import { Check } from 'lucide-react';

type Props = {
    value: TemaMenuBoard;
    onChange: (tema: TemaMenuBoard) => void;
};

export default function MenuBoardsTemaPicker({ value, onChange }: Props) {
    return (
        <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-sm font-medium">Modelo / Tema Visual</legend>
            <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
                {TEMAS.map((tema) => {
                    const selecionado = tema.id === value;

                    return (
                        <button
                            key={tema.id}
                            type="button"
                            aria-pressed={selecionado}
                            onClick={() => onChange(tema.id)}
                            className={`flex w-44 shrink-0 snap-start flex-col gap-2.5 rounded-lg bg-white p-3 text-left md:w-auto dark:bg-slate-900 ${
                                selecionado
                                    ? 'border-2 border-amber-500 ring-3 ring-amber-100 dark:ring-amber-950'
                                    : 'm-px border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            <span
                                aria-hidden="true"
                                className={`flex aspect-video w-full flex-col gap-1.5 rounded-md border border-slate-900/10 p-2 ${tema.amostra.fundo}`}
                            >
                                <span className={`h-1.5 w-2/5 rounded-sm ${tema.amostra.barra}`} />
                                <span className="flex flex-1 gap-1.5">
                                    <span className={`flex-1 rounded ${tema.amostra.grande}`} />
                                    <span className={`flex-1 rounded ${tema.amostra.grande}`} />
                                </span>
                                <span className="flex h-3 gap-1.5">
                                    <span className={`flex-1 rounded-sm ${tema.amostra.pequeno}`} />
                                    <span className={`flex-1 rounded-sm ${tema.amostra.pequeno}`} />
                                    <span className={`flex-1 rounded-sm ${tema.amostra.pequeno}`} />
                                </span>
                            </span>
                            <span className="flex w-full items-center justify-between gap-2">
                                <span className="text-sm font-semibold">{tema.nome}</span>
                                {selecionado ? (
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[#082845]">
                                        <Check className="size-3 stroke-[3]" />
                                    </span>
                                ) : null}
                            </span>
                            <span className="text-muted-foreground hidden text-xs md:block">{tema.descricao}</span>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}
