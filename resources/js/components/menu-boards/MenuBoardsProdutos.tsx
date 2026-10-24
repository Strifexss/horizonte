import { formatarPreco, type MenuBoardItemForm, type ProdutoDoBoard } from '@/components/menu-boards/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { Plus, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = {
    produtos: ProdutoDoBoard[];
    itens: MenuBoardItemForm[];
    onToggleExibir: (produto: ProdutoDoBoard) => void;
    onToggleDestaque: (produto: ProdutoDoBoard) => void;
    onFoto: (produto: ProdutoDoBoard) => void;
};

type LinhaProduto = {
    produto: ProdutoDoBoard;
    exibir: boolean;
    destaque: boolean;
};

function Miniatura({ linha, onFoto, tamanho }: { linha: LinhaProduto; onFoto: (produto: ProdutoDoBoard) => void; tamanho: string }) {
    const { produto } = linha;

    return (
        <button
            type="button"
            onClick={() => onFoto(produto)}
            aria-label={produto.foto_url ? `Trocar foto de ${produto.nome}` : `Adicionar foto a ${produto.nome}`}
            className={`${tamanho} flex shrink-0 items-center justify-center overflow-hidden rounded-lg hover:border-amber-500 ${
                produto.foto_url
                    ? 'border border-transparent'
                    : 'border-[1.5px] border-dashed border-slate-300 bg-slate-50 text-slate-400 dark:border-slate-600 dark:bg-slate-800'
            }`}
        >
            {produto.foto_url ? <img src={produto.foto_url} alt="" className="size-full object-cover" /> : <Plus className="size-4" />}
        </button>
    );
}

function BotaoDestaque({ linha, onToggleDestaque }: { linha: LinhaProduto; onToggleDestaque: (produto: ProdutoDoBoard) => void }) {
    const ativo = linha.exibir && linha.destaque;

    return (
        <button
            type="button"
            disabled={!linha.exibir}
            aria-pressed={ativo}
            aria-label={`Destacar ${linha.produto.nome}`}
            onClick={() => onToggleDestaque(linha.produto)}
            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-35 md:size-9 ${
                ativo
                    ? 'border-amber-300 bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                    : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'
            }`}
        >
            <Star className="size-[18px]" fill={ativo ? 'currentColor' : 'none'} />
        </button>
    );
}

export default function MenuBoardsProdutos({ produtos, itens, onToggleExibir, onToggleDestaque, onFoto }: Props) {
    const [busca, setBusca] = useState('');

    const linhas = useMemo<LinhaProduto[]>(() => {
        const termo = busca.trim().toLowerCase();

        return produtos
            .filter((produto) => !termo || produto.nome.toLowerCase().includes(termo))
            .map((produto) => {
                const item = itens.find((atual) => atual.produto_id === produto.id);

                return { produto, exibir: item !== undefined, destaque: item?.destaque ?? false };
            });
    }, [produtos, itens, busca]);

    const qtdDestaque = itens.filter((item) => item.destaque).length;
    const qtdFoto = itens.filter((item) => produtos.find((produto) => produto.id === item.produto_id)?.foto_url).length;

    return (
        <section className="border-sidebar-border/70 overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-900">
            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5">
                <div>
                    <h2 className="text-base font-semibold">Produtos</h2>
                    <p className="text-muted-foreground text-sm">
                        {itens.length} na TV · {qtdDestaque} em destaque · {qtdFoto} com foto
                    </p>
                </div>
                <label htmlFor="menu-board-busca" className="sr-only">
                    Buscar produto
                </label>
                <Input
                    id="menu-board-busca"
                    type="search"
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Buscar produto"
                    className="h-11 w-full text-base md:h-9 md:w-60 md:text-sm"
                />
            </div>

            {produtos.length === 0 ? (
                <p className="text-muted-foreground border-t border-slate-100 px-6 py-8 text-center text-sm dark:border-slate-800">
                    Nenhum produto ativo. <Link href={route('produtos')}>Cadastre produtos</Link> com preço de venda para montar o board.
                </p>
            ) : null}

            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                    <thead>
                        <tr className="text-muted-foreground border-y border-slate-100 bg-slate-50 text-xs font-semibold dark:border-slate-800 dark:bg-slate-800/50">
                            <th scope="col" className="w-32 px-6 py-2.5 text-left">
                                EXIBIR NA TV
                            </th>
                            <th scope="col" className="w-20 px-3 py-2.5 text-left">
                                FOTO
                            </th>
                            <th scope="col" className="px-3 py-2.5 text-left">
                                PRODUTO
                            </th>
                            <th scope="col" className="px-3 py-2.5 text-right">
                                PREÇO
                            </th>
                            <th scope="col" className="w-28 px-6 py-2.5 text-center">
                                DESTAQUE
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.map((linha) => (
                            <tr
                                key={linha.produto.id}
                                className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-700/60"
                            >
                                <td className="px-6 py-3">
                                    <label className="inline-flex min-h-8 cursor-pointer items-center gap-2">
                                        <Checkbox
                                            checked={linha.exibir}
                                            onCheckedChange={() => onToggleExibir(linha.produto)}
                                            aria-label={`Exibir ${linha.produto.nome} na TV`}
                                        />
                                        <span className="text-muted-foreground text-xs">{linha.exibir ? 'Exibir' : 'Oculto'}</span>
                                    </label>
                                </td>
                                <td className="px-3 py-2">
                                    <Miniatura linha={linha} onFoto={onFoto} tamanho="size-12" />
                                </td>
                                <td className="px-3 py-3">
                                    <p className="font-semibold">{linha.produto.nome}</p>
                                    <p className="text-muted-foreground text-xs">{linha.produto.descricao || 'Sem descrição'}</p>
                                </td>
                                <td className="px-3 py-3 text-right font-semibold whitespace-nowrap tabular-nums">
                                    {formatarPreco(linha.produto.preco_venda)}
                                </td>
                                <td className="px-6 py-3 text-center">
                                    <BotaoDestaque linha={linha} onToggleDestaque={onToggleDestaque} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ul className="md:hidden">
                {linhas.map((linha) => (
                    <li
                        key={linha.produto.id}
                        className={`flex items-center gap-2 border-t border-slate-100 py-2 pr-3 pl-1 dark:border-slate-800 ${linha.exibir ? '' : 'opacity-60'}`}
                    >
                        <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center">
                            <Checkbox
                                checked={linha.exibir}
                                onCheckedChange={() => onToggleExibir(linha.produto)}
                                aria-label={`Exibir ${linha.produto.nome} na TV`}
                            />
                        </label>
                        <Miniatura linha={linha} onFoto={onFoto} tamanho="size-11" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{linha.produto.nome}</p>
                            <p className="text-muted-foreground text-xs">
                                {linha.produto.grupo?.nome ? `${linha.produto.grupo.nome} · ` : ''}
                                <strong className="text-foreground font-semibold">{formatarPreco(linha.produto.preco_venda)}</strong>
                            </p>
                        </div>
                        <BotaoDestaque linha={linha} onToggleDestaque={onToggleDestaque} />
                    </li>
                ))}
            </ul>

            <p className="text-muted-foreground border-t border-slate-100 px-4 py-3 text-xs md:px-6 dark:border-slate-800">
                Itens em destaque ganham cards maiores no topo da TV. Recomendado: até 3. A foto é opcional; sem ela, o card mostra só o texto.
            </p>
        </section>
    );
}
