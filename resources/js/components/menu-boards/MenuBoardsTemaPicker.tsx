import { TEMAS } from '@/components/menu-boards/temas';
import type { TemaMenuBoard } from '@/components/menu-boards/types';
import { Check } from 'lucide-react';

type Props = {
    value: TemaMenuBoard;
    onChange: (tema: TemaMenuBoard) => void;
};

export default function MenuBoardsTemaPicker({ value, onChange }: Props) {
    return (
        <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">Tema visual</legend>
            <div className="grid grid-cols-4 gap-2">
                {TEMAS.map((tema) => {
                    const selecionado = tema.id === value;

                    return (
                        <button
                            key={tema.id}
                            type="button"
                            aria-pressed={selecionado}
                            title={tema.descricao}
                            onClick={() => onChange(tema.id)}
                            className={`flex min-h-15 min-w-0 flex-col gap-1.5 rounded-lg bg-white text-left dark:bg-slate-900 ${
                                selecionado ? 'border-2 border-blue-600 p-1.5' : 'border border-slate-200 p-[7px] dark:border-slate-700'
                            }`}
                        >
                            <span aria-hidden="true" className={`flex h-6 flex-col justify-between rounded p-1 md:h-7 ${tema.amostra.fundo}`}>
                                <span className={`h-[3px] w-2/5 rounded-sm ${tema.amostra.barra}`} />
                                <span className="flex gap-0.5">
                                    <span className={`h-1.5 flex-1 rounded-[2px] md:h-2 ${tema.amostra.card}`} />
                                    <span className={`h-1.5 flex-1 rounded-[2px] md:h-2 ${tema.amostra.card}`} />
                                </span>
                            </span>
                            <span className="flex items-center justify-between gap-1 text-xs font-semibold md:text-[13px]">
                                <span className="truncate">{tema.nome}</span>
                                {selecionado ? <Check aria-hidden="true" className="size-3.5 shrink-0 text-blue-700" /> : null}
                            </span>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}
