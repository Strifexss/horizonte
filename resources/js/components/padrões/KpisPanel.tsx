import { cn } from '@/lib/utils';
import KpiCard, { type KpiItem } from './KpiCard';

type Props = {
    items: KpiItem[];
    empilharNoMobile?: boolean;
};

const COLUNAS_DESKTOP: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
};

export default function KpisPanel({ items, empilharNoMobile = false }: Props) {
    const colunasDesktop = COLUNAS_DESKTOP[items.length] ?? 'md:grid-cols-4';

    return (
        <>
            <div
                className={cn(
                    'w-full min-w-0 md:hidden',
                    empilharNoMobile
                        ? 'flex flex-col gap-2'
                        : 'overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                )}
            >
                <div className={cn(empilharNoMobile ? 'flex w-full flex-col gap-2' : 'flex w-max gap-2 pb-1')}>
                    {items.map((it) => (
                        <div key={String(it.id ?? it.label)} className={empilharNoMobile ? 'w-full' : 'w-[8.75rem] shrink-0'}>
                            <KpiCard label={it.label} value={it.value} hint={it.hint} icon={it.icon} />
                        </div>
                    ))}
                </div>
            </div>
            <div className={cn('hidden auto-rows-min gap-4 md:grid', colunasDesktop)}>
                {items.map((it) => (
                    <KpiCard key={String(it.id ?? it.label)} label={it.label} value={it.value} hint={it.hint} icon={it.icon} />
                ))}
            </div>
        </>
    );
}
