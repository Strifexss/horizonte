import KpiCard, { type KpiItem } from './KpiCard';

type Props = {
    items: KpiItem[];
};

export default function KpisPanel({ items }: Props) {
    return (
        <>
            <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max gap-2 pb-1">
                    {items.map((it) => (
                        <div key={String(it.id ?? it.label)} className="w-36 shrink-0">
                            <KpiCard label={it.label} value={it.value} hint={it.hint} icon={it.icon} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="hidden auto-rows-min gap-4 md:grid md:grid-cols-4">
                {items.map((it) => (
                    <KpiCard key={String(it.id ?? it.label)} label={it.label} value={it.value} hint={it.hint} icon={it.icon} />
                ))}
            </div>
        </>
    );
}
