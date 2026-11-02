import { quantidadeDoProduto, quantidadeTexto, somarProduto } from '@/components/vendas/itensDaVenda';
import { formatCurrency, type PaginaDoCatalogo, type ProdutoDoCatalogo, type VendaItemRascunho, type VendaNamed } from '@/components/vendas/types';
import { Barcode, Minus, Package, Plus, Search, Star } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Aba = { chave: string; nome: string; grupoId?: number; favoritos?: boolean };

type Props = {
    itens: VendaItemRascunho[];
    onChange: (itens: VendaItemRascunho[]) => void;
    grupos: VendaNamed[];
    disabled?: boolean;
};

const BUSCA_DEBOUNCE_MS = 300;

function urlDoCatalogo(aba: Aba, termo: string, pagina: number): string {
    const params = new URLSearchParams({ page: String(pagina) });
    if (termo) {
        params.set('q', termo);
    } else if (aba.favoritos) {
        params.set('favoritos', '1');
    } else if (aba.grupoId !== undefined) {
        params.set('grupo_id', String(aba.grupoId));
    }

    return `${route('vendas.catalogo')}?${params.toString()}`;
}

/** Etapa 1 da venda no celular: busca, abas (favoritos, todos e grupos) e lista com rolagem infinita. */
export default function VendaCatalogoMobile({ itens, onChange, grupos, disabled = false }: Props) {
    const abas: Aba[] = [
        { chave: 'favoritos', nome: 'Favoritos', favoritos: true },
        { chave: 'todos', nome: 'Todos' },
        ...grupos.map((grupo) => ({ chave: `grupo-${grupo.id}`, nome: grupo.nome, grupoId: grupo.id })),
    ];
    const [abaChave, setAbaChave] = useState('favoritos');
    const [busca, setBusca] = useState('');
    const [termo, setTermo] = useState('');
    const [produtos, setProdutos] = useState<ProdutoDoCatalogo[]>([]);
    const [proximaPagina, setProximaPagina] = useState<number | null>(1);
    const [carregando, setCarregando] = useState(false);
    const requisicao = useRef(0);
    const fimDaLista = useRef<HTMLDivElement | null>(null);
    const aba = abas.find((item) => item.chave === abaChave) ?? abas[0];

    useEffect(() => {
        const timer = window.setTimeout(() => setTermo(busca.trim()), BUSCA_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [busca]);

    const carregar = useCallback(
        async (pagina: number, substituir: boolean) => {
            const id = ++requisicao.current;
            setCarregando(true);

            try {
                const res = await fetch(urlDoCatalogo(aba, termo, pagina));
                const corpo: PaginaDoCatalogo = res.ok ? await res.json() : { data: [], proxima_pagina: null };
                if (id !== requisicao.current) {
                    return;
                }

                setProdutos((atuais) => (substituir ? corpo.data : [...atuais, ...corpo.data]));
                setProximaPagina(corpo.proxima_pagina);
            } finally {
                if (id === requisicao.current) {
                    setCarregando(false);
                }
            }
        },
        // `aba` muda junto com `abaChave`; depender da chave evita recriar a cada render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [abaChave, termo],
    );

    useEffect(() => {
        setProdutos([]);
        void carregar(1, true);
    }, [carregar]);

    useEffect(() => {
        const alvo = fimDaLista.current;
        if (!alvo || proximaPagina === null) {
            return;
        }

        const observer = new IntersectionObserver((entradas) => {
            if (entradas[0]?.isIntersecting && !carregando && proximaPagina !== null) {
                void carregar(proximaPagina, false);
            }
        });
        observer.observe(alvo);

        return () => observer.disconnect();
    }, [carregar, carregando, proximaPagina]);

    function confirmarBusca(): void {
        const [primeiro] = produtos;
        if (primeiro && termo === busca.trim()) {
            onChange(somarProduto(itens, primeiro, 1));
            setBusca('');
        }
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 pt-1">
                <div className="border-input flex h-11 items-center gap-2 rounded-md border px-3">
                    <Search className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
                    <input
                        type="search"
                        aria-label="Buscar produto por nome ou código"
                        placeholder="Buscar por nome ou código"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                confirmarBusca();
                            }
                        }}
                        className="min-w-0 flex-1 bg-transparent text-base outline-none"
                    />
                    <Barcode className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />
                </div>
            </div>

            {termo === '' ? (
                <div className="-mx-6 flex shrink-0 gap-2 overflow-x-auto px-6 py-2.5">
                    {abas.map((item) => {
                        const ativa = item.chave === abaChave;

                        return (
                            <button
                                key={item.chave}
                                type="button"
                                aria-pressed={ativa}
                                onClick={() => setAbaChave(item.chave)}
                                className={`inline-flex h-9 shrink-0 items-center gap-1 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap ${
                                    ativa ? 'border-blue-600 bg-blue-600 text-white' : 'border-sidebar-border/70 bg-background'
                                }`}
                            >
                                {item.favoritos ? (
                                    <Star className={`h-3.5 w-3.5 ${ativa ? 'fill-white' : 'fill-amber-400 text-amber-500'}`} aria-hidden="true" />
                                ) : null}
                                {item.nome}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="h-2.5 shrink-0" />
            )}

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-3">
                {produtos.map((produto) => {
                    const quantidade = quantidadeDoProduto(itens, produto.id);

                    return (
                        <div
                            key={produto.id}
                            className={`flex items-center gap-2.5 rounded-lg border p-2.5 ${
                                quantidade > 0 ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40' : 'border-sidebar-border/70'
                            }`}
                        >
                            <div className="bg-muted text-muted-foreground flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-md">
                                {produto.foto_url ? (
                                    <img src={produto.foto_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <Package className="h-5 w-5" aria-hidden="true" />
                                )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate text-sm font-semibold">{produto.nome}</span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {[produto.codigo ? `Cód. ${produto.codigo}` : null, produto.grupo].filter(Boolean).join(' · ')}
                                </span>
                                <span className="text-[15px] font-bold text-blue-700 dark:text-blue-300">
                                    {formatCurrency(Number(produto.preco_venda))}
                                </span>
                            </div>
                            <div className="border-input flex h-10 shrink-0 items-center overflow-hidden rounded-md border">
                                <button
                                    type="button"
                                    aria-label={`Diminuir ${produto.nome}`}
                                    disabled={disabled || quantidade === 0}
                                    onClick={() => onChange(somarProduto(itens, produto, -1))}
                                    className="bg-muted/50 inline-flex h-full w-9 items-center justify-center disabled:opacity-40"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-9 text-center text-sm font-semibold">{quantidadeTexto(quantidade)}</span>
                                <button
                                    type="button"
                                    aria-label={`Aumentar ${produto.nome}`}
                                    disabled={disabled}
                                    onClick={() => onChange(somarProduto(itens, produto, 1))}
                                    className="bg-muted/50 inline-flex h-full w-9 items-center justify-center disabled:opacity-40"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {carregando ? (
                    <div className="flex flex-col gap-2" aria-label="Carregando produtos">
                        {[0, 1, 2].map((indice) => (
                            <div key={indice} className="bg-muted h-[74px] animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : null}

                {!carregando && produtos.length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                        {termo ? 'Nenhum produto encontrado.' : aba.favoritos ? 'Nenhum produto favorito ainda.' : 'Nenhum produto nesta aba.'}
                    </p>
                ) : null}

                <div ref={fimDaLista} className="h-1 shrink-0" />
            </div>
        </div>
    );
}
