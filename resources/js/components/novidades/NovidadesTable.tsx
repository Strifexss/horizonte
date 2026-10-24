import { MobileCardList, TableWithFilters, type Column, type MobileCardAction } from '@/components/padrões';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatarData } from '@/components/usuarios/formatarData';
import { BellRing, EyeOff, MoreHorizontal, Pencil, RotateCcw, Send, Trash2, Users } from 'lucide-react';
import NovidadesCard from './NovidadesCard';
import NovidadesEmpty from './NovidadesEmpty';
import { NovidadeCategoriaSelo, NovidadesSelo } from './NovidadesSelo';
import type { Novidade } from './types';

type Props = {
    loaded: boolean;
    items: Novidade[];
    onAdd: () => void;
    onEdit: (item: Novidade) => void;
    onAlterarStatus: (item: Novidade) => void;
    onVerDispensas: (item: Novidade) => void;
    onRelancar: (item: Novidade) => void;
    onDelete: (item: Novidade) => void;
};

function rotuloAlterarStatus(item: Novidade): string {
    return item.status === 'publicado' ? 'Voltar para rascunho' : 'Publicar';
}

export default function NovidadesTable({ loaded, items, onAdd, onEdit, onAlterarStatus, onVerDispensas, onRelancar, onDelete }: Props) {
    const columns: Column<Novidade>[] = [
        {
            key: 'titulo',
            label: 'TÍTULO',
            className: 'truncate font-medium',
        },
        {
            key: 'categoria',
            label: 'CATEGORIA',
            thClassName: 'w-32',
            render: (item) => <NovidadeCategoriaSelo categoria={item.categoria} />,
        },
        {
            key: 'publicada_em',
            label: 'PUBLICAÇÃO',
            thClassName: 'w-32',
            render: (item) => formatarData(item.publicada_em),
        },
        {
            key: 'status',
            label: 'STATUS',
            thClassName: 'w-28',
            render: (item) => (
                <NovidadesSelo tom={item.status === 'publicado' ? 'verde' : 'neutro'}>
                    {item.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                </NovidadesSelo>
            ),
        },
        {
            key: 'popup_automatico',
            label: 'POP-UP',
            thClassName: 'w-24',
            render: (item) =>
                item.popup_automatico ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300" title="Abre sozinha para os usuários">
                        <BellRing className="h-3.5 w-3.5" />
                        Sim
                    </span>
                ) : (
                    <span className="text-muted-foreground text-xs">Não</span>
                ),
        },
        {
            key: 'dispensas_count',
            label: 'DISPENSAS',
            thClassName: 'w-28',
            render: (item) => (
                <button
                    type="button"
                    onClick={() => onVerDispensas(item)}
                    title="Ver quem dispensou"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
                >
                    <Users className="h-3.5 w-3.5" />
                    {item.dispensas_count}
                </button>
            ),
        },
        {
            key: 'acoes',
            label: 'AÇÃO',
            thClassName: 'w-20 text-center',
            render: (item) => (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label={`Ações de ${item.titulo}`}
                                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center rounded-md p-1"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onEdit(item)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onAlterarStatus(item)}>
                                {item.status === 'publicado' ? <EyeOff className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                                {rotuloAlterarStatus(item)}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onVerDispensas(item)}>
                                <Users className="mr-2 h-4 w-4" />
                                Quem dispensou
                            </DropdownMenuItem>
                            {item.status === 'publicado' ? (
                                <DropdownMenuItem onSelect={() => onRelancar(item)}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Relançar
                                </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => onDelete(item)}>
                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    const acoesMobile = (item: Novidade): MobileCardAction[] => [
        { key: 'editar', label: 'Editar', icon: <Pencil className="h-4 w-4" />, onClick: () => onEdit(item) },
        {
            key: 'status',
            label: item.status === 'publicado' ? 'Rascunho' : 'Publicar',
            icon: item.status === 'publicado' ? <EyeOff className="h-4 w-4" /> : <Send className="h-4 w-4" />,
            onClick: () => onAlterarStatus(item),
        },
        { key: 'dispensas', label: 'Dispensas', icon: <Users className="h-4 w-4" />, onClick: () => onVerDispensas(item) },
        ...(item.status === 'publicado'
            ? [{ key: 'relancar', label: 'Relançar', icon: <RotateCcw className="h-4 w-4" />, onClick: () => onRelancar(item) }]
            : []),
        { key: 'excluir', label: 'Excluir', icon: <Trash2 className="h-4 w-4" />, onClick: () => onDelete(item), destructive: true },
    ];

    return (
        <TableWithFilters
            columns={columns}
            data={items}
            loaded={loaded}
            fixedLayout
            empty={<NovidadesEmpty onAdd={onAdd} />}
            mobile={
                <MobileCardList
                    items={items}
                    getKey={(item) => item.id}
                    renderContent={(item) => <NovidadesCard item={item} />}
                    onPress={onEdit}
                    actions={acoesMobile}
                />
            }
        />
    );
}
