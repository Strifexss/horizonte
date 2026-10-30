import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import InputError from '@/components/input-error';
import MenuBoardsDados from '@/components/menu-boards/MenuBoardsDados';
import MenuBoardsErrosModal from '@/components/menu-boards/MenuBoardsErrosModal';
import MenuBoardsFotoModal from '@/components/menu-boards/MenuBoardsFotoModal';
import MenuBoardsLayoutPicker from '@/components/menu-boards/MenuBoardsLayoutPicker';
import MenuBoardsPaginaEditor from '@/components/menu-boards/MenuBoardsPaginaEditor';
import MenuBoardsPaginas from '@/components/menu-boards/MenuBoardsPaginas';
import MenuBoardsPrevia from '@/components/menu-boards/MenuBoardsPrevia';
import MenuBoardsStatusTv from '@/components/menu-boards/MenuBoardsStatusTv';
import { gruposDosProdutos, infoDoLayout, novaChave, novaPagina, paginaDoServidor } from '@/components/menu-boards/layouts';
import type { LayoutPagina, MenuBoardEdicao, MenuBoardFormValues, PaginaForm, PareamentoTv, ProdutoDoBoard } from '@/components/menu-boards/types';
import { PageTitle } from '@/components/padrões';
import { Button } from '@/components/ui/button';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Props = {
    titulo: string;
    board: MenuBoardEdicao | null;
    produtos: ProdutoDoBoard[];
    pareamento: PareamentoTv;
};

type EscolhaDeLayout = { modo: 'nova' } | { modo: 'trocar'; indice: number };

/**
 * O que define se a página mudou desde que o editor abriu (o arquivo escolhido conta pelo nome).
 */
function assinatura(pagina: PaginaForm): string {
    const { chave, imagem, imagem_url, ...resto } = pagina;
    void chave;
    void imagem_url;

    return JSON.stringify({ ...resto, imagem: imagem?.name ?? null });
}

