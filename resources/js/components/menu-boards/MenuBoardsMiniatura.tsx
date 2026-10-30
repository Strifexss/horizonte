import type { LayoutPagina } from '@/components/menu-boards/types';
import { cn } from '@/lib/utils';

type Props = {
    layout: LayoutPagina;
    escura?: boolean;
    className?: string;
};

/**
 * Desenho esquemático do layout, usado na faixa de páginas, no card do board e na escolha de layout.
 */
export default function MenuBoardsMiniatura({ layout, escura = true, className = '' }: Props) {
    const fundo = escura ? 'bg-[#070d1a]' : 'bg-slate-100 dark:bg-slate-800';
    const forte = escura ? 'bg-slate-200' : 'bg-slate-400';
    const fraco = escura ? 'bg-slate-700' : 'bg-slate-300 dark:bg-slate-600';
    const destaque = escura ? 'bg-[#0f1d33] border border-amber-500/40' : 'bg-amber-300';
    const acento = escura ? 'bg-amber-500' : 'bg-amber-400';
    const foto = escura ? 'bg-[#1e2d47]' : 'bg-slate-300 dark:bg-slate-600';

    return (
        <span aria-hidden="true" className={cn('flex aspect-video w-full overflow-hidden rounded-md', fundo, className)}>
            {layout === 'destaques_grade' ? (
                <span className="flex flex-1 flex-col gap-[6%] p-[6%]">
                    <span className={`h-[5%] w-2/5 rounded-sm ${acento}`} />
                    <span className="flex flex-[1.4] gap-[4%]">
                        <span className={`flex-1 rounded-sm ${destaque}`} />
                        <span className={`flex-1 rounded-sm ${destaque}`} />
                    </span>
                    <span className="grid flex-1 grid-cols-3 gap-[4%]">
                        <span className={`rounded-sm ${fraco}`} />
                        <span className={`rounded-sm ${fraco}`} />
                        <span className={`rounded-sm ${fraco}`} />
                    </span>
                </span>
            ) : null}
            {layout === 'categoria' ? (
                <span className="flex flex-1 flex-col gap-[6%] p-[6%]">
                    <span className={`h-[8%] w-1/3 rounded-sm ${acento}`} />
                    <span className="grid flex-1 grid-cols-2 gap-[5%]">
                        {[0, 1, 2, 3, 4, 5].map((indice) => (
                            <span key={indice} className={`rounded-sm ${fraco}`} />
                        ))}
                    </span>
                </span>
            ) : null}
            {layout === 'banner' ? <span className={`flex-1 ${foto}`} /> : null}
            {layout === 'imagem_lista' ? (
                <>
                    <span className={`w-[46%] ${foto}`} />
                    <span className="flex flex-1 flex-col gap-[8%] p-[6%]">
                        <span className={`h-[8%] w-1/2 rounded-sm ${acento}`} />
                        {[0, 1, 2, 3].map((indice) => (
                            <span key={indice} className={`h-[9%] rounded-sm ${fraco}`} />
                        ))}
                    </span>
                </>
            ) : null}
            {layout === 'aviso' ? (
                <span className="flex flex-1 items-center gap-[6%] p-[8%]">
                    <span className="flex flex-1 flex-col gap-[10%]">
                        <span className={`h-2 w-[90%] rounded-sm ${forte}`} />
                        <span className={`h-2 w-[70%] rounded-sm ${forte}`} />
                        <span className={`h-1 w-1/2 rounded-sm ${fraco}`} />
                    </span>
                    <span className="aspect-square w-[30%] rounded-sm border-[3px] border-slate-900 bg-white" />
                </span>
            ) : null}
            {layout === 'produto_destaque' ? (
                <>
                    <span className="flex flex-1 flex-col justify-center gap-[7%] p-[7%]">
                        <span className={`h-[7%] w-[45%] rounded-full ${acento}`} />
                        <span className={`h-[10%] w-[90%] rounded-sm ${forte}`} />
                        <span className={`h-[14%] w-1/2 rounded-sm ${acento}`} />
                    </span>
                    <span className={`w-[46%] ${foto}`} />
                </>
            ) : null}
        </span>
    );
}
