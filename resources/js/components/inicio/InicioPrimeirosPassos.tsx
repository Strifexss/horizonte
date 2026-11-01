import type { ChavePrimeiroPasso, PrimeiroPasso } from '@/components/inicio/types';
import { PARAMETRO_NOVO } from '@/hooks/use-abrir-novo-pela-url';
import { Link } from '@inertiajs/react';
import { ChevronRight, Circle, CircleCheck } from 'lucide-react';

type Conteudo = {
    titulo: string;
    descricao: string;
    href: () => string;
};

const CONTEUDO: Record<ChavePrimeiroPasso, Conteudo> = {
    produto: {
        titulo: 'Cadastrar seus produtos',
        descricao: 'O que você vende, com o preço. Eles aparecem na hora de vender.',
        href: () => route('produtos', { [PARAMETRO_NOVO]: 1 }),
    },
    despesa: {
        titulo: 'Lançar a primeira despesa',
        descricao: 'Aluguel, fornecedor, conta de luz: tudo o que sai do caixa.',
        href: () => route('extrato.index', { [PARAMETRO_NOVO]: 1 }),
    },
    venda: {
        titulo: 'Fazer a primeira venda',
        descricao: 'Use no lugar de lançar receita para o que sai do balcão: os produtos e as formas de pagamento ficam registrados.',
        href: () => route('vendas', { [PARAMETRO_NOVO]: 1 }),
    },
    tv: {
        titulo: 'Conectar a TV ao Menu Board',
        descricao: 'Mostre o cardápio na TV do balcão.',
        href: () => route('menu-boards'),
    },
};

export default function InicioPrimeirosPassos({ passos }: { passos: PrimeiroPasso[] }) {
    const feitos = passos.filter((passo) => passo.feito).length;
    const proximo = passos.find((passo) => !passo.feito);

    return (
        <section
            aria-labelledby="inicio-primeiros-passos"
            className="border-sidebar-border/70 flex flex-col gap-3.5 rounded-xl border bg-white p-4 shadow-sm md:p-5 dark:bg-slate-900"
        >
            <div className="flex items-center justify-between">
                <h2 id="inicio-primeiros-passos" className="text-base font-semibold">
                    Primeiros passos
                </h2>
                <span className="text-muted-foreground text-sm">
                    {feitos} de {passos.length}
                </span>
            </div>
            <div
                className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"
                role="progressbar"
                aria-label="Primeiros passos concluídos"
                aria-valuemin={0}
                aria-valuemax={passos.length}
                aria-valuenow={feitos}
            >
                <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${(feitos / passos.length) * 100}%` }} />
            </div>
            <ul className="flex flex-col gap-1">
                {passos.map((passo) => {
                    const conteudo = CONTEUDO[passo.chave];

                    if (passo.feito) {
                        return (
                            <li key={passo.chave} className="flex items-center gap-2.5 py-1.5">
                                <CircleCheck className="h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
                                <span className="text-muted-foreground text-sm line-through">{conteudo.titulo}</span>
                                <span className="sr-only">(feito)</span>
                            </li>
                        );
                    }

                    if (passo === proximo) {
                        return (
                            <li key={passo.chave} className="flex gap-2.5 py-1.5">
                                <Circle className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                                <div className="flex min-w-0 flex-col items-start gap-1.5">
                                    <span className="text-sm font-semibold">{conteudo.titulo}</span>
                                    <span className="text-muted-foreground text-sm leading-snug">{conteudo.descricao}</span>
                                    <Link
                                        href={conteudo.href()}
                                        className="inline-flex min-h-9 items-center rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        Fazer agora
                                    </Link>
                                </div>
                            </li>
                        );
                    }

                    return (
                        <li key={passo.chave}>
                            <Link href={conteudo.href()} className="flex min-h-11 items-center gap-2.5 text-sm hover:underline">
                                <Circle className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                                <span className="flex-1">{conteudo.titulo}</span>
                                <ChevronRight className="text-muted-foreground h-4 w-4 md:hidden" aria-hidden="true" />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
