import { PARAMETRO_NOVO } from '@/hooks/use-abrir-novo-pela-url';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowDownUp, CreditCard, Package, ShoppingCart, Tv, type LucideIcon } from 'lucide-react';

type Acao = {
    chave: string;
    titulo: string;
    tituloCurto: string;
    descricao: string;
    href: string;
    icone: LucideIcon;
};

export default function InicioAcoes() {
    const modulos = usePage<SharedData>().props.empresa?.modulos ?? [];
    const temMenuBoard = modulos.includes('menu_board');

    const novaVenda: Acao = {
        chave: 'venda',
        titulo: 'Nova venda',
        tituloCurto: 'Nova venda',
        descricao: 'Cliente no balcão? Escolha os produtos e como ele pagou. A receita vai para o Extrato sozinha.',
        href: route('vendas', { [PARAMETRO_NOVO]: 1 }),
        icone: ShoppingCart,
    };

    const outras: Acao[] = [
        {
            chave: 'lancamento',
            titulo: 'Lançar receita ou despesa',
            tituloCurto: 'Receita ou despesa',
            descricao: 'Entradas e saídas fora do balcão: aluguel, fornecedor, conta de luz.',
            href: route('extrato.index', { [PARAMETRO_NOVO]: 1 }),
            icone: ArrowDownUp,
        },
        {
            chave: 'produto',
            titulo: 'Cadastrar produto',
            tituloCurto: 'Produto',
            descricao: temMenuBoard
                ? 'O que você vende, com o preço. Aparece na venda e no Menu Board.'
                : 'O que você vende, com o preço. Aparece na venda.',
            href: route('produtos', { [PARAMETRO_NOVO]: 1 }),
            icone: Package,
        },
    ];

    if (temMenuBoard) {
        outras.push({
            chave: 'menu-board',
            titulo: 'Menu Board na TV',
            tituloCurto: 'Menu Board',
            descricao: 'Mostre o cardápio na TV do balcão com seus produtos e Destaques.',
            href: route('menu-boards'),
            icone: Tv,
        });
    } else {
        outras.push({
            chave: 'forma-pagamento',
            titulo: 'Cadastrar forma de pagamento',
            tituloCurto: 'Forma de pagamento',
            descricao: 'Pix, dinheiro, cartão. Aparece na hora de vender.',
            href: route('formas-pagamento', { [PARAMETRO_NOVO]: 1 }),
            icone: CreditCard,
        });
    }

    const IconeVenda = novaVenda.icone;

    return (
        <section aria-labelledby="inicio-acoes" className="flex flex-col gap-3">
            <h2 id="inicio-acoes" className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                O que você quer fazer?
            </h2>

            <div className={cn('hidden gap-4 md:grid md:grid-cols-2', outras.length === 3 ? 'xl:grid-cols-4' : 'xl:grid-cols-3')}>
                {[novaVenda, ...outras].map((acao) => {
                    const Icone = acao.icone;
                    const destaque = acao === novaVenda;

                    return (
                        <Link
                            key={acao.chave}
                            href={acao.href}
                            className={cn(
                                'flex min-h-[9.5rem] flex-col gap-2.5 rounded-xl border p-5 shadow-sm transition-colors',
                                destaque
                                    ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                                    : 'border-sidebar-border/70 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-lg',
                                    destaque ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800',
                                )}
                            >
                                <Icone className="h-5 w-5" />
                            </span>
                            <span className="text-lg font-bold">{acao.titulo}</span>
                            <span className={cn('text-sm leading-snug', destaque ? 'text-blue-100' : 'text-muted-foreground')}>{acao.descricao}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="flex flex-col gap-2.5 md:hidden">
                <Link href={novaVenda.href} className="flex items-center gap-3.5 rounded-xl bg-blue-600 p-4 text-white shadow-sm active:bg-blue-700">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20">
                        <IconeVenda className="h-6 w-6" />
                    </span>
                    <span className="flex flex-col">
                        <span className="text-lg font-bold">{novaVenda.titulo}</span>
                        <span className="text-sm text-blue-100">Produtos e forma de pagamento</span>
                    </span>
                </Link>
                <div className={cn('grid gap-2.5', outras.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
                    {outras.map((acao) => {
                        const Icone = acao.icone;

                        return (
                            <Link
                                key={acao.chave}
                                href={acao.href}
                                className="border-sidebar-border/70 flex flex-col items-center gap-2 rounded-xl border bg-white px-1.5 py-3.5 text-center text-sm leading-tight font-semibold shadow-sm active:bg-slate-50 dark:bg-slate-900"
                            >
                                <Icone className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                                {acao.tituloCurto}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
