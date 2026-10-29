import { paginaParaTv } from '@/components/menu-boards/layouts';
import type { PaginaForm, ProdutoDoBoard, TemaMenuBoard } from '@/components/menu-boards/types';
import { ESTILOS_TV } from '@/components/tv/temas';
import TvPagina from '@/components/tv/TvPagina';
import TvProgresso from '@/components/tv/TvProgresso';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
    nomeBoard: string;
    tema: TemaMenuBoard;
    paginas: PaginaForm[];
    selecionada: number;
    produtos: ProdutoDoBoard[];
    imagensPrevias: Record<string, string>;
    onSelecionar: (indice: number) => void;
};

/**
 * A prévia usa o mesmo componente da TV, com o tema e o conteúdo que estão no editor.
 */
export default function MenuBoardsPrevia({ nomeBoard, tema, paginas, selecionada, produtos, imagensPrevias, onSelecionar }: Props) {
    const estilo = ESTILOS_TV[tema];
    const pagina = paginas[selecionada];
    const naTv = pagina ? paginaParaTv(pagina, produtos, imagensPrevias[pagina.chave] ?? null) : null;
    const nome = nomeBoard.trim() || 'Nome do board';

    return (
        <section
            aria-labelledby="previa-titulo"
            className="border-sidebar-border/70 flex flex-col gap-3.5 rounded-xl border bg-white p-4 shadow-sm md:p-5 dark:bg-slate-900"
        >
            <div className="flex items-center justify-between">
                <h2 id="previa-titulo" className="text-base font-semibold">
                    Prévia na TV
                </h2>
                <span className="text-muted-foreground text-xs">
                    {paginas.length ? `Página ${selecionada + 1} de ${paginas.length}` : 'Sem páginas'}
                </span>
            </div>

            <div className={`@container relative aspect-video w-full overflow-hidden rounded-lg ${estilo.fundo} ${estilo.texto}`}>
                {naTv ? (
                    <TvPagina pagina={naTv} nomeBoard={nome} estilo={estilo} />
                ) : (
                    <div className={`flex size-full flex-col gap-[1.2cqw] px-[3.75cqw] py-[2.5cqw] ${estilo.fonte}`}>
                        <p className={`text-[5cqw] leading-none ${estilo.peso}`}>{nome}</p>
                        <span aria-hidden="true" className={`h-[0.4cqw] w-[6cqw] rounded-sm ${estilo.regua}`} />
                        <p
                            className={`flex flex-1 items-center justify-center rounded-[1cqw] border-2 border-dashed px-[4cqw] text-center font-sans text-[3.6cqw] ${estilo.suave} ${estilo.linha}`}
                        >
                            {pagina ? 'Preencha o conteúdo desta página para ver a prévia' : 'Adicione a primeira página para ver a prévia completa'}
                        </p>
                    </div>
                )}
            </div>

            <TvProgresso
                duracoes={paginas.map((item) => Number(item.duracao_segundos) || 0)}
                atual={selecionada}
                corAtiva="bg-amber-500"
                corTrilho="bg-slate-200 dark:bg-slate-700"
                className="[&>span]:h-1"
            />

            {paginas.length > 1 ? (
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1 md:h-10"
                        disabled={selecionada === 0}
                        onClick={() => onSelecionar(selecionada - 1)}
                    >
                        <ChevronLeft />
                        Anterior
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1 md:h-10"
                        disabled={selecionada === paginas.length - 1}
                        onClick={() => onSelecionar(selecionada + 1)}
                    >
                        Próxima
                        <ChevronRight />
                    </Button>
                </div>
            ) : null}
        </section>
    );
}
