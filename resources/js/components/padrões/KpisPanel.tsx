import KpiCard, { type KpiItem } from './KpiCard';

type Props = {
    items: KpiItem[];
};

export default function KpisPanel({ items }: Props) {
    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            {items.map((it) => (
                <KpiCard key={String(it.id ?? it.label)} label={it.label} value={it.value} hint={it.hint} icon={it.icon} />
            ))}
        </div>
    );
}
