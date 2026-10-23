import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Props = {
    onAdd?: () => void;
};

export default function ProdutosEmpty({ onAdd }: Props) {
    return (
        <div className="rounded-lg border border-dashed border-sidebar-border/40 bg-white/30 p-8 text-center dark:bg-slate-900/40">
            <div className="mx-auto max-w-lg">
                <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Você ainda não cadastrou nenhum produto. Clique em adicionar para criar o primeiro.
                </p>
                <div className="mt-4">
                    <Button variant="primary" onClick={onAdd} className="inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Adicionar produto
                    </Button>
                </div>
            </div>
        </div>
    );
}
