import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import React from 'react';

export default function ExtratoFilters() {
  return (
    <div className="rounded-lg border border-sidebar-border/70 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="grid gap-3 items-end md:grid-cols-8">
        <div className="flex flex-col">
          <label className="text-xs text-muted-foreground">Tipo de data</label>
          <select className="mt-1 rounded border px-3 py-2 text-sm w-48">
            <option>Vencimento</option>
            <option>Competência</option>
          </select>
        </div>

        <div className="flex flex-col md:col-span-3">
          <label className="text-xs text-muted-foreground">Período</label>
          <div className="mt-1 flex items-center gap-2">
            <input type="date" className="rounded border px-3 py-2 text-sm" />
            <span className="text-sm text-muted-foreground">-</span>
            <input type="date" className="rounded border px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex flex-col md:col-span-1">
          <label className="text-xs text-muted-foreground">Conta</label>
          <select className="mt-1 rounded border px-3 py-2 text-sm w-full">
            <option>Conta 1</option>
          </select>
        </div>

        <div className="flex flex-col md:col-span-1">
          <label className="text-xs text-muted-foreground">Categoria</label>
          <select className="mt-1 rounded border px-3 py-2 text-sm w-full">
            <option>Todos</option>
          </select>
        </div>

        <div className="flex flex-col md:col-span-1">
          <label className="text-xs text-muted-foreground">Origem</label>
          <select className="mt-1 rounded border px-3 py-2 text-sm w-full">
            <option>Todos</option>
          </select>
        </div>

        <div className="flex flex-col md:col-span-1">
          <label className="text-xs text-muted-foreground">Status</label>
          <select className="mt-1 rounded border px-3 py-2 text-sm w-full">
            <option>Todos</option>
            <option>Em aberto</option>
            <option>Liquidado</option>
            <option>Conferido</option>
            <option>Conciliado</option>
          </select>
        </div>

        <div className="mt-3 flex justify-end md:col-span-8">
          <Button variant="primary" size="default" className="inline-flex items-center gap-2"><Search/>Pesquisar</Button>
        </div>
      </div>
    </div>
  );
}

