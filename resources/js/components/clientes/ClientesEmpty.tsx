import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Props = {
    onAdd?: () => void;
};

export default function ClientesEmpty({ onAdd }: Props) {
    return (
        <div className="border-sidebar-border/40 rounded-lg border border-dashed bg-white/30 p-8 text-center dark:bg-slate-900/40">
            <div className="mx-auto max-w-lg">
                <h3 className="text-lg font-semibold">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground mt-2 text-sm">Cadastre clientes para identificar quem comprou em cada venda.</p>
                <div className="mt-4">
                    <Button variant="primary" onClick={onAdd} className="inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Adicionar cliente
                    </Button>
                </div>
            </div>
        </div>
    );
}
