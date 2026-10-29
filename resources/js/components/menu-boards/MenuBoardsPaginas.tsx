import MenuBoardsMiniatura from '@/components/menu-boards/MenuBoardsMiniatura';
import { infoDoLayout } from '@/components/menu-boards/layouts';
import { formatarCiclo, type PaginaForm } from '@/components/menu-boards/types';
import { Plus } from 'lucide-react';

type Props = {
    paginas: PaginaForm[];
    selecionada: number;
    alteradas: Set<string>;
    comErro: Set<number>;
    onSelecionar: (indice: number) => void;
    onNovaPagina: () => void;
};

/**
 * As páginas funcionam como abas de um único formulário: trocar de página não perde o que foi editado.
 */
export default function MenuBoardsPaginas({ paginas, selecionada, alteradas, comErro, onSelecionar, onNovaPagina }: Props) {
    const ciclo = paginas.reduce((total, pagina) => total + Number(pagina.duracao_segundos || 0), 0);

    return (
        <section className="border-sidebar-border/70 z-10 flex flex-col gap-3 rounded-xl border bg-white py-4 pl-4 shadow-sm md:sticky md:top-0 md:gap-4 md:p-6 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 pr-4 md:pr-0">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold">Páginas</h2>
                    <p className="text-muted-foreground text-sm">
                        {paginas.length
                            ? `${paginas.length} ${paginas.length === 1 ? 'página' : 'páginas'} · ${paginas.length === 1 ? 'fica fixa na TV' : `a TV volta ao início a cada ${formatarCiclo(ciclo)}`}. Trocar de página não perde o que você editou: tudo é salvo junto no Salvar Board.`
                            : 'Nenhuma página ainda.'}
                    </p>
                </div>
                {paginas.length ? (
                    <button
                        type="button"
                        onClick={onNovaPagina}
                        className="hidden h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium hover:bg-slate-50 md:inline-flex dark:hover:bg-slate-800"
                    >
                        <Plus className="size-4" />
                        Nova página
                    </button>
                ) : null}
            </div>

            {paginas.length ? (
                <div role="tablist" aria-label="Páginas do board" className="flex gap-3 overflow-x-auto pr-4 pb-1 md:pr-0">
                    {paginas.map((pagina, indice) => {
                        const ativa = indice === selecionada;

                        return (
                            <button
                                key={pagina.chave}
                                type="button"
                                role="tab"
                                aria-selected={ativa}
                                onClick={() => onSelecionar(indice)}
                                className={`flex w-36 shrink-0 flex-col gap-1.5 rounded-lg text-left md:w-52 md:gap-2 ${
                                    ativa
                                        ? 'border-2 border-amber-500 bg-amber-50 p-1.5 md:p-2 dark:bg-amber-950/30'
                                        : 'border border-slate-200 bg-white p-[7px] md:p-[9px] dark:border-slate-700 dark:bg-slate-900'
                                }`}
                            >
                                <MenuBoardsMiniatura layout={pagina.layout} />
                                <span className="flex items-center gap-1.5 text-[13px] font-semibold md:text-sm">
                                    <span className="truncate">
                                        {indice + 1}. {pagina.nome || infoDoLayout(pagina.layout).nome}
                                    </span>
                                    {comErro.has(indice) ? (
                                        <>
                                            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-red-600" />
                                            <span className="sr-only">, com erro</span>
                                        </>
                                    ) : alteradas.has(pagina.chave) ? (
                                        <>
                                            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-amber-600" />
                                            <span className="sr-only">, alterações não salvas</span>
                                        </>
                                    ) : null}
                                </span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {infoDoLayout(pagina.layout).nome} · {pagina.duracao_segundos} s
                                </span>
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={onNovaPagina}
                        className="text-muted-foreground flex min-h-28 w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-slate-300 text-sm font-medium md:w-40 dark:border-slate-600"
                    >
                        <Plus className="size-5" />
                        Nova página
                    </button>
                </div>
            ) : (
                <div className="mr-4 flex flex-col items-center gap-2.5 rounded-lg border-[1.5px] border-dashed border-slate-300 px-4 py-7 text-center md:mr-0 dark:border-slate-600">
                    <p className="font-semibold">Nenhuma página ainda</p>
                    <p className="text-muted-foreground max-w-md text-sm">
                        Cada página é uma tela que a TV mostra por um tempo antes de passar para a próxima. Comece escolhendo um layout.
                    </p>
                    <button
                        type="button"
                        onClick={onNovaPagina}
                        className="mt-1 inline-flex h-11 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600 md:h-10"
                    >
                        <Plus className="size-4" />
                        Adicionar primeira página
                    </button>
                </div>
            )}
        </section>
    );
}
