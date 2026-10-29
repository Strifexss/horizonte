import { formatarPrecoTv, type EstiloTv, type ProdutoNaTv } from '@/components/tv/temas';
import { Star } from 'lucide-react';

type Props = {
    produto: ProdutoNaTv;
    estilo: EstiloTv;
};

function Selo({ estilo, className = '' }: { estilo: EstiloTv; className?: string }) {
    return (
        <span
            className={`inline-flex h-[2.1cqw] items-center gap-[0.4cqw] self-start rounded-full px-[0.85cqw] text-[0.95cqw] font-bold tracking-[0.12em] ${estilo.selo} ${className}`}
        >
            <Star className="size-[1cqw]" fill="currentColor" />
            DESTAQUE
        </span>
    );
}

export default function TvCardDestaque({ produto, estilo }: Props) {
    if (produto.foto_url) {
        return (
            <article className={`flex flex-col overflow-hidden rounded-[1.25cqw] border-2 ${estilo.cardDestaque}`}>
                <div className="relative h-[9.2cqw] shrink-0">
                    <img src={produto.foto_url} alt="" className="size-full object-cover" />
                    <Selo estilo={estilo} className="absolute top-[1cqw] left-[1.25cqw]" />
                </div>
                <div className="flex flex-1 items-end justify-between gap-[1cqw] px-[1.7cqw] pt-[1.15cqw] pb-[1.35cqw]">
                    <div className="min-w-0">
                        <h2 className={`text-[2.1cqw] leading-tight tracking-tight ${estilo.peso} ${estilo.textoDestaque}`}>{produto.nome}</h2>
                        {produto.descricao ? <p className={`truncate text-[1.15cqw] ${estilo.suaveDestaque}`}>{produto.descricao}</p> : null}
                    </div>
                    <p className={`flex shrink-0 items-baseline gap-[0.4cqw] font-bold tabular-nums ${estilo.precoDestaque}`}>
                        <span className="text-[1.75cqw] font-semibold">R$</span>
                        <span className="text-[3.75cqw] leading-none tracking-tighter">{formatarPrecoTv(produto.preco)}</span>
                    </p>
                </div>
            </article>
        );
    }

    return (
        <article className={`flex flex-col rounded-[1.25cqw] border-2 px-[2.1cqw] py-[1.9cqw] ${estilo.cardDestaque}`}>
            <Selo estilo={estilo} />
            <div className="mt-[1.45cqw] flex flex-1 flex-col gap-[0.5cqw]">
                <h2 className={`text-[2.5cqw] leading-tight tracking-tight ${estilo.peso} ${estilo.textoDestaque}`}>{produto.nome}</h2>
                {produto.descricao ? <p className={`text-[1.35cqw] leading-snug ${estilo.suaveDestaque}`}>{produto.descricao}</p> : null}
            </div>
            <p className={`flex items-baseline gap-[0.5cqw] font-bold tabular-nums ${estilo.precoDestaque}`}>
                <span className="text-[1.75cqw] font-semibold">R$</span>
                <span className="text-[4.6cqw] leading-none tracking-tighter">{formatarPrecoTv(produto.preco)}</span>
            </p>
        </article>
    );
}
