import { cn } from '@/lib/utils';
import { Barcode, CreditCard, DollarSign, Monitor, ShoppingCart, Smartphone, Sparkles, Tag, Users, type LucideIcon } from 'lucide-react';

type Beneficio = { icone: LucideIcon; titulo: string; texto: string };

type Segmento = {
    id: string;
    selo: string;
    titulo: string;
    texto: string;
    foto: string;
    fotoAlt: string;
    etiquetas: string[];
    beneficios: Beneficio[];
    cta: string;
};

const segmentos: Segmento[] = [
    {
        id: 'restaurantes',
        selo: 'Para restaurantes',
        titulo: 'Seu lugar é na cozinha. A gestão cabe no bolso.',
        texto: 'Do pedido no balcão ao fechamento do mês, o Horizonte organiza o restaurante para você cuidar do que faz de melhor: cozinhar e receber bem.',
        foto: '/images/landing/restaurante.webp',
        fotoAlt: 'Chef sorrindo na cozinha do restaurante enquanto usa o celular',
        etiquetas: ['Venda fechada · receita já no caixa', 'Cardápio atualizado na TV'],
        cta: 'Testar no meu restaurante',
        beneficios: [
            { icone: ShoppingCart, titulo: 'Venda rápida no balcão', texto: 'Bipe, busque ou toque no favorito e feche o pedido em segundos.' },
            {
                icone: Monitor,
                titulo: 'Cardápio na TV, sempre com o preço certo',
                texto: 'O Menu Board puxa os preços do cadastro e destaca os pratos que você quer vender mais.',
            },
            { icone: DollarSign, titulo: 'Custos e margem no controle', texto: 'Preço de compra e venda em cada produto e despesas por categoria.' },
            { icone: Sparkles, titulo: 'O Copiloto avisa o que mudou', texto: 'A IA compara o mês com os anteriores e aponta onde cortar custos.' },
            { icone: Smartphone, titulo: 'Tudo no celular', texto: 'Acompanhe vendas e o caixa do dia sem sair da cozinha.' },
        ],
    },
    {
        id: 'varejo',
        selo: 'Para o varejo',
        titulo: 'Do caixa ao lucro, sem perder nenhuma venda.',
        texto: 'Mercadinho, loja ou conveniência: o Horizonte acelera o balcão e organiza o financeiro para você saber, todo dia, quanto realmente sobrou.',
        foto: '/images/landing/varejo.webp',
        fotoAlt: 'Comerciante sorrindo no balcão da loja segurando a maquininha de cartão',
        etiquetas: ['Pix, crédito, débito e espécie', 'Receita direto no financeiro'],
        cta: 'Testar na minha loja',
        beneficios: [
            { icone: Barcode, titulo: 'Caixa ágil', texto: 'Bipe o código ou busque pelo nome e feche a venda em segundos, mesmo com fila.' },
            { icone: CreditCard, titulo: 'Todas as formas de pagamento', texto: 'Crédito, débito, espécie e Pix, inclusive divididos.' },
            { icone: Tag, titulo: 'Margem de cada produto à vista', texto: 'Preço de compra e de venda lado a lado, com fornecedores e grupos.' },
            { icone: Users, titulo: 'Clientes cadastrados', texto: 'Venda para o consumidor final ou para clientes que você acompanha.' },
            { icone: Sparkles, titulo: 'O Copiloto aponta o que vende', texto: 'Veja quais produtos puxam o faturamento e onde estão os custos.' },
        ],
    },
];

type LandingSegmentosProps = {
    criarContaHref: string;
};

export default function LandingSegmentos({ criarContaHref }: LandingSegmentosProps) {
    return (
        <>
            <section id="segmentos" className="scroll-mt-16 border-t border-slate-200 dark:border-slate-800">
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-3.5 px-4 pt-16 text-center sm:px-6 sm:pt-24 md:pt-28">
                    <span className="text-primary text-sm font-semibold dark:text-blue-400">Segmentos</span>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Feito sob medida para o seu negócio.</h2>
                    <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                        No primeiro acesso você escolhe o seu ramo e o Horizonte já nasce com as funcionalidades certas ligadas.
                    </p>
                </div>
            </section>
            {segmentos.map((segmento, indice) => (
                <section key={segmento.id} id={segmento.id} aria-labelledby={`${segmento.id}-titulo`}>
                    <div
                        className={cn(
                            'mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12 sm:gap-14 sm:px-6 sm:py-20 lg:flex-row',
                            indice % 2 === 1 && 'lg:flex-row-reverse',
                        )}
                    >
                        <div className="relative w-full lg:flex-1">
                            <img
                                src={segmento.foto}
                                alt={segmento.fotoAlt}
                                width={1024}
                                height={559}
                                loading="lazy"
                                decoding="async"
                                className="aspect-[4/3] w-full rounded-2xl border border-slate-200 object-cover object-[60%_center] shadow-2xl shadow-blue-600/10 sm:rounded-3xl lg:aspect-[4/5] dark:border-slate-800"
                            />
                            <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2 sm:inset-x-5 sm:bottom-5 sm:gap-2.5">
                                {segmento.etiquetas.map((etiqueta) => (
                                    <span
                                        key={etiqueta}
                                        className="rounded-xl border border-blue-400/40 bg-slate-950/85 px-3 py-2 text-xs font-semibold text-slate-100 sm:px-3.5 sm:py-2.5 sm:text-sm"
                                    >
                                        {etiqueta}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-7 lg:flex-1">
                            <div className="flex flex-col gap-3.5">
                                <span className="text-primary text-[13px] font-semibold tracking-widest uppercase dark:text-blue-400">
                                    {segmento.selo}
                                </span>
                                <h3 id={`${segmento.id}-titulo`} className="text-2xl leading-tight font-bold tracking-tight sm:text-4xl">
                                    {segmento.titulo}
                                </h3>
                                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">{segmento.texto}</p>
                            </div>
                            <ul className="flex flex-col gap-5">
                                {segmento.beneficios.map(({ icone: Icone, titulo, texto }) => (
                                    <li key={titulo} className="flex gap-3.5">
                                        <span className="flex size-10 flex-none items-center justify-center rounded-lg bg-blue-600/10">
                                            <Icone aria-hidden="true" className="text-primary size-5 dark:text-blue-400" />
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[17px] font-semibold">{titulo}</span>
                                            <span className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{texto}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <a
                                href={criarContaHref}
                                className="bg-primary text-primary-foreground inline-flex min-h-13 w-full items-center justify-center rounded-xl px-7 text-[17px] font-semibold hover:bg-blue-700 sm:w-auto sm:self-start"
                            >
                                {segmento.cta}
                            </a>
                        </div>
                    </div>
                </section>
            ))}
        </>
    );
}
