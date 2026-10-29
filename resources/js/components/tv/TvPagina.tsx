import TvCardDestaque from '@/components/tv/TvCardDestaque';
import TvCardItem from '@/components/tv/TvCardItem';
import { formatarPrecoTv, type EstiloTv, type ProdutoNaTv, type TvPagina as TvPaginaDados } from '@/components/tv/temas';
import { ImageIcon, Star } from 'lucide-react';
import QRCode from 'react-qr-code';

type Props = {
    pagina: TvPaginaDados;
    nomeBoard: string;
    estilo: EstiloTv;
};

/**
 * Uma página do board como a TV mostra. As medidas usam `cqw` (largura do contêiner), então a mesma
 * página serve para a TV em tela cheia e para a prévia do editor.
 */
export default function TvPagina({ pagina, nomeBoard, estilo }: Props) {
    return (
        <div className={`@container size-full overflow-hidden ${estilo.fundo} ${estilo.texto} ${estilo.fonte}`}>
            {pagina.layout === 'destaques_grade' ? <DestaquesGrade pagina={pagina} nomeBoard={nomeBoard} estilo={estilo} /> : null}
            {pagina.layout === 'categoria' ? <Categoria pagina={pagina} nomeBoard={nomeBoard} estilo={estilo} /> : null}
            {pagina.layout === 'banner' ? <img src={pagina.imagem_url} alt="" className="size-full object-cover" /> : null}
            {pagina.layout === 'imagem_lista' ? <ImagemLista pagina={pagina} nomeBoard={nomeBoard} estilo={estilo} /> : null}
            {pagina.layout === 'aviso' ? <Aviso pagina={pagina} nomeBoard={nomeBoard} estilo={estilo} /> : null}
            {pagina.layout === 'produto_destaque' ? <ProdutoDestaque pagina={pagina} nomeBoard={nomeBoard} estilo={estilo} /> : null}
        </div>
    );
}

type LayoutProps<L extends TvPaginaDados['layout']> = {
    pagina: Extract<TvPaginaDados, { layout: L }>;
    nomeBoard: string;
    estilo: EstiloTv;
};

function Cabecalho({ nomeBoard, estilo }: { nomeBoard: string; estilo: EstiloTv }) {
    return (
        <>
            <header>
                <h1 className={`text-[3.3cqw] leading-none tracking-tight ${estilo.peso}`}>{nomeBoard}</h1>
            </header>
            <div aria-hidden="true" className={`h-[0.2cqw] w-[5cqw] shrink-0 rounded-sm ${estilo.regua}`} />
        </>
    );
}

function NomeDoBoard({ nomeBoard, estilo }: { nomeBoard: string; estilo: EstiloTv }) {
    return <p className={`text-[1.4cqw] font-semibold ${estilo.suave}`}>{nomeBoard}</p>;
}

function Preco({ valor, tamanho, moeda, className = '' }: { valor: string; tamanho: string; moeda: string; className?: string }) {
    return (
        <p className={`flex shrink-0 items-baseline gap-[0.4cqw] font-bold whitespace-nowrap tabular-nums ${className}`}>
            <span className={`${moeda} font-semibold`}>R$</span>
            <span className={`${tamanho} leading-none tracking-tight`}>{formatarPrecoTv(valor)}</span>
        </p>
    );
}

function FotoOuEspaco({ url, estilo, className = '' }: { url: string | null; estilo: EstiloTv; className?: string }) {
    if (url) {
        return <img src={url} alt="" className={`object-cover ${className}`} />;
    }

    return (
        <div className={`flex items-center justify-center ${estilo.foto} ${className}`}>
            <ImageIcon aria-hidden="true" className="size-[5cqw]" strokeWidth={1.4} />
        </div>
    );
}

