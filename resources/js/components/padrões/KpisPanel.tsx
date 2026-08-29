import React from 'react';
import KpiCard from './KpiCard';

type Item = {
  id?: string | number;
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
};

type Props = {
  items: Item[];
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

