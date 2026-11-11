import { useAsyncOptions, type SelectOption } from '@/components/ui/async-select-options';
import { bindMenuScroll } from '@/components/ui/AsyncSelect';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { quantidadeTexto } from '@/components/vendas/itensDaVenda';
import { formatCurrency, type ProdutoSugerido } from '@/components/vendas/types';
import { ChevronLeft, ChevronRight, ImageOff, Search, Star } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

const CHAVE_DETALHES = 'horizonte:venda-busca-detalhes';

type Props = {
    loadProdutos: (q: string) => Promise<ProdutoSugerido[]>;
    onAdicionar: (produto: ProdutoSugerido) => void;
    quantidadePorProduto: Map<number, number>;
    disabled?: boolean;
};

function lerDetalhesAbertos(): boolean {
    try {
        return window.localStorage.getItem(CHAVE_DETALHES) !== '0';
    } catch {
        return true;
    }
}

function gravarDetalhesAbertos(aberto: boolean): void {
    try {
        window.localStorage.setItem(CHAVE_DETALHES, aberto ? '1' : '0');
    } catch {
        // Sem storage (aba privada): o painel só não é lembrado.
    }
}

function Miniatura({ produto, className }: { produto: ProdutoSugerido; className: string }) {
    if (produto.foto_url) {
        return <img src={produto.foto_url} alt="" className={`${className} bg-muted object-cover`} />;
    }

    return (
        <span className={`${className} bg-muted text-muted-foreground flex items-center justify-center`} aria-hidden="true">
            <ImageOff className="h-4 w-4" />
        </span>
    );
}

function Tecla({ children }: { children: string }) {
    return <kbd className="bg-background rounded border px-1.5 py-px font-sans text-[11px] font-semibold">{children}</kbd>;
}

/**
 * Busca de produto da Nova venda no desktop: sugestões com miniatura, código, grupo e preço,
 * e um painel de detalhes do item destacado (→ ou Ctrl+Espaço abre, ← fecha; lembrado entre vendas).
 */
