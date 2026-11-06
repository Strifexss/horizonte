import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { FormDialogBody, FormDialogContent, FormDialogFooter, FormDialogHeader } from '@/components/ui/form-dialog';
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
                <FormDialogContent className="md:w-[560px]">
                    <FormDialogHeader
                        className="gap-2"
                        eyebrow={<NovidadeMeta novidade={atual} />}
                        title={atual.titulo}
                        description="Novidade do sistema"
                        hideDescription
                    />

                    <FormDialogBody key={atual.id} className="md:max-h-[60vh]">
                        <NovidadeConteudo novidade={atual} />

                        {fila.length > 1 ? (
                            <p className="text-muted-foreground text-xs">
                                Mais {fila.length - 1} {fila.length - 1 === 1 ? 'novidade' : 'novidades'} depois desta.
                            </p>
                        ) : null}
                    </FormDialogBody>

                    <FormDialogFooter className="md:justify-end">
                        <Button variant="secondary" type="button" className="w-full md:w-auto" disabled={dispensando} onClick={verDepois}>
                            Ver depois
                        </Button>
                        <Button variant="confirm" type="button" className="w-full md:w-auto" disabled={dispensando} onClick={naoMostrarNovamente}>
                            Não mostrar novamente
                        </Button>
                    </FormDialogFooter>
                </FormDialogContent>
            ) : null}
        </Dialog>
    );
}
