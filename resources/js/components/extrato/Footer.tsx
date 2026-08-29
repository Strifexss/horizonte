import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  showing: number;
  total: number;
};

export default function ExtratoFooter({ showing, total }: Props) {
  return (
    <div className="extrato-table-footer mt-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Mostrando {showing} de {total} lançamentos</span>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span>Por página:</span>
          <select name="perPage" className="ml-2 rounded border px-2 py-1 text-sm">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className="extrato-page-button p-2 rounded hover:bg-sidebar-border/20" aria-label="Página anterior">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" className="extrato-page-button extrato-page-button-active px-3 py-1 rounded bg-sidebar-border/10">1</button>
        <button type="button" className="extrato-page-button px-3 py-1 rounded">2</button>
        <button type="button" className="extrato-page-button px-3 py-1 rounded">3</button>
        <span className="px-1 text-soft">...</span>
        <button type="button" className="extrato-page-button px-3 py-1 rounded">9</button>
        <button type="button" className="extrato-page-button p-2 rounded hover:bg-sidebar-border/20" aria-label="Próxima página">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

