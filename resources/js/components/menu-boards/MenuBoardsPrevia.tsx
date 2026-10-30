import { paginaParaTv } from '@/components/menu-boards/layouts';
import type { PaginaForm, ProdutoDoBoard, TemaMenuBoard } from '@/components/menu-boards/types';
import { ESTILOS_TV } from '@/components/tv/temas';
import TvPagina from '@/components/tv/TvPagina';
import TvProgresso from '@/components/tv/TvProgresso';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import { useState } from 'react';

type Props = {
    nomeBoard: string;
    tema: TemaMenuBoard;
    paginas: PaginaForm[];
    selecionada: number;
    produtos: ProdutoDoBoard[];
    imagensPrevias: Record<string, string>;
    onSelecionar: (indice: number) => void;
};

type TelaProps = {
    nome: string;
    tema: TemaMenuBoard;
    pagina: PaginaForm | undefined;
    produtos: ProdutoDoBoard[];
    imagemPrevia: string | null;
};

function TelaTv({ nome, tema, pagina, produtos, imagemPrevia }: TelaProps) {
    const estilo = ESTILOS_TV[tema];
    const naTv = pagina ? paginaParaTv(pagina, produtos, imagemPrevia) : null;

    return (
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
    );
}

function Controles({
    paginas,
    selecionada,
    onSelecionar,
}: Pick<Props, 'paginas' | 'selecionada' | 'onSelecionar'>) {
    if (paginas.length <= 1) {
        return null;
    }

    return (
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
    );
}

/**
 * A prévia usa o mesmo componente da TV. No desktop fica ao lado do editor; no mobile abre numa folha grande.
 */
export default function MenuBoardsPrevia({ nomeBoard, tema, paginas, selecionada, produtos, imagensPrevias, onSelecionar }: Props) {
    const [aberta, setAberta] = useState(false);
    const pagina = paginas[selecionada];
    const nome = nomeBoard.trim() || 'Nome do board';
    const imagemPrevia = pagina ? (imagensPrevias[pagina.chave] ?? null) : null;
    const paginaAtual = paginas.length ? `Página ${selecionada + 1} de ${paginas.length}` : 'Sem páginas';

    return (
        <>
            <section
                aria-labelledby="previa-titulo"
                className="border-sidebar-border/70 hidden flex-col gap-3.5 rounded-xl border bg-white p-4 shadow-sm md:flex md:p-5 dark:bg-slate-900"
            >
                <div className="flex items-center justify-between">
                    <h2 id="previa-titulo" className="text-base font-semibold">
                        Prévia na TV
                    </h2>
                    <span className="text-muted-foreground text-xs">{paginaAtual}</span>
                </div>

                <TelaTv nome={nome} tema={tema} pagina={pagina} produtos={produtos} imagemPrevia={imagemPrevia} />

                <TvProgresso
                    duracoes={paginas.map((item) => Number(item.duracao_segundos) || 0)}
                    atual={selecionada}
                    corAtiva="bg-blue-600"
                    corTrilho="bg-slate-200 dark:bg-slate-700"
                    className="[&>span]:h-1"
                />

                <Controles paginas={paginas} selecionada={selecionada} onSelecionar={onSelecionar} />
            </section>

            {aberta ? null : (
                <button
                    type="button"
                    className="fixed right-4 bottom-24 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 md:hidden"
                    aria-label="Abrir prévia na TV"
                    onClick={() => setAberta(true)}
                >
                    <Tv className="h-7 w-7" />
                </button>
            )}

            <Dialog open={aberta} onOpenChange={setAberta}>
                <DialogContent className="bg-background flex h-[100vh] w-[100vw] max-w-full flex-col overflow-hidden sm:rounded-none">
                    <DialogHeader>
                        <DialogTitle>Prévia na TV</DialogTitle>
                        <DialogDescription>{paginaAtual}</DialogDescription>
                    </DialogHeader>

                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
                        <div className="w-full max-w-[min(100%,calc(70dvh*16/9))]">
                            <TelaTv nome={nome} tema={tema} pagina={pagina} produtos={produtos} imagemPrevia={imagemPrevia} />
                        </div>
                        <TvProgresso
                            duracoes={paginas.map((item) => Number(item.duracao_segundos) || 0)}
                            atual={selecionada}
                            corAtiva="bg-blue-600"
                            corTrilho="bg-slate-200 dark:bg-slate-700"
                            className="w-full [&>span]:h-1"
                        />
                        <div className="w-full">
                            <Controles paginas={paginas} selecionada={selecionada} onSelecionar={onSelecionar} />
                        </div>
                    </div>

                    <DialogFooter className="flex flex-row gap-2">
                        <Button type="button" variant="outline" className="h-12 w-full text-base" onClick={() => setAberta(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
