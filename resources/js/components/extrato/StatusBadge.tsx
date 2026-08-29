import React from 'react';
import { Check, Clock, Link } from 'lucide-react';

type Props = {
  status?: 'em_aberto' | 'liquidado' | 'conferido' | 'conciliado';
};

export default function StatusBadge({ status }: Props) {
  if (!status) return null;

  if (status === 'em_aberto') {
    return <span className="inline-flex items-center gap-2 rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"><Clock className="h-4 w-4" /> Em aberto</span>;
  }
  if (status === 'liquidado') {
    return <span className="inline-flex items-center gap-2 rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"><Check className="h-4 w-4" /> Liquidado</span>;
  }
  if (status === 'conferido') {
    return <span className="inline-flex items-center gap-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"><Check className="h-4 w-4" /> Conferido</span>;
  }
  return <span className="inline-flex items-center gap-2 rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"><Link className="h-4 w-4" /> Conciliado</span>;
}

