import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Props = {
  onAdd?: () => void;
};

export default function AccountsEmpty({ onAdd }: Props) {
  return (
    <div className="rounded-lg border border-dashed border-sidebar-border/40 bg-white/30 dark:bg-slate-900/40 p-8 text-center">
      <div className="mx-auto max-w-lg">
        <h3 className="text-lg font-semibold">Nenhuma conta encontrada</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Você ainda não cadastrou nenhuma conta. Clique em adicionar para criar a primeira.
        </p>
        <div className="mt-4">
          <Button variant="primary" onClick={onAdd} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar conta
          </Button>
        </div>
      </div>
    </div>
  );
}

