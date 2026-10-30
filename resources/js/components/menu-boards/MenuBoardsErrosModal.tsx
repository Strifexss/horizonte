import InputError from '@/components/input-error';
import MenuBoardsConteudo from '@/components/menu-boards/MenuBoardsConteudo';
import { infoDoLayout, LAYOUTS } from '@/components/menu-boards/layouts';
import type { ConfiguracaoPagina, GrupoDoBoard, MenuBoardItemForm, PaginaForm, ProdutoDoBoard } from '@/components/menu-boards/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    aberto: boolean;
    paginas: PaginaForm[];
    produtos: ProdutoDoBoard[];
    grupos: GrupoDoBoard[];
    imagensPrevias: Record<string, string>;
    erros: Record<string, string | undefined>;
    processing: boolean;
    onOpenChange: (aberto: boolean) => void;
    onNome: (nome: string) => void;
    nomeBoard: string;
    onAlterarPagina: (indice: number, campos: Partial<PaginaForm>) => void;
    onConfig: (indice: number, campos: Partial<ConfiguracaoPagina>) => void;
    onItens: (indice: number, itens: MenuBoardItemForm[]) => void;
    onImagem: (indice: number, imagem: File | null) => void;
    onFoto: (produto: ProdutoDoBoard) => void;
    onSalvar: () => void;
};

type PaginaComErro = {
    indice: number;
    pagina: PaginaForm;
    erros: Record<string, string | undefined>;
};

function errosDaPagina(erros: Record<string, string | undefined>, indice: number): Record<string, string | undefined> {
    const prefixo = `paginas.${indice}.`;

    return Object.fromEntries(
        Object.entries(erros)
            .filter(([campo]) => campo.startsWith(prefixo))
            .map(([campo, mensagem]) => [campo.slice(prefixo.length).replace(/^itens\.\d+\..*/, 'itens'), mensagem]),
    );
}

function indicesComErro(erros: Record<string, string | undefined>): number[] {
    const indices = new Set<number>();

    Object.keys(erros).forEach((campo) => {
        const achado = campo.match(/^paginas\.(\d+)\./);
        if (achado) {
            indices.add(Number(achado[1]));
        }
    });

    return [...indices].sort((a, b) => a - b);
}

/**
 * Lista os campos que faltam, agrupados pelo tipo de página, para o usuário corrigir no mesmo lugar.
 */
export default function MenuBoardsErrosModal({
    aberto,
    paginas,
    produtos,
    grupos,
    imagensPrevias,
    erros,
    processing,
    onOpenChange,
    onNome,
    nomeBoard,
    onAlterarPagina,
    onConfig,
    onItens,
    onImagem,
    onFoto,
    onSalvar,
}: Props) {
    const temErroNoBoard = Boolean(erros.nome || erros.tema || erros.paginas);
    const sessoes = LAYOUTS.map((layout) => {
        const paginasComErro: PaginaComErro[] = indicesComErro(erros)
            .filter((indice) => paginas[indice]?.layout === layout.id)
            .map((indice) => ({ indice, pagina: paginas[indice], erros: errosDaPagina(erros, indice) }));

        return { layout, paginasComErro };
    }).filter((sessao) => sessao.paginasComErro.length > 0);

    const quantidade = (temErroNoBoard ? 1 : 0) + sessoes.reduce((total, sessao) => total + sessao.paginasComErro.length, 0);

    return (
        <Dialog open={aberto} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:max-h-[90dvh] md:w-[760px] md:max-w-full">
                <DialogHeader>
                    <DialogTitle>Falta preencher algumas páginas</DialogTitle>
                    <DialogDescription>
                        {quantidade === 1
                            ? 'Corrija o campo abaixo e salve de novo.'
                            : `Há ${quantidade} trechos para revisar. Cada card é um tipo de página.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                    {temErroNoBoard ? (
                        <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                            <header>
                                <h3 className="text-[15px] font-semibold">Dados do board</h3>
                                <p className="text-muted-foreground text-[13px]">Nome, tema e quantidade de páginas.</p>
                            </header>
                            <div className="grid gap-2">
                                <Label htmlFor="menu_board_nome_erros">Nome do Board</Label>
                                <Input
                                    id="menu_board_nome_erros"
                                    value={nomeBoard}
                                    onChange={(event) => onNome(event.target.value)}
                                    placeholder="Ex.: Menu Almoço"
                                    maxLength={80}
                                    className="h-11 text-base md:h-10 md:text-sm"
                                />
                                <InputError message={erros.nome} />
                                <InputError message={erros.tema} />
                                <InputError message={erros.paginas} />
                            </div>
                        </article>
                    ) : null}

                    {sessoes.map(({ layout, paginasComErro }) => (
                        <article
                            key={layout.id}
                            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                        >
                            <header>
                                <h3 className="text-[15px] font-semibold">{layout.nome}</h3>
                                <p className="text-muted-foreground text-[13px]">{layout.descricao}</p>
                            </header>

                            {paginasComErro.map(({ indice, pagina, erros: errosPagina }) => (
                                <div key={pagina.chave} className="flex flex-col gap-4 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs font-semibold tracking-wide text-amber-700 dark:text-amber-400">
                                            PÁGINA {indice + 1} · {infoDoLayout(pagina.layout).nome}
                                        </p>
                                        <div className="grid gap-2">
                                            <Label htmlFor={`erro-pagina-${indice}-nome`}>Nome da página</Label>
                                            <Input
                                                id={`erro-pagina-${indice}-nome`}
                                                value={pagina.nome}
                                                maxLength={80}
                                                onChange={(event) => onAlterarPagina(indice, { nome: event.target.value })}
                                                className="h-11 text-base md:h-10 md:text-sm"
                                            />
                                            <InputError message={errosPagina.nome} />
                                        </div>
                                    </div>
                                    <ul className="text-destructive list-disc pl-4 text-[13px]">
                                        {Object.values(errosPagina)
                                            .filter((mensagem): mensagem is string => Boolean(mensagem))
                                            .filter((mensagem, posicao, lista) => lista.indexOf(mensagem) === posicao)
                                            .map((mensagem) => (
                                                <li key={mensagem}>{mensagem}</li>
                                            ))}
                                    </ul>
                                    <MenuBoardsConteudo
                                        indice={indice}
                                        idBase={`erro-pagina-${indice}`}
                                        pagina={pagina}
                                        produtos={produtos}
                                        grupos={grupos}
                                        imagemPrevia={imagensPrevias[pagina.chave] ?? null}
                                        erros={errosPagina}
                                        onConfig={(campos) => onConfig(indice, campos)}
                                        onItens={(itens) => onItens(indice, itens)}
                                        onImagem={(imagem) => onImagem(indice, imagem)}
                                        onFoto={onFoto}
                                    />
                                </div>
                            ))}
                        </article>
                    ))}
                </div>

                <DialogFooter className="flex flex-row gap-2">
                    <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                        Voltar ao board
                    </Button>
                    <Button type="button" variant="primary" className="w-full" loading={processing} onClick={onSalvar}>
                        Salvar Board
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
