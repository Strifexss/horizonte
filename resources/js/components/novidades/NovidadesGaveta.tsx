import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { router, usePage } from '@inertiajs/react';
import { Megaphone } from 'lucide-react';
import { useState } from 'react';
import NovidadeConteudo, { NovidadeMeta } from './NovidadeConteudo';
import type { NovidadesSharedProps } from './types';

function GavetaSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {[0, 1, 2].map((indice) => (
                <div key={indice} className="space-y-2">
                    <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-slate-700" />
                    <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-slate-700" />
                    <div className="h-16 rounded bg-gray-100 dark:bg-slate-800" />
                </div>
            ))}
        </div>
    );
}

export default function NovidadesGaveta() {
    const { novidades, novidades_pendentes } = usePage<NovidadesSharedProps>().props;
    const [aberta, setAberta] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const temPendentes = (novidades_pendentes?.length ?? 0) > 0;

    function alternar(open: boolean): void {
        setAberta(open);

        if (open) {
            router.reload({
                only: ['novidades'],
                onStart: () => setCarregando(true),
                onFinish: () => setCarregando(false),
            });
        }
    }

    return (
        <Sheet open={aberta} onOpenChange={alternar}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Megaphone className="h-5 w-5" />
                    {temPendentes ? <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" /> : null}
                    <span className="sr-only">Novidades</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Novidades</SheetTitle>
                    <SheetDescription>O que mudou no Horizonte, da mais recente para a mais antiga.</SheetDescription>
                </SheetHeader>

                <div className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6">
                    {carregando || novidades === undefined ? (
                        <GavetaSkeleton />
                    ) : novidades.length === 0 ? (
                        <p className="text-muted-foreground py-8 text-center text-sm">Nenhuma novidade publicada ainda.</p>
                    ) : (
                        <ul className="divide-sidebar-border/70 flex flex-col divide-y">
                            {novidades.map((novidade) => (
                                <li key={novidade.id} className="flex flex-col gap-2 py-4 first:pt-0">
                                    <NovidadeMeta novidade={novidade} />
                                    <h3 className="font-semibold">{novidade.titulo}</h3>
                                    <NovidadeConteudo novidade={novidade} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
