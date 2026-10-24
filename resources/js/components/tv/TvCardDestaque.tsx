import { formatarPrecoTv, type EstiloTv, type ProdutoNaTv } from '@/components/tv/temas';
import { Star } from 'lucide-react';

type Props = {
    produto: ProdutoNaTv;
    estilo: EstiloTv;
};

function Selo({ estilo, className = '' }: { estilo: EstiloTv; className?: string }) {
    return (
        <span
            className={`inline-flex h-[2.1vw] items-center gap-[0.4vw] self-start rounded-full px-[0.85vw] text-[0.95vw] font-bold tracking-[0.12em] ${estilo.selo} ${className}`}
        >
            <Star className="size-[1vw]" fill="currentColor" />
            DESTAQUE
        </span>
    );
}

export default function TvCardDestaque({ produto, estilo }: Props) {
    if (produto.foto_url) {
        return (
            <article className={`flex flex-col overflow-hidden rounded-[1.25vw] border-2 ${estilo.cardDestaque}`}>
                <div className="relative h-[9.2vw] shrink-0">
                    <img src={produto.foto_url} alt="" className="size-full object-cover" />
                    <Selo estilo={estilo} className="absolute top-[1vw] left-[1.25vw]" />
                </div>
                <div className="flex flex-1 items-end justify-between gap-[1vw] px-[1.7vw] pt-[1.15vw] pb-[1.35vw]">
                    <div className="min-w-0">
                        <h2 className={`text-[2.1vw] leading-tight tracking-tight ${estilo.peso} ${estilo.textoDestaque}`}>{produto.nome}</h2>
                        {produto.descricao ? <p className={`truncate text-[1.15vw] ${estilo.suaveDestaque}`}>{produto.descricao}</p> : null}
                    </div>
                    <p className={`flex shrink-0 items-baseline gap-[0.4vw] font-bold tabular-nums ${estilo.precoDestaque}`}>
                        <span className="text-[1.75vw] font-semibold">R$</span>
                        <span className="text-[3.75vw] leading-none tracking-tighter">{formatarPrecoTv(produto.preco)}</span>
                    </p>
                </div>
            </article>
        );
    }

    return (
        <article className={`flex flex-col rounded-[1.25vw] border-2 px-[2.1vw] py-[1.9vw] ${estilo.cardDestaque}`}>
            <Selo estilo={estilo} />
            <div className="mt-[1.45vw] flex flex-1 flex-col gap-[0.5vw]">
                <h2 className={`text-[2.5vw] leading-tight tracking-tight ${estilo.peso} ${estilo.textoDestaque}`}>{produto.nome}</h2>
                {produto.descricao ? <p className={`text-[1.35vw] leading-snug ${estilo.suaveDestaque}`}>{produto.descricao}</p> : null}
            </div>
            <p className={`flex items-baseline gap-[0.5vw] font-bold tabular-nums ${estilo.precoDestaque}`}>
                <span className="text-[1.75vw] font-semibold">R$</span>
                <span className="text-[4.6vw] leading-none tracking-tighter">{formatarPrecoTv(produto.preco)}</span>
            </p>
        </article>
    );
}
