import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Props = {
    onAdd: () => void;
};

export default function SegmentosEmpty({ onAdd }: Props) {
    return (
        <div className="border-sidebar-border/40 rounded-lg border border-dashed bg-white/30 p-8 text-center dark:bg-slate-900/40">
            <div className="mx-auto max-w-lg">
                <h3 className="text-lg font-semibold">Nenhum segmento cadastrado</h3>
                <p className="text-muted-foreground mt-2 text-sm">Crie um segmento para que as empresas possam escolhê-lo no onboarding.</p>
                <div className="mt-4">
                    <Button variant="primary" onClick={onAdd} className="inline-flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Adicionar segmento
                    </Button>
                </div>
            </div>
        </div>
    );
}