function DestaquesGrade({ pagina, nomeBoard, estilo }: LayoutProps<'destaques_grade'>) {
    const colunasDestaque = Math.min(Math.max(pagina.destaques.length, 1), 3);
    const colunasItens = pagina.itens.length > 9 ? 4 : 3;

    return (
        <main className="flex size-full flex-col gap-[1.25cqw] px-[3.75cqw] py-[2.5cqw]">
            <Cabecalho nomeBoard={nomeBoard} estilo={estilo} />

            {pagina.destaques.length ? (
                <section
                    aria-label="Destaques"
                    className="grid h-[19.8cqw] shrink-0 gap-[1.05cqw]"
                    style={{ gridTemplateColumns: `repeat(${colunasDestaque}, minmax(0, 1fr))` }}
                >
                    {pagina.destaques.map((produto) => (
                        <TvCardDestaque key={produto.id} produto={produto} estilo={estilo} />
                    ))}
                </section>
            ) : null}

            {pagina.itens.length ? (
                <>
                    <h2 className={`mt-[0.2cqw] text-[1.15cqw] font-semibold tracking-[0.2em] uppercase ${estilo.suave}`}>Cardápio</h2>
                    <section
                        aria-label="Cardápio"
                        className="grid gap-x-[1.05cqw] gap-y-[0.85cqw]"
                        style={{ gridTemplateColumns: `repeat(${colunasItens}, minmax(0, 1fr))` }}
                    >
                        {pagina.itens.map((produto) => (
                            <TvCardItem key={produto.id} produto={produto} estilo={estilo} />
                        ))}
                    </section>
                </>
            ) : null}
        </main>
    );
}

function LinhaDeProduto({ produto, estilo }: { produto: ProdutoNaTv; estilo: EstiloTv }) {
    return (
        <article className={`flex items-baseline gap-[1.1cqw] border-b py-[1cqw] ${estilo.linha}`}>
            <div className="min-w-0">
                <h3 className={`truncate text-[2cqw] leading-tight ${estilo.peso}`}>{produto.nome}</h3>
                {produto.descricao ? <p className={`truncate text-[1.4cqw] ${estilo.suave}`}>{produto.descricao}</p> : null}
            </div>
            <span aria-hidden="true" className={`min-w-[2cqw] flex-1 -translate-y-[0.5cqw] border-b-2 border-dotted ${estilo.linha}`} />
            <Preco valor={produto.preco} tamanho="text-[2.65cqw]" moeda="text-[1.25cqw]" className={estilo.precoCard} />
        </article>
    );
}

function Categoria({ pagina, nomeBoard, estilo }: LayoutProps<'categoria'>) {
    return (
        <main className="flex size-full flex-col gap-[1.1cqw] px-[3.75cqw] py-[2.5cqw]">
            <Cabecalho nomeBoard={nomeBoard} estilo={estilo} />
            {pagina.titulo ? (
                <h2 className={`mt-[0.8cqw] text-[5cqw] leading-none font-bold tracking-tight ${estilo.precoCard}`}>{pagina.titulo}</h2>
            ) : null}
            <section aria-label={pagina.titulo ?? 'Produtos'} className="grid grid-cols-2 content-start gap-x-[4.4cqw]">
                {pagina.itens.map((produto) => (
                    <LinhaDeProduto key={produto.id} produto={produto} estilo={estilo} />
                ))}
            </section>
        </main>
    );
}

function ImagemLista({ pagina, nomeBoard, estilo }: LayoutProps<'imagem_lista'>) {
    return (
        <main className="flex size-full">
            <img src={pagina.imagem_url} alt="" className="h-full w-[46%] shrink-0 object-cover" />
            <div className="flex min-w-0 flex-1 flex-col gap-[1.1cqw] px-[3.75cqw] pt-[3.1cqw] pb-[3.75cqw]">
                <NomeDoBoard nomeBoard={nomeBoard} estilo={estilo} />
                {pagina.titulo ? (
                    <h2 className={`text-[4.5cqw] leading-none font-bold tracking-tight ${estilo.precoCard}`}>{pagina.titulo}</h2>
                ) : null}
                <div aria-hidden="true" className={`h-[0.25cqw] w-[5cqw] shrink-0 rounded-sm ${estilo.regua}`} />
                <section aria-label={pagina.titulo ?? 'Produtos'} className="flex flex-col">
                    {pagina.itens.map((produto) => (
                        <LinhaDeProduto key={produto.id} produto={produto} estilo={estilo} />
                    ))}
                </section>
            </div>
        </main>
    );
}

