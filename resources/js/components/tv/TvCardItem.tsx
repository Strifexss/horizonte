import { formatarPrecoTv, type EstiloTv, type ProdutoNaTv } from '@/components/tv/temas';

type Props = {
    produto: ProdutoNaTv;
    estilo: EstiloTv;
};

export default function TvCardItem({ produto, estilo }: Props) {
    if (produto.foto_url) {
        return (
            <article className={`flex min-h-[7.8vw] items-center gap-[1vw] rounded-[0.95vw] border-2 p-[1vw] ${estilo.card}`}>
                <img src={produto.foto_url} alt="" className="size-[5.7vw] shrink-0 rounded-[0.6vw] object-cover" />
                <div className="min-w-0 flex-1">
                    <h3 className={`truncate text-[1.55vw] leading-tight ${estilo.peso} ${estilo.textoCard}`}>{produto.nome}</h3>
                    {produto.descricao ? <p className={`truncate text-[1.05vw] ${estilo.suaveCard}`}>{produto.descricao}</p> : null}
                    <p className={`mt-[0.15vw] flex items-baseline gap-[0.3vw] font-bold tabular-nums ${estilo.precoCard}`}>
                        <span className="text-[1.25vw] font-semibold">R$</span>
                        <span className="text-[2.1vw] leading-none tracking-tight">{formatarPrecoTv(produto.preco)}</span>
                    </p>
                </div>
            </article>
        );
    }

    return (
        <article
            className={`flex min-h-[7.8vw] items-center justify-between gap-[1.25vw] rounded-[0.95vw] border-2 px-[1.7vw] py-[1.25vw] ${estilo.card}`}
        >
            <div className="min-w-0">
                <h3 className={`line-clamp-2 text-[1.8vw] leading-tight ${estilo.peso} ${estilo.textoCard}`}>{produto.nome}</h3>
                {produto.descricao ? <p className={`truncate text-[1.15vw] ${estilo.suaveCard}`}>{produto.descricao}</p> : null}
            </div>
            <p className={`flex shrink-0 items-baseline gap-[0.3vw] font-bold tabular-nums ${estilo.precoCard}`}>
                <span className="text-[1.25vw] font-semibold">R$</span>
                <span className="text-[2.7vw] leading-none tracking-tight">{formatarPrecoTv(produto.preco)}</span>
            </p>
        </article>
    );
}