export default function MenuBoardsForm({ titulo, board, produtos, pareamento }: Props) {
    const { data, setData, post, transform, processing, errors, isDirty } = useForm<MenuBoardFormValues>({
        nome: board?.nome ?? '',
        tema: board?.tema ?? 'dark',
        paginas: board?.paginas.map(paginaDoServidor) ?? [],
    });
    const [iniciais] = useState(() => new Map(data.paginas.map((pagina) => [pagina.chave, assinatura(pagina)])));
    const [selecionada, setSelecionada] = useState(0);
    const [escolhaDeLayout, setEscolhaDeLayout] = useState<EscolhaDeLayout | null>(null);
    const [paginaParaExcluir, setPaginaParaExcluir] = useState<number | null>(null);
    const [fotoProdutoId, setFotoProdutoId] = useState<number | null>(null);
    const [errosAbertos, setErrosAbertos] = useState(false);

    const grupos = useMemo(() => gruposDosProdutos(produtos), [produtos]);
    const erros = errors as Record<string, string | undefined>;
    const pagina = data.paginas[selecionada];

    const imagensPrevias = useMemo(() => {
        const urls: Record<string, string> = {};
        data.paginas.forEach((item) => {
            if (item.imagem) {
                urls[item.chave] = URL.createObjectURL(item.imagem);
            }
        });

        return urls;
    }, [data.paginas]);

    useEffect(() => () => Object.values(imagensPrevias).forEach((url) => URL.revokeObjectURL(url)), [imagensPrevias]);

    const alteradas = useMemo(
        () => new Set(data.paginas.filter((item) => iniciais.get(item.chave) !== assinatura(item)).map((item) => item.chave)),
        [data.paginas, iniciais],
    );

    const comErro = useMemo(() => {
        const indices = new Set<number>();
        Object.keys(erros).forEach((campo) => {
            const achado = campo.match(/^paginas\.(\d+)\./);
            if (achado) {
                indices.add(Number(achado[1]));
            }
        });

        return indices;
    }, [erros]);

    function errosDaPagina(indice: number): Record<string, string | undefined> {
        const prefixo = `paginas.${indice}.`;

        return Object.fromEntries(
            Object.entries(erros)
                .filter(([campo]) => campo.startsWith(prefixo))
                .map(([campo, mensagem]) => [campo.slice(prefixo.length).replace(/^itens\.\d+\..*/, 'itens'), mensagem]),
        );
    }

    function alterarPagina(indice: number, campos: Partial<PaginaForm>): void {
        setData(
            'paginas',
            data.paginas.map((item, atual) => (atual === indice ? { ...item, ...campos } : item)),
        );
    }

    function escolherLayout(layout: LayoutPagina): void {
        if (escolhaDeLayout?.modo === 'trocar') {
            const atual = data.paginas[escolhaDeLayout.indice];
            const nova = novaPagina(layout);
            const nomePadrao = atual.nome === infoDoLayout(atual.layout).nomePadrao;

            alterarPagina(escolhaDeLayout.indice, {
                layout,
                nome: nomePadrao ? nova.nome : atual.nome,
                configuracao: { ...nova.configuracao, ...atual.configuracao },
            });
        } else {
            setData('paginas', [...data.paginas, novaPagina(layout)]);
            setSelecionada(data.paginas.length);
        }

        setEscolhaDeLayout(null);
    }

    function duplicar(indice: number): void {
        const copia = { ...data.paginas[indice], chave: novaChave(), nome: `${data.paginas[indice].nome} (cópia)` };
        const paginas = [...data.paginas];
        paginas.splice(indice + 1, 0, copia);
        setData('paginas', paginas);
        setSelecionada(indice + 1);
    }

    function excluir(): void {
        if (paginaParaExcluir === null) {
            return;
        }

        setData(
            'paginas',
            data.paginas.filter((_, indice) => indice !== paginaParaExcluir),
        );
        setSelecionada(Math.max(0, Math.min(selecionada, data.paginas.length - 2)));
        setPaginaParaExcluir(null);
    }

    function salvar(event?: React.FormEvent): void {
        event?.preventDefault();

        transform((dados) => ({
            ...dados,
            paginas: dados.paginas.map(({ chave, imagem_url, ...resto }) => {
                void chave;
                void imagem_url;

                return resto;
            }),
            ...(board ? { _method: 'put' } : {}),
        }));

        post(board ? route('menu-boards.update', board.id) : route('menu-boards.store'), {
            forceFormData: true,
            preserveScroll: true,
            onError: (recebidos) => {
                const primeira = Object.keys(recebidos)
                    .map((campo) => campo.match(/^paginas\.(\d+)\./)?.[1])
                    .find((indice) => indice !== undefined);
                if (primeira !== undefined) {
                    setSelecionada(Number(primeira));
                }
                setErrosAbertos(true);
            },
        });
    }

    const fotoProduto = produtos.find((produto) => produto.id === fotoProdutoId) ?? null;
    const avisoNaoSalvo = isDirty ? (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-amber-700 dark:text-amber-400">
            <span aria-hidden="true" className="size-2 rounded-full bg-amber-600" />
            Alterações não salvas
        </span>
    ) : null;

    return (
        <>
            <form
                onSubmit={salvar}
                className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto rounded-xl p-4 pb-32 md:gap-4 md:pb-4"
                noValidate
            >
                <Link
                    href={route('menu-boards')}
                    className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm font-medium"
                >
                    <ArrowLeft className="size-4" />
                    Meus Menu Boards
                </Link>

                <PageTitle
                    title={titulo}
                    subtitle={
                        board
                            ? 'Monte as páginas que a TV vai alternar e quanto tempo cada uma fica na tela.'
                            : 'Dê um nome, escolha o tema e adicione a primeira página.'
                    }
                    actions={
                        <div className="hidden items-center gap-3 md:flex">
                            {avisoNaoSalvo}
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('menu-boards')}>Cancelar</Link>
                            </Button>
                            <Button type="submit" variant="primary" loading={processing}>
                                <Check className="h-4 w-4" />
                                Salvar Board
                            </Button>
                        </div>
                    }
                />

                <div className="flex flex-wrap items-start gap-4 md:gap-6">
                    <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-3 md:gap-4">
                        <MenuBoardsDados
                            nome={data.nome}
                            tema={data.tema}
                            abertoDeInicio={!board}
                            erros={{ nome: errors.nome, tema: errors.tema }}
                            onNome={(nome) => setData('nome', nome)}
                            onTema={(tema) => setData('tema', tema)}
                        />

                        <MenuBoardsPaginas
                            paginas={data.paginas}
                            selecionada={selecionada}
                            alteradas={alteradas}
                            comErro={comErro}
                            onSelecionar={setSelecionada}
                            onNovaPagina={() => setEscolhaDeLayout({ modo: 'nova' })}
                        />
                        <InputError message={erros.paginas} />

                        {pagina ? (
                            <MenuBoardsPaginaEditor
                                key={pagina.chave}
                                indice={selecionada}
                                total={data.paginas.length}
                                pagina={pagina}
                                produtos={produtos}
                                grupos={grupos}
                                imagemPrevia={imagensPrevias[pagina.chave] ?? null}
                                erros={errosDaPagina(selecionada)}
                                onAlterar={(campos) => alterarPagina(selecionada, campos)}
                                onConfig={(campos) => alterarPagina(selecionada, { configuracao: { ...pagina.configuracao, ...campos } })}
                                onItens={(itens) => alterarPagina(selecionada, { itens })}
                                onImagem={(imagem) => alterarPagina(selecionada, { imagem })}
                                onTrocarLayout={() => setEscolhaDeLayout({ modo: 'trocar', indice: selecionada })}
                                onDuplicar={() => duplicar(selecionada)}
                                onExcluir={() => setPaginaParaExcluir(selecionada)}
                                onFoto={(produto) => setFotoProdutoId(produto.id)}
                            />
                        ) : null}
                    </div>

                    <aside className="flex min-w-0 flex-[1_1_440px] flex-col gap-4 md:sticky md:top-4">
                        <MenuBoardsPrevia
                            nomeBoard={data.nome}
                            tema={data.tema}
                            paginas={data.paginas}
                            selecionada={selecionada}
                            produtos={produtos}
                            imagensPrevias={imagensPrevias}
                            onSelecionar={setSelecionada}
                        />
                        <MenuBoardsStatusTv ativo={Boolean(board?.ativo)} tvsConectadas={pareamento.dispositivos.length} />
                    </aside>
                </div>

                <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col gap-2 border-t bg-white px-4 pt-2.5 pb-5 md:hidden dark:bg-slate-900">
                    {avisoNaoSalvo}
                    <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant="outline" className="h-12 text-base" asChild>
                            <Link href={route('menu-boards')}>Cancelar</Link>
                        </Button>
                        <Button type="submit" variant="primary" className="h-12 justify-center" loading={processing}>
                            Salvar Board
                        </Button>
                    </div>
                </div>
            </form>

            <MenuBoardsLayoutPicker
                aberto={escolhaDeLayout !== null}
                titulo={escolhaDeLayout?.modo === 'trocar' ? 'Trocar layout' : 'Nova página'}
                textoConfirmar={escolhaDeLayout?.modo === 'trocar' ? 'Trocar layout' : 'Criar página'}
                atual={escolhaDeLayout?.modo === 'trocar' ? data.paginas[escolhaDeLayout.indice]?.layout : undefined}
                onOpenChange={(aberto) => {
                    if (!aberto) {
                        setEscolhaDeLayout(null);
                    }
                }}
                onEscolher={escolherLayout}
            />

            <ConfirmDeleteModal
                open={paginaParaExcluir !== null}
                onOpenChange={(aberto) => {
                    if (!aberto) {
                        setPaginaParaExcluir(null);
                    }
                }}
                title="Excluir página"
                description={`Deseja excluir a página "${paginaParaExcluir !== null ? data.paginas[paginaParaExcluir]?.nome : ''}"? Ela sai do board quando você salvar.`}
                processing={false}
                onConfirm={excluir}
            />

            <MenuBoardsErrosModal
                aberto={errosAbertos}
                paginas={data.paginas}
                produtos={produtos}
                grupos={grupos}
                imagensPrevias={imagensPrevias}
                erros={erros}
                processing={processing}
                nomeBoard={data.nome}
                onOpenChange={setErrosAbertos}
                onNome={(nome) => setData('nome', nome)}
                onAlterarPagina={alterarPagina}
                onConfig={(indice, campos) => {
                    const atual = data.paginas[indice];
                    alterarPagina(indice, { configuracao: { ...atual.configuracao, ...campos } });
                }}
                onItens={(indice, itens) => alterarPagina(indice, { itens })}
                onImagem={(indice, imagem) => alterarPagina(indice, { imagem })}
                onFoto={(produto) => setFotoProdutoId(produto.id)}
                onSalvar={() => salvar()}
            />

            <MenuBoardsFotoModal
                produto={fotoProduto}
                onOpenChange={(aberto) => {
                    if (!aberto) {
                        setFotoProdutoId(null);
                    }
                }}
            />
        </>
    );
}