function Aviso({ pagina, nomeBoard, estilo }: LayoutProps<'aviso'>) {
    return (
        <main className="flex size-full flex-col px-[3.75cqw] pt-[2.5cqw] pb-[3.75cqw]">
            <NomeDoBoard nomeBoard={nomeBoard} estilo={estilo} />
            <div className="flex flex-1 items-center gap-[5.6cqw]">
                <div className="flex min-w-0 flex-1 flex-col gap-[1.7cqw]">
                    <div aria-hidden="true" className={`h-[0.3cqw] w-[5cqw] rounded-sm ${estilo.regua}`} />
                    <h2 className="text-[6.7cqw] leading-[0.98] font-bold tracking-tight whitespace-pre-line">{pagina.titulo}</h2>
                    {pagina.texto ? <p className={`max-w-[48cqw] text-[2.35cqw] leading-snug ${estilo.suave}`}>{pagina.texto}</p> : null}
                </div>
                {pagina.qr ? (
                    <figure className="flex w-[26.5cqw] shrink-0 flex-col items-center gap-[1.2cqw]">
                        <div className="w-full rounded-[1.5cqw] bg-white p-[1.9cqw]">
                            <QRCode value={pagina.qr.link} level="M" size={256} viewBox="0 0 256 256" style={{ width: '100%', height: 'auto' }} />
                        </div>
                        {pagina.qr.legenda ? (
                            <figcaption className={`text-center text-[1.4cqw] ${estilo.suave}`}>{pagina.qr.legenda}</figcaption>
                        ) : null}
                    </figure>
                ) : null}
            </div>
        </main>
    );
}

function ProdutoDestaque({ pagina, nomeBoard, estilo }: LayoutProps<'produto_destaque'>) {
    const foto = <FotoOuEspaco url={pagina.produto.foto_url} estilo={estilo} className="h-full w-[46%] shrink-0" />;

    return (
        <main className="flex size-full">
            {pagina.foto_posicao === 'esquerda' ? foto : null}
            <div className="flex min-w-0 flex-1 flex-col px-[3.75cqw] pt-[3.1cqw] pb-[4.4cqw]">
                <NomeDoBoard nomeBoard={nomeBoard} estilo={estilo} />
                <div className="flex flex-1 flex-col justify-center gap-[1.6cqw]">
                    {pagina.selo ? (
                        <span
                            className={`inline-flex h-[3cqw] items-center gap-[0.6cqw] self-start rounded-full px-[1.25cqw] font-sans text-[1.2cqw] font-bold tracking-[0.16em] uppercase ${estilo.selo}`}
                        >
                            <Star aria-hidden="true" className="size-[1.25cqw]" fill="currentColor" />
                            {pagina.selo}
                        </span>
                    ) : null}
                    <h2 className="text-[5.9cqw] leading-[0.98] font-bold tracking-tight">{pagina.produto.nome}</h2>
                    {pagina.produto.descricao ? (
                        <p className={`max-w-[44cqw] text-[2cqw] leading-snug ${estilo.suave}`}>{pagina.produto.descricao}</p>
                    ) : null}
                    {pagina.chamada ? <p className="text-[1.7cqw] font-semibold">{pagina.chamada}</p> : null}
                    <Preco valor={pagina.produto.preco} tamanho="text-[9.4cqw]" moeda="text-[2.8cqw]" className={`mt-[0.8cqw] ${estilo.precoCard}`} />
                </div>
            </div>
            {pagina.foto_posicao === 'direita' ? foto : null}
        </main>
    );
}
