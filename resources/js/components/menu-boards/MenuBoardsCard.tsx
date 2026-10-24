import { nomeDoTema } from '@/components/menu-boards/temas';
import { formatarData, type MenuBoardResumo } from '@/components/menu-boards/types';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Check, Pencil, Trash2, Tv } from 'lucide-react';

type Props = {
    board: MenuBoardResumo;
    ativando: boolean;
    onAtivar: (board: MenuBoardResumo) => void;
    onDelete: (board: MenuBoardResumo) => void;
};

export default function MenuBoardsCard({ board, ativando, onAtivar, onDelete }: Props) {
    return (
        <article
            className={`flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm md:p-5 dark:bg-slate-900 ${
                board.ativo ? 'border-green-600 ring-1 ring-green-600' : 'border-sidebar-border/70'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold md:text-lg">{board.nome}</h2>
                    <p className="text-muted-foreground text-sm">
                        {board.itens_count} itens · {board.destaques_count} destaques
                    </p>
                </div>
                {board.ativo ? (
                    <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-green-50 px-2.5 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                        <span aria-hidden="true" className="size-2 rounded-full bg-green-600" />
                        Ativo na TV
                    </span>
                ) : (
                    <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <span aria-hidden="true" className="size-2 rounded-full border-[1.5px] border-slate-400" />
                        Inativo
                    </span>
                )}
            </div>

            <p className="text-muted-foreground text-xs">
                {nomeDoTema(board.tema)}
                {board.atualizado_em ? ` · Editado em ${formatarData(board.atualizado_em)}` : ''}
            </p>

            <div className="flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                {board.ativo ? (
                    <Button
                        type="button"
                        variant="outline"
                        disabled
                        className="h-11 min-w-0 flex-1 border-green-200 bg-green-50 text-green-700 disabled:opacity-100 md:h-10 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
                    >
                        <Check />
                        Na TV agora
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant="primary"
                        loading={ativando}
                        className="h-11 min-w-0 flex-1 justify-center text-sm md:h-10"
                        onClick={() => onAtivar(board)}
                    >
                        <Tv />
                        Ativar na TV
                    </Button>
                )}
                <Button type="button" variant="outline" size="icon" className="size-11 shrink-0 md:size-10" asChild>
                    <Link href={route('menu-boards.edit', board.id)} aria-label={`Editar ${board.nome}`} title="Editar">
                        <Pencil />
                    </Link>
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-11 shrink-0 text-red-600 hover:text-red-700 md:size-10"
                    aria-label={`Excluir ${board.nome}`}
                    title="Excluir"
                    onClick={() => onDelete(board)}
                >
                    <Trash2 />
                </Button>
            </div>
        </article>
    );
}
