import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatarData } from '@/components/usuarios/formatarData';
import { router } from '@inertiajs/react';
import { RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Novidade, UsuarioDispensa } from './types';

type Props = {
    novidade: Novidade | null;
    onOpenChange: (open: boolean) => void;
    dispensas?: UsuarioDispensa[];
    onRelancar: (novidade: Novidade) => void;
};

type Filtro = 'todos' | 'dispensaram' | 'nao-dispensaram';

const FILTROS: { valor: Filtro; rotulo: string }[] = [
    { valor: 'todos', rotulo: 'Todos' },
    { valor: 'dispensaram', rotulo: 'Dispensaram' },
    { valor: 'nao-dispensaram', rotulo: 'Não dispensaram' },
];

function ListaSkeleton() {
    return (
        <ul className="flex animate-pulse flex-col gap-2">
            {Array.from({ length: 6 }, (_, indice) => (
                <li key={indice} className="h-12 rounded-md bg-gray-200 dark:bg-slate-700" />
            ))}
        </ul>
    );
}

function normalizar(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

export default function NovidadesDispensasModal({ novidade, onOpenChange, dispensas, onRelancar }: Props) {
    const [carregando, setCarregando] = useState(false);
    const [filtro, setFiltro] = useState<Filtro>('todos');
    const [busca, setBusca] = useState('');
    const [processandoId, setProcessandoId] = useState<number | null>(null);
    const novidadeId = novidade?.id ?? null;

    useEffect(() => {
        if (novidadeId === null) {
            return;
        }

        setFiltro('todos');
        setBusca('');
        router.reload({
            only: ['dispensas'],
            data: { novidade: novidadeId },
            onStart: () => setCarregando(true),
            onFinish: () => setCarregando(false),
        });
    }, [novidadeId]);

    const usuarios = dispensas ?? [];
    const termo = normalizar(busca.trim());
    const visiveis = usuarios.filter((usuario) => {
        if (filtro === 'dispensaram' && usuario.dispensada_em === null) {
            return false;
        }

        if (filtro === 'nao-dispensaram' && usuario.dispensada_em !== null) {
            return false;
        }

        return termo === '' || normalizar(`${usuario.name} ${usuario.email}`).includes(termo);
    });
    const totalDispensaram = usuarios.filter((usuario) => usuario.dispensada_em !== null).length;

    function alternar(usuario: UsuarioDispensa): void {
        const opcoes = {
            preserveScroll: true,
            preserveState: true,
            only: ['dispensas', 'novidades', 'flash'],
            onStart: () => setProcessandoId(usuario.id),
            onFinish: () => setProcessandoId(null),
        };

        if (usuario.dispensada_em === null) {
            router.put(usuario.urls.marcar, {}, opcoes);
            return;
        }

        router.delete(usuario.urls.desmarcar, opcoes);
    }

    return (
        <Dialog open={novidade !== null} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:w-[640px] md:max-w-full">
                <div className="flex h-full min-h-0 flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Quem dispensou</DialogTitle>
                        <DialogDescription>
                            {novidade?.titulo}. Marcado: o pop-up não abre mais para o usuário. Desmarque para ele ver de novo.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                value={busca}
                                onChange={(evento) => setBusca(evento.target.value)}
                                placeholder="Buscar por nome ou e-mail"
                                className="pl-9"
                            />
                        </div>
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
                    </div>

                    <div className="min-h-[200px] flex-1 overflow-y-auto md:max-h-[50vh]">
                        {carregando || dispensas === undefined ? (
                            <ListaSkeleton />
                        ) : visiveis.length === 0 ? (
                            <p className="text-muted-foreground py-8 text-center text-sm">Nenhum usuário encontrado.</p>
                        ) : (
                            <ul className="divide-y rounded-md border">
                                {visiveis.map((usuario) => (
                                    <li key={usuario.id}>
                                        <label className="hover:bg-accent/50 flex cursor-pointer items-center gap-3 px-3 py-2">
                                            <Checkbox
                                                checked={usuario.dispensada_em !== null}
                                                disabled={processandoId !== null}
                                                onCheckedChange={() => alternar(usuario)}
                                                aria-label={`Dispensada por ${usuario.name}`}
                                            />
                                            <span className="flex min-w-0 flex-1 flex-col">
                                                <span className="truncate text-sm font-medium">{usuario.name}</span>
                                                <span className="text-muted-foreground truncate text-xs">{usuario.email}</span>
                                            </span>
                                            <span className="text-muted-foreground shrink-0 text-xs">
                                                {usuario.dispensada_em ? `Dispensou em ${formatarData(usuario.dispensada_em)}` : 'Vai ver o pop-up'}
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <p className="text-muted-foreground text-xs">{dispensas ? `${totalDispensaram} de ${usuarios.length} dispensaram` : null}</p>
                        {novidade ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="inline-flex w-full items-center gap-2 md:w-auto"
                                disabled={novidade.status !== 'publicado'}
                                title={novidade.status !== 'publicado' ? 'Publique a novidade antes de relançar' : undefined}
                                onClick={() => onRelancar(novidade)}
                            >
                                <RotateCcw className="h-4 w-4" />
                                Relançar para todos
                            </Button>
                        ) : null}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
