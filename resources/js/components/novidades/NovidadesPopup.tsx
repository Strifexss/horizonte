import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import NovidadeConteudo, { NovidadeMeta } from './NovidadeConteudo';
import type { NovidadesSharedProps } from './types';

/** O layout remonta a cada visita; o "Ver depois" precisa sobreviver à navegação até o fim da sessão do navegador. */
const CHAVE_ADIADAS = 'horizonte:novidades-adiadas';

function lerAdiadas(): number[] {
    try {
        const valor: unknown = JSON.parse(window.sessionStorage.getItem(CHAVE_ADIADAS) ?? '[]');

        return Array.isArray(valor) ? valor.filter((id): id is number => typeof id === 'number') : [];
    } catch {
        return [];
    }
}

export default function NovidadesPopup() {
    const pendentes = usePage<NovidadesSharedProps>().props.novidades_pendentes ?? [];
    const [adiadas, setAdiadas] = useState<number[]>(lerAdiadas);
    const [dispensando, setDispensando] = useState(false);

    const fila = pendentes.filter((novidade) => !adiadas.includes(novidade.id));
    const atual = fila[0] ?? null;

    function verDepois(): void {
        if (!atual || dispensando) {
            return;
        }

        const proximas = [...adiadas, atual.id];
        window.sessionStorage.setItem(CHAVE_ADIADAS, JSON.stringify(proximas));
        setAdiadas(proximas);
    }

    function naoMostrarNovamente(): void {
        if (!atual) {
            return;
        }

        router.post(
            atual.urls.dispensar,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['novidades_pendentes'],
                onStart: () => setDispensando(true),
                onFinish: () => setDispensando(false),
            },
        );
    }

    return (
        <Dialog open={atual !== null} onOpenChange={(open) => !open && verDepois()}>
            {atual ? (
                <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:w-[560px] md:max-w-full">
                    <div className="flex h-full min-h-0 flex-col gap-4">
                        <DialogHeader className="gap-2">
                            <NovidadeMeta novidade={atual} />
                            <DialogTitle>{atual.titulo}</DialogTitle>
                            <DialogDescription className="sr-only">Novidade do sistema</DialogDescription>
                        </DialogHeader>

                        <div className="min-h-0 flex-1 overflow-y-auto md:max-h-[60vh]">
                            <NovidadeConteudo novidade={atual} />
                        </div>

                        {fila.length > 1 ? (
                            <p className="text-muted-foreground text-xs">
                                Mais {fila.length - 1} {fila.length - 1 === 1 ? 'novidade' : 'novidades'} depois desta.
                            </p>
                        ) : null}

                        <DialogFooter className="flex flex-row gap-2">
                            <Button variant="secondary" type="button" className="w-full md:w-auto" disabled={dispensando} onClick={verDepois}>
                                Ver depois
                            </Button>
                            <Button variant="confirm" type="button" className="w-full md:w-auto" disabled={dispensando} onClick={naoMostrarNovamente}>
                                Não mostrar novamente
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            ) : null}
        </Dialog>
    );
}
