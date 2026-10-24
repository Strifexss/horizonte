import { Button } from '@/components/ui/button';
import { formatarData } from '@/components/usuarios/formatarData';
import { ExternalLink } from 'lucide-react';
import { NovidadeCategoriaSelo } from './NovidadesSelo';
import type { NovidadeImagem, NovidadePublicada } from './types';

export function NovidadeMeta({ novidade }: { novidade: NovidadePublicada }) {
    return (
        <div className="flex items-center gap-2">
            <NovidadeCategoriaSelo categoria={novidade.categoria} />
            <span className="text-muted-foreground text-xs">{formatarData(novidade.publicada_em)}</span>
        </div>
    );
}

function NovidadeGaleria({ imagens, titulo }: { imagens: NovidadeImagem[]; titulo: string }) {
    if (imagens.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            {imagens.map((imagem, indice) => (
                <img
                    key={imagem.id}
                    src={imagem.url}
                    alt={imagens.length === 1 ? titulo : `${titulo} (${indice + 1} de ${imagens.length})`}
                    className="w-full rounded-md border object-contain"
                    loading="lazy"
                />
            ))}
        </div>
    );
}

/** Imagens, texto e botão do link; título e cabeçalho ficam com quem usa (pop-up ou gaveta). */
export default function NovidadeConteudo({ novidade }: { novidade: NovidadePublicada }) {
    return (
        <div className="flex flex-col gap-3">
            <NovidadeGaleria imagens={novidade.imagens} titulo={novidade.titulo} />
            <p className="text-sm whitespace-pre-line text-slate-700 dark:text-slate-200">{novidade.descricao}</p>
            {novidade.cta_url ? (
                <Button asChild variant="outline" size="sm" className="self-start">
                    <a href={novidade.cta_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                        Saiba mais
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                </Button>
            ) : null}
        </div>
    );
}