export default function VendaBuscaProduto({ loadProdutos, onAdicionar, quantidadePorProduto, disabled = false }: Props) {
    const { options, isLoading, fetchOptions, scheduleFetch, cancelPending, hasPendingSearch } = useAsyncOptions({
        loadOptions: loadProdutos,
    });
    const [termo, setTermo] = useState('');
    const [aberto, setAberto] = useState(false);
    const [ativo, setAtivo] = useState(0);
    const [detalhes, setDetalhes] = useState(true);
    const anchorRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listaId = useId();

    useEffect(() => setDetalhes(lerDetalhesAbertos()), []);
    useEffect(() => setAtivo(0), [options]);
    const rolarAteAtivo = useRef(false);
    const soltarRolagem = useRef<(() => void) | null>(null);
    const listaRef = useCallback((node: HTMLUListElement | null) => {
        soltarRolagem.current?.();
        soltarRolagem.current = node ? bindMenuScroll(node) : null;
    }, []);

    useEffect(() => {
        if (!rolarAteAtivo.current) {
            return;
        }
        rolarAteAtivo.current = false;
        document.getElementById(`${listaId}-${ativo}`)?.scrollIntoView({ block: 'nearest' });
    }, [ativo, listaId]);

    const produtos = options.map((option: SelectOption) => option.__raw as ProdutoSugerido);
    const destacado = produtos[ativo] ?? null;

    function alternarDetalhes(valor: boolean): void {
        setDetalhes(valor);
        gravarDetalhesAbertos(valor);
    }

    function adicionar(produto: ProdutoSugerido): void {
        onAdicionar(produto);
        setTermo('');
        setAberto(false);
        inputRef.current?.focus();
    }

    function abrir(): void {
        if (!aberto) {
            setAberto(true);
            cancelPending();
            fetchOptions(termo);
        }
    }

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
        const noFim = event.currentTarget.selectionStart === event.currentTarget.value.length;

        if (event.key === 'Escape' && aberto) {
            event.preventDefault();
            setAberto(false);
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!aberto) {
                abrir();
                return;
            }
            const passo = event.key === 'ArrowDown' ? 1 : -1;
            rolarAteAtivo.current = true;
            setAtivo((atual) => (produtos.length === 0 ? 0 : (atual + passo + produtos.length) % produtos.length));
            return;
        }

        if (event.key === ' ' && event.ctrlKey) {
            event.preventDefault();
            alternarDetalhes(!detalhes);
            return;
        }

        if (aberto && noFim && event.key === 'ArrowRight' && !detalhes && destacado) {
            event.preventDefault();
            alternarDetalhes(true);
            return;
        }

        if (aberto && noFim && event.key === 'ArrowLeft' && detalhes) {
            event.preventDefault();
            alternarDetalhes(false);
            return;
        }

        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();
        const busca = termo.trim();

        if (busca !== '' && (hasPendingSearch() || isLoading)) {
            cancelPending();
            fetchOptions(busca, (carregados) => {
                const [primeiro] = carregados;
                if (primeiro) {
                    adicionar(primeiro.__raw as ProdutoSugerido);
                }
            });
            return;
        }

        if (destacado && (aberto || busca !== '')) {
            adicionar(destacado);
        }
    }

    const quantidadeDestacado = destacado ? (quantidadePorProduto.get(destacado.id) ?? 0) : 0;

    return (
        <Popover open={aberto} onOpenChange={setAberto}>
            <PopoverAnchor asChild>
                <div
                    ref={anchorRef}
                    className="border-input focus-within:border-ring focus-within:ring-ring flex h-11 items-center gap-2 rounded-md border px-3 focus-within:ring-1"
                >
                    <Search className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        role="combobox"
                        aria-label="Adicionar produto"
                        aria-expanded={aberto}
                        aria-controls={aberto ? listaId : undefined}
                        aria-autocomplete="list"
                        aria-activedescendant={aberto && destacado ? `${listaId}-${ativo}` : undefined}
                        className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none disabled:opacity-50"
                        placeholder="Adicionar produto (nome ou código)"
                        autoComplete="off"
                        value={termo}
                        disabled={disabled}
                        onFocus={abrir}
                        onClick={abrir}
                        onChange={(event) => {
                            setTermo(event.target.value);
                            setAberto(true);
                            scheduleFetch(event.target.value);
                        }}
                        onKeyDown={onKeyDown}
                    />
                </div>
            </PopoverAnchor>
            {/*
             * pointer-events-auto: o Dialog deixa o body com pointer-events none e o Popover usa outra
             * cópia do DismissableLayer do Radix, então não se sabe acima do Dialog e herdaria o none.
             */}
            <PopoverContent
                align="start"
                className="pointer-events-auto flex max-h-[min(26rem,var(--radix-popover-content-available-height))] overflow-hidden p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
                onCloseAutoFocus={(event) => event.preventDefault()}
                onInteractOutside={(event) => {
                    if (anchorRef.current?.contains(event.target as Node)) {
                        event.preventDefault();
                    }
                }}
            >
                <div className="flex w-[min(36rem,var(--radix-popover-trigger-width))] min-w-[28rem] flex-col">
                    <ul
                        ref={listaRef}
                        id={listaId}
                        role="listbox"
                        aria-label="Sugestões de produto"
                        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
                    >
                        {produtos.map((produto, index) => {
                            const quantidade = quantidadePorProduto.get(produto.id) ?? 0;
                            const subtitulo = [
                                produto.codigo ? `Cód. ${produto.codigo}` : null,
                                produto.grupo,
                                quantidade > 0 ? `${quantidadeTexto(quantidade)} na venda` : null,
                            ]
                                .filter(Boolean)
                                .join(' · ');

                            return (
                                <li
                                    key={produto.id}
                                    id={`${listaId}-${index}`}
                                    role="option"
                                    aria-selected={index === ativo}
                                    className={`flex cursor-pointer items-center gap-3 border-t px-3 py-2 first:border-t-0 ${
                                        index === ativo ? 'bg-accent text-accent-foreground shadow-[inset_3px_0_0_var(--primary)]' : ''
                                    }`}
                                    onMouseEnter={() => setAtivo(index)}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => adicionar(produto)}
                                >
                                    <Miniatura produto={produto} className="h-10 w-10 shrink-0 rounded-md" />
                                    <span className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate text-sm font-semibold">{produto.nome}</span>
                                        {subtitulo ? <span className="text-muted-foreground truncate text-xs">{subtitulo}</span> : null}
                                    </span>
                                    <span className="text-sm font-bold tabular-nums">{formatCurrency(Number(produto.preco_venda))}</span>
                                </li>
                            );
                        })}
                        {produtos.length === 0 ? (
                            <li role="status" aria-live="polite" className="text-muted-foreground px-3 py-4 text-center text-sm">
                                {isLoading ? 'Buscando…' : 'Nenhum produto encontrado'}
                            </li>
                        ) : null}
                    </ul>
                    <div className="bg-muted/40 text-muted-foreground flex items-center gap-3 border-t px-3 py-1.5 text-xs">
                        <span>
                            <Tecla>↑↓</Tecla> navegar
                        </span>
                        <span>
                            <Tecla>Enter</Tecla> adicionar
                        </span>
                        <button
                            type="button"
                            aria-expanded={detalhes}
                            title="Atalho: Ctrl+Espaço"
                            className="text-primary bg-background hover:bg-accent ml-auto inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 font-semibold transition-colors"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => alternarDetalhes(!detalhes)}
                        >
                            {detalhes ? <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                            {detalhes ? 'Recolher detalhes' : 'Ver detalhes'}
                            {detalhes ? null : <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
                            <Tecla>Ctrl+Espaço</Tecla>
                        </button>
                    </div>
                </div>

                {detalhes && destacado ? (
                    <aside aria-label="Detalhes do produto" className="bg-muted/40 flex w-80 shrink-0 flex-col gap-3 overflow-y-auto border-l p-4">
                        <Miniatura produto={destacado} className="h-36 w-full rounded-lg" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-base leading-snug font-bold">{destacado.nome}</span>
                            {destacado.codigo ? <span className="text-muted-foreground text-xs">Cód. {destacado.codigo}</span> : null}
                        </div>
                        <span className="text-2xl font-bold tabular-nums">{formatCurrency(Number(destacado.preco_venda))}</span>
                        <dl className="flex flex-col gap-1.5 text-sm">
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">Grupo</dt>
                                <dd className="truncate font-semibold">{destacado.grupo ?? '—'}</dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <div className="flex gap-1.5">
                                    <dt className="text-muted-foreground">Na venda</dt>
                                    <dd className="font-semibold">{quantidadeDestacado > 0 ? `${quantidadeTexto(quantidadeDestacado)} un.` : '—'}</dd>
                                </div>
                                <div className="flex gap-1.5">
                                    <dt className="text-muted-foreground">Favorito</dt>
                                    <dd className="flex items-center gap-1 font-semibold">
                                        {destacado.favorito ? (
                                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                                        ) : null}
                                        {destacado.favorito ? 'Sim' : 'Não'}
                                    </dd>
                                </div>
                            </div>
                        </dl>
                        {destacado.descricao ? <p className="text-sm leading-relaxed whitespace-pre-line">{destacado.descricao}</p> : null}
                    </aside>
                ) : null}
            </PopoverContent>
        </Popover>
    );
}
