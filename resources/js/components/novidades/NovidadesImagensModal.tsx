import ConfirmDeleteModal from '@/components/extrato/ConfirmDeleteModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatarData } from '@/components/usuarios/formatarData';
import { router } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatarTamanho } from './formatarTamanho';
import type { ImagemDoDiretorio } from './types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    imagens?: ImagemDoDiretorio[];
};

type Filtro = 'todas' | 'em-uso' | 'sem-uso';

const FILTROS: { valor: Filtro; rotulo: string }[] = [
    { valor: 'todas', rotulo: 'Todas' },
    { valor: 'em-uso', rotulo: 'Em uso' },
    { valor: 'sem-uso', rotulo: 'Sem uso' },
];

function GradeSkeleton() {
    return (
        <div className="grid animate-pulse grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }, (_, indice) => (
                <div key={indice} className="aspect-square rounded-md bg-gray-200 dark:bg-slate-700" />
            ))}
        </div>
    );
}

export default function NovidadesImagensModal({ open, onOpenChange, imagens }: Props) {
    const [carregando, setCarregando] = useState(false);
    const [filtro, setFiltro] = useState<Filtro>('todas');
    const [visualizando, setVisualizando] = useState<ImagemDoDiretorio | null>(null);
    const [paraExcluir, setParaExcluir] = useState<ImagemDoDiretorio | null>(null);
    const [excluindo, setExcluindo] = useState(false);

    useEffect(() => {
        if (!open) {
            setVisualizando(null);
            return;
        }

        router.reload({
            only: ['imagens'],
            onStart: () => setCarregando(true),
            onFinish: () => setCarregando(false),
        });
    }, [open]);

    const visiveis = (imagens ?? []).filter((imagem) => {
        if (filtro === 'em-uso') {
            return imagem.novidade !== null;
        }

        if (filtro === 'sem-uso') {
            return imagem.novidade === null;
        }

        return true;
    });

    function excluir(): void {
        if (!paraExcluir) {
            return;
        }

        router.delete(paraExcluir.urls.destroy, {
            preserveScroll: true,
            preserveState: true,
            only: ['imagens', 'novidades', 'flash'],
            onStart: () => setExcluindo(true),
            onSuccess: () => {
                setParaExcluir(null);
                setVisualizando(null);
            },
            onFinish: () => setExcluindo(false),
        });
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:w-[900px] md:max-w-full">
                    <div className="flex h-full min-h-0 flex-col gap-4">
                        <DialogHeader>
                            <DialogTitle>Imagens das novidades</DialogTitle>
                            <DialogDescription>
                                Arquivos guardados na pasta de imagens. Excluir aqui tira a imagem da novidade que a usa.
                            </DialogDescription>
                        </DialogHeader>

                        {visualizando ? (
                            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="inline-flex items-center gap-2 self-start"
                                    onClick={() => setVisualizando(null)}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Voltar para a pasta
                                </Button>
                                <img
                                    src={visualizando.url}
                                    alt={visualizando.arquivo}
                                    className="max-h-[50vh] w-full rounded-md border bg-slate-50 object-contain dark:bg-slate-800"
                                />
                                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                                    <dt className="text-muted-foreground">Arquivo</dt>
                                    <dd className="truncate">{visualizando.arquivo}</dd>
                                    <dt className="text-muted-foreground">Tamanho</dt>
                                    <dd>{formatarTamanho(visualizando.tamanho)}</dd>
                                    <dt className="text-muted-foreground">Enviada em</dt>
                                    <dd>{formatarData(visualizando.modificado_em)}</dd>
                                    <dt className="text-muted-foreground">Novidade</dt>
                                    <dd className="truncate">{visualizando.novidade?.titulo ?? 'Nenhuma'}</dd>
                                </dl>
                                <div className="flex flex-row gap-2">
                                    <Button asChild variant="outline" className="w-full md:w-auto">
                                        <a
                                            href={visualizando.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Abrir em nova aba
                                        </a>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="inline-flex w-full items-center gap-2 md:w-auto"
                                        onClick={() => setParaExcluir(visualizando)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Excluir
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    {FILTROS.map((opcao) => (
                                        <Button
                                            key={opcao.valor}
                                            type="button"
                                            size="sm"
                                            variant={filtro === opcao.valor ? 'default' : 'outline'}
                                            onClick={() => setFiltro(opcao.valor)}
                                        >
                                            {opcao.rotulo}
                                        </Button>
                                    ))}
                                </div>

                                <div className="min-h-[200px] flex-1 overflow-y-auto md:max-h-[60vh]">
                                    {carregando || imagens === undefined ? (
                                        <GradeSkeleton />
                                    ) : visiveis.length === 0 ? (
                                        <p className="text-muted-foreground py-8 text-center text-sm">
                                            {filtro === 'todas' ? 'A pasta de imagens está vazia.' : 'Nenhuma imagem neste filtro.'}
                                        </p>
                                    ) : (
                                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                            {visiveis.map((imagem) => (
                                                <li key={imagem.arquivo} className="group relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setVisualizando(imagem)}
                                                        className="block w-full overflow-hidden rounded-md border text-left"
                                                    >
                                                        <img
                                                            src={imagem.url}
                                                            alt={imagem.arquivo}
                                                            className="aspect-square w-full object-cover"
                                                            loading="lazy"
                                                        />
                                                        <span className="block truncate px-2 py-1 text-xs">
                                                            {imagem.novidade?.titulo ?? <span className="text-muted-foreground">Sem novidade</span>}
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setParaExcluir(imagem)}
                                                        aria-label={`Excluir ${imagem.arquivo}`}
                                                        className="absolute top-1 right-1 rounded-full bg-white/90 p-1.5 text-red-600 shadow hover:bg-white dark:bg-slate-900/90"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {imagens && imagens.length > 0 ? (
                                    <p className="text-muted-foreground text-xs">
                                        {imagens.length} {imagens.length === 1 ? 'imagem' : 'imagens'} ·{' '}
                                        {formatarTamanho(imagens.reduce((total, imagem) => total + imagem.tamanho, 0))} no total
                                    </p>
                                ) : null}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDeleteModal
                open={paraExcluir !== null}
                onOpenChange={(aberto) => {
                    if (!aberto) {
                        setParaExcluir(null);
                    }
                }}
                title="Excluir imagem"
                description={
                    paraExcluir?.novidade
                        ? `A imagem sai da pasta e da novidade "${paraExcluir.novidade.titulo}". Esta ação não pode ser desfeita.`
                        : 'A imagem não está em nenhuma novidade e será apagada da pasta. Esta ação não pode ser desfeita.'
                }
                processing={excluindo}
                onConfirm={excluir}
            />
        </>
    );
}
