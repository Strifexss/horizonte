import { formatarData } from '@/components/usuarios/formatarData';
import { BellRing, Users } from 'lucide-react';
import { NovidadeCategoriaSelo, NovidadesSelo } from './NovidadesSelo';
import type { Novidade } from './types';

/** Conteúdo do card do mobile; toque e ações ficam com o `MobileCardList`. */
export default function NovidadesCard({ item }: { item: Novidade }) {
    return (
        <>
            <div className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.titulo}</span>
                {item.popup_automatico ? (
                    <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1 text-xs" title="Abre sozinha para os usuários">
                        <BellRing className="h-3.5 w-3.5" />
                        Pop-up
                    </span>
                ) : null}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <NovidadeCategoriaSelo categoria={item.categoria} />
                <NovidadesSelo tom={item.status === 'publicado' ? 'verde' : 'neutro'}>
                    {item.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                </NovidadesSelo>
                <span className="text-muted-foreground text-xs">{formatarData(item.publicada_em)}</span>
                {item.dispensas_count > 0 ? (
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs" title="Usuários que dispensaram">
                        <Users className="h-3.5 w-3.5" />
                        {item.dispensas_count}
                    </span>
                ) : null}
            </div>
        </>
    );
}
