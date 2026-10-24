import InputError from '@/components/input-error';
import MenuBoardsFotoModal from '@/components/menu-boards/MenuBoardsFotoModal';
import MenuBoardsPareamento from '@/components/menu-boards/MenuBoardsPareamento';
import MenuBoardsProdutos from '@/components/menu-boards/MenuBoardsProdutos';
import MenuBoardsTemaPicker from '@/components/menu-boards/MenuBoardsTemaPicker';
import type { MenuBoardEdicao, MenuBoardFormValues, PareamentoTv, ProdutoDoBoard } from '@/components/menu-boards/types';
import { PageTitle } from '@/components/padrões';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';

type Props = {
    titulo: string;
    board: MenuBoardEdicao | null;
    produtos: ProdutoDoBoard[];
    pareamento: PareamentoTv;
};

export default function MenuBoardsForm({ titulo, board, produtos, pareamento }: Props) {
    const [fotoProdutoId, setFotoProdutoId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors } = useForm<MenuBoardFormValues>({
        nome: board?.nome ?? '',
        tema: board?.tema ?? 'dark',
        itens: board?.itens ?? [],
    });

    function toggleExibir(produto: ProdutoDoBoard): void {
        const exibindo = data.itens.some((item) => item.produto_id === produto.id);

        setData(
            'itens',
            exibindo ? data.itens.filter((item) => item.produto_id !== produto.id) : [...data.itens, { produto_id: produto.id, destaque: false }],
        );
    }

    function toggleDestaque(produto: ProdutoDoBoard): void {
        setData(
            'itens',
            data.itens.map((item) => (item.produto_id === produto.id ? { ...item, destaque: !item.destaque } : item)),
        );
    }

    function salvar(event: React.FormEvent): void {
        event.preventDefault();

        if (board) {
            put(route('menu-boards.update', board.id));
            return;
        }

        post(route('menu-boards.store'));
    }

    const erroItens = Object.entries(errors).find(([campo]) => campo.startsWith('itens'))?.[1];
    const fotoProduto = produtos.find((produto) => produto.id === fotoProdutoId) ?? null;

    return (
        <>
            <form
                onSubmit={salvar}
                className="flex h-full w-full max-w-full min-w-0 flex-1 flex-col gap-2 overflow-x-hidden rounded-xl p-4 pb-28 md:gap-4 md:pb-4"
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
                    actions={
                        <div className="hidden gap-2 md:flex">
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
                    <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-4 md:gap-6">
                        <section className="border-sidebar-border/70 flex flex-col gap-5 rounded-xl border bg-white p-4 shadow-sm md:p-6 dark:bg-slate-900">
                            <h2 className="text-base font-semibold">Dados do board</h2>
                            <div className="grid gap-2">
                                <Label htmlFor="menu_board_nome">Nome do Board</Label>
                                <Input
                                    id="menu_board_nome"
                                    value={data.nome}
                                    onChange={(event) => setData('nome', event.target.value)}
                                    placeholder="Ex.: Menu Almoço"
                                    maxLength={80}
                                    className="h-11 max-w-md text-base md:h-10 md:text-sm"
                                />
                                <span className="text-muted-foreground text-xs">Aparece no cabeçalho da TV.</span>
                                <InputError message={errors.nome} />
                            </div>
                            <MenuBoardsTemaPicker value={data.tema} onChange={(tema) => setData('tema', tema)} />
                            <InputError message={errors.tema} />
                        </section>

                        <MenuBoardsProdutos
                            produtos={produtos}
                            itens={data.itens}
                            onToggleExibir={toggleExibir}
                            onToggleDestaque={toggleDestaque}
                            onFoto={(produto) => setFotoProdutoId(produto.id)}
                        />
                        <InputError message={erroItens} />
                    </div>

                    <div className="min-w-0 flex-[1_1_320px]">
                        <MenuBoardsPareamento pareamento={pareamento} />
                    </div>
                </div>

                <div className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-2 gap-2 border-t bg-white px-4 pt-3 pb-5 md:hidden dark:bg-slate-900">
                    <Button type="button" variant="outline" className="h-12 text-base" asChild>
                        <Link href={route('menu-boards')}>Cancelar</Link>
                    </Button>
                    <Button type="submit" variant="primary" className="h-12 justify-center" loading={processing}>
                        Salvar Board
                    </Button>
                </div>
            </form>

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
