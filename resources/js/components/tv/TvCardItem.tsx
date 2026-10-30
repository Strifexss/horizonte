import { formatarPrecoTv, type EstiloTv, type ProdutoNaTv } from '@/components/tv/temas';

type Props = {
    produto: ProdutoNaTv;
    estilo: EstiloTv;
};

export default function TvCardItem({ produto, estilo }: Props) {
    if (produto.foto_url) {
        return (
            <article className={`flex min-h-[7.8cqw] items-center gap-[1cqw] rounded-[0.95cqw] border-2 p-[1cqw] ${estilo.card}`}>
                <img src={produto.foto_url} alt="" className="size-[5.7cqw] shrink-0 rounded-[0.6cqw] object-cover" />
                <div className="min-w-0 flex-1">
                    <h3 className={`truncate text-[1.55cqw] leading-tight ${estilo.peso} ${estilo.textoCard}`}>{produto.nome}</h3>
                    {produto.descricao ? <p className={`truncate text-[1.05cqw] ${estilo.suaveCard}`}>{produto.descricao}</p> : null}
                    <p className={`mt-[0.15cqw] flex items-baseline gap-[0.3cqw] font-bold tabular-nums ${estilo.precoCard}`}>
                        <span className="text-[1.25cqw] font-semibold">R$</span>
                        <span className="text-[2.1cqw] leading-none tracking-tight">{formatarPrecoTv(produto.preco)}</span>
                    </p>
                </div>
            </article>
        );
    }

    return (
        <article
            className={`flex min-h-[7.8cqw] items-center justify-between gap-[1.25cqw] rounded-[0.95cqw] border-2 px-[1.7cqw] py-[1.25cqw] ${estilo.card}`}
        >
            <div className="min-w-0">
                <h3 className={`line-clamp-2 text-[1.8cqw] leading-tight ${estilo.peso} ${estilo.textoCard}`}>{produto.nome}</h3>
                {produto.descricao ? <p className={`truncate text-[1.15cqw] ${estilo.suaveCard}`}>{produto.descricao}</p> : null}
            </div>
            <p className={`flex shrink-0 items-baseline gap-[0.3cqw] font-bold tabular-nums ${estilo.precoCard}`}>
                <span className="text-[1.25cqw] font-semibold">R$</span>
                <span className="text-[2.7cqw] leading-none tracking-tight">{formatarPrecoTv(produto.preco)}</span>
            </p>
        </article>
    );
}
