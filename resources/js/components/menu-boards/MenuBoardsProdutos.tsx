import { formatarPreco, type ProdutoDoBoard } from '@/components/menu-boards/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = {
    produtos: ProdutoDoBoard[];
    selecionados: number[];
    onToggle: (produto: ProdutoDoBoard) => void;
    onFoto: (produto: ProdutoDoBoard) => void;
};

function Miniatura({ produto, onFoto, tamanho }: { produto: ProdutoDoBoard; onFoto: (produto: ProdutoDoBoard) => void; tamanho: string }) {
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

/**
 * Lista de produtos ativos para marcar quais entram na página; a ordem na TV é a ordem em que foram marcados.
 */
export default function MenuBoardsProdutos({ produtos, selecionados, onToggle, onFoto }: Props) {
    const [busca, setBusca] = useState('');

    const filtrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        return produtos.filter((produto) => !termo || produto.nome.toLowerCase().includes(termo));
    }, [produtos, busca]);

    if (produtos.length === 0) {
        return (
            <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-sm">
                Nenhum produto ativo. <Link href={route('produtos')}>Cadastre produtos</Link> com preço de venda para montar o board.
            </p>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-2 border-b border-slate-100 p-3 md:flex-row md:items-center md:justify-between dark:border-slate-800">
                <label htmlFor="menu-board-busca" className="sr-only">
                    Buscar produto
                </label>
                <Input
                    id="menu-board-busca"
                    type="search"
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Buscar produto"
                    className="h-11 w-full text-base md:h-9 md:w-64 md:text-sm"
                />
                <span className="text-muted-foreground text-xs">
                    {selecionados.length} de {produtos.length} produtos na página
                </span>
            </div>
            <ul>
                {filtrados.map((produto) => {
                    const marcado = selecionados.includes(produto.id);

                    return (
                        <li
                            key={produto.id}
                            className={`flex items-center gap-2 border-b border-slate-100 py-1.5 pr-3 pl-1 last:border-b-0 md:gap-3 md:pl-3 dark:border-slate-800 ${marcado ? '' : 'opacity-70'}`}
                        >
                            <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center">
                                <Checkbox
                                    checked={marcado}
                                    onCheckedChange={() => onToggle(produto)}
                                    aria-label={`Exibir ${produto.nome} na página`}
                                />
                            </label>
                            <Miniatura produto={produto} onFoto={onFoto} tamanho="size-11" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{produto.nome}</p>
                                <p className="text-muted-foreground truncate text-xs">
                                    {produto.grupo?.nome ? `${produto.grupo.nome} · ` : ''}
                                    {produto.descricao || 'Sem descrição'}
                                </p>
                            </div>
                            <span className="text-sm font-semibold whitespace-nowrap tabular-nums">{formatarPreco(produto.preco_venda)}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
