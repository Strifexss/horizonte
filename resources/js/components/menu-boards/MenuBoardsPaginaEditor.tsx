import InputError from '@/components/input-error';
import MenuBoardsConteudo from '@/components/menu-boards/MenuBoardsConteudo';
import MenuBoardsMiniatura from '@/components/menu-boards/MenuBoardsMiniatura';
import { DURACAO_MAXIMA, DURACAO_MINIMA, infoDoLayout } from '@/components/menu-boards/layouts';
import type { ConfiguracaoPagina, GrupoDoBoard, MenuBoardItemForm, PaginaForm, ProdutoDoBoard } from '@/components/menu-boards/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Trash2 } from 'lucide-react';

const TEMPOS = [10, 15, 20, 30, 60];

type Props = {
    indice: number;
    total: number;
    pagina: PaginaForm;
    produtos: ProdutoDoBoard[];
    grupos: GrupoDoBoard[];
    imagemPrevia: string | null;
    erros: Record<string, string | undefined>;
    onAlterar: (campos: Partial<PaginaForm>) => void;
    onConfig: (campos: Partial<ConfiguracaoPagina>) => void;
    onItens: (itens: MenuBoardItemForm[]) => void;
    onImagem: (imagem: File | null) => void;
    onTrocarLayout: () => void;
    onDuplicar: () => void;
    onExcluir: () => void;
    onFoto: (produto: ProdutoDoBoard) => void;
};

export default function MenuBoardsPaginaEditor(props: Props) {
    const { indice, total, pagina, erros, onAlterar, onTrocarLayout, onDuplicar, onExcluir } = props;
    const layout = infoDoLayout(pagina.layout);
    const personalizado = !TEMPOS.includes(Number(pagina.duracao_segundos));

    return (
        <section
            aria-labelledby="pagina-titulo"
            className="border-sidebar-border/70 flex flex-col rounded-xl border bg-white shadow-sm dark:bg-slate-900"
        >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 md:px-6 md:py-5 dark:border-slate-800">
                <div className="min-w-0">
                    <span className="text-xs font-semibold tracking-wide text-amber-700 dark:text-amber-400">
                        PÁGINA {indice + 1} DE {total}
                    </span>
                    <h2 id="pagina-titulo" className="truncate text-[17px] font-semibold md:text-lg">
                        {pagina.nome || layout.nome}
                    </h2>
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-11 md:size-10"
                        aria-label="Duplicar página"
                        title="Duplicar"
                        onClick={onDuplicar}
                    >
                        <Copy />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-11 text-red-600 hover:text-red-700 md:size-10"
                        aria-label="Excluir página"
                        title="Excluir"
                        onClick={onExcluir}
                    >
                        <Trash2 />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap gap-6">
                    <div className="grid min-w-0 flex-[1_1_220px] content-start gap-2">
                        <Label htmlFor={`pagina-${indice}-nome`}>Nome da página</Label>
                        <Input
                            id={`pagina-${indice}-nome`}
                            value={pagina.nome}
                            maxLength={80}
                            onChange={(event) => onAlterar({ nome: event.target.value })}
                            className="h-11 text-base md:h-10 md:text-sm"
                        />
                        <span className="text-muted-foreground text-xs">Só para você se organizar; não aparece na TV.</span>
                        <InputError message={erros.nome} />
                    </div>
                    <fieldset className="flex min-w-0 flex-[2_1_320px] flex-col gap-2">
                        <legend className="mb-2 text-sm font-medium">Tempo na tela</legend>
                        <div className="grid grid-cols-3 gap-1.5 md:flex md:flex-wrap">
                            {TEMPOS.map((tempo) => {
                                const ativo = Number(pagina.duracao_segundos) === tempo;

                                return (
                                    <button
                                        key={tempo}
                                        type="button"
                                        aria-pressed={ativo}
                                        onClick={() => onAlterar({ duracao_segundos: tempo })}
                                        className={`h-11 rounded-lg px-3.5 text-sm md:h-10 ${
                                            ativo
                                                ? 'border-2 border-amber-500 bg-amber-50 font-semibold dark:bg-amber-950/30'
                                                : 'border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                                        }`}
                                    >
                                        {tempo} s
                                    </button>
                                );
                            })}
                            <label
                                className={`flex h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm md:h-10 ${
                                    personalizado
                                        ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                                        : 'text-muted-foreground border border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                Outro
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min={DURACAO_MINIMA}
                                    max={DURACAO_MAXIMA}
                                    aria-label="Segundos"
                                    placeholder="s"
                                    value={personalizado ? pagina.duracao_segundos : ''}
                                    onChange={(event) => onAlterar({ duracao_segundos: Number(event.target.value) })}
                                    className="text-foreground w-14 bg-transparent outline-none"
                                />
                            </label>
                        </div>
                        <span className="text-muted-foreground text-xs">
                            Entre {DURACAO_MINIMA} s e {DURACAO_MAXIMA / 60} min. Com uma página só, ela fica fixa.
                        </span>
                        <InputError message={erros.duracao_segundos} />
                    </fieldset>
                </div>

                <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3 md:p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <MenuBoardsMiniatura
                        layout={pagina.layout}
                        escura={false}
                        className="w-20 shrink-0 border border-slate-200 md:w-24 dark:border-slate-700"
                    />
                    <div className="min-w-0 flex-[1_1_180px]">
                        <p className="text-muted-foreground text-xs font-semibold tracking-wide">LAYOUT</p>
                        <p className="text-[15px] font-semibold">{layout.nome}</p>
                        <p className="text-muted-foreground hidden text-[13px] md:block">{layout.descricao}</p>
                    </div>
                    <Button type="button" variant="outline" className="h-11 md:h-9" onClick={onTrocarLayout}>
                        Trocar layout
                    </Button>
                </div>

                <MenuBoardsConteudo {...props} />
            </div>
        </section>
    );
}
