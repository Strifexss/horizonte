import { Link } from '@inertiajs/react';
import { Info, Tv } from 'lucide-react';

type Props = {
    ativo: boolean;
    tvsConectadas: number;
};

/**
 * Lembra no editor se o board está na TV e que a troca depende do Sync manual.
 */
export default function MenuBoardsStatusTv({ ativo, tvsConectadas }: Props) {
    return (
        <section className="border-sidebar-border/70 flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:p-5 dark:bg-slate-900">
            <div className="flex items-center gap-3">
                <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${ativo ? 'bg-[#082845] text-amber-500' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                >
                    <Tv className="size-[18px]" />
                </span>
                <div>
                    <h2 className="text-[15px] font-semibold">{ativo ? 'Este board está na TV' : 'Ainda não está na TV'}</h2>
                    <p className="text-muted-foreground text-[13px]">
                        {ativo
                            ? `${tvsConectadas} ${tvsConectadas === 1 ? 'TV conectada' : 'TVs conectadas'}`
                            : 'Depois de salvar, use “Ativar na TV” na lista de boards.'}
                    </p>
                </div>
            </div>
            {ativo ? (
                <p className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />A TV não atualiza sozinha. Depois de salvar, toque em Sync no canto
                    da TV. As páginas continuam alternando normalmente.
                </p>
            ) : null}
            <Link href={route('menu-boards')} className="text-[13px] font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400">
                Gerenciar TVs e pareamento
            </Link>
        </section>
    );
}
