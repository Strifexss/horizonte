import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function MenuBoardsEmpty() {
    return (
        <div className="border-sidebar-border/40 rounded-lg border border-dashed bg-white/30 p-8 text-center dark:bg-slate-900/40">
            <div className="mx-auto max-w-lg">
                <h3 className="text-lg font-semibold">Nenhum Menu Board criado</h3>
                <p className="text-muted-foreground mt-2 text-sm">Crie um board, escolha os produtos e ative-o para aparecer na TV do balcão.</p>
                <div className="mt-4">
                    <Button variant="primary" asChild className="inline-flex items-center gap-2">
                        <Link href={route('menu-boards.create')}>
                            <Plus className="h-4 w-4" />
                            Novo Menu Board
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
