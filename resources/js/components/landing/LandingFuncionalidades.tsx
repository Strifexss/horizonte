import LandingPrint from '@/components/landing/LandingPrint';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

type Funcionalidade = {
    selo: string;
    titulo: string;
    texto: string;
    itens: string[];
    print: string;
    printAlt: string;
};

const funcionalidades: Funcionalidade[] = [
    {
        selo: 'Vendas',
        titulo: 'Venda no balcão em segundos.',
        texto: 'Bipe, busque ou toque no favorito, escolha a forma de pagamento e salve. No celular, em duas etapas. Ao fechar a venda, a receita já cai no financeiro.',
        itens: [
            'Bipe o código, busque pelo nome ou toque num favorito',
            'Crédito, débito, espécie, Pix e divisão entre formas',
            'Venda para o consumidor ou para um cliente cadastrado',
            'Cancelou? As receitas geradas saem junto',
        ],
        print: '/images/landing/venda.webp',
        printAlt: 'Janela Nova Venda com itens no carrinho, cliente, total e formas de pagamento',
    },
    {
        selo: 'Menu Board',
        titulo: 'Seu cardápio na TV do balcão.',
        texto: 'Monte o cardápio no Horizonte e mostre na TV da loja. Escolha o tema, os produtos e os destaques. Os preços vêm do seu cadastro.',
        itens: [
            '8 temas prontos',
            'Páginas que alternam sozinhas na tela',
            'Destaques em card grande para vender mais',
            'Conecte a TV com um PIN de 4 dígitos',
        ],
        print: '/images/landing/menu-board-tv.webp',
        printAlt: 'Menu Board exibido na TV com dois destaques e grade de produtos com preços',
    },
    {
        selo: 'Financeiro e Extrato',
        titulo: 'Cada real no lugar certo.',
        texto: 'Receitas e despesas organizadas por competência, com parcelas, categorias, contas e fornecedores. Filtre do jeito que precisar e gere PDF.',
        itens: [
            'Entradas, saídas e saldo do período num olhar',
            'Filtros por conta, categoria, produto, grupo e fornecedor',
            'Status aberto, pago e parcial',
            'Exportação em PDF',
        ],
        print: '/images/landing/extrato.webp',
        printAlt: 'Extrato financeiro com filtros, totais e lista de lançamentos',
    },
    {
        selo: 'Dashboard',
        titulo: 'Seus números, sem decifrar planilha.',
        texto: 'Escolha o mês e veja o que importa: entradas, saídas, saldo, ranking de produtos e a evolução ao longo do ano.',
        itens: [
            'Ranking dos produtos que mais vendem',
            'Saldo mensal, receitas e despesas por mês',
            'Despesas por categoria',
            'Receitas por dia da semana',
        ],
        print: '/images/landing/dashboard.webp',
        printAlt: 'Dashboard com entradas, saídas, saldo, ranking de produtos e gráficos',
    },
    {
        selo: 'Cadastros',
        titulo: 'Tudo o que o negócio precisa, num lugar só.',
        texto: 'Produtos com código e preço de compra e venda, clientes, grupos, fornecedores, funcionários, contas e formas de pagamento.',
        itens: [
            'Margem visível em cada produto',
            'Fornecedores e grupos para organizar o estoque',
            'Equipe com cargos: admin master, gerente e atendente',
            'Clientes cadastrados para vender e acompanhar',
        ],
        print: '/images/landing/produtos.webp',
        printAlt: 'Lista de produtos com preço de compra, preço de venda e status',
    },
];

export default function LandingFuncionalidades() {
    return (
        <section id="funcionalidades" className="scroll-mt-16 border-t border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#030a1c]">
            <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-24 sm:px-6 md:py-28">
                <div className="flex flex-col items-center gap-3.5 text-center">
                    <span className="text-primary text-sm font-semibold dark:text-blue-400">Funcionalidades</span>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Do balcão ao resultado, tudo conectado.</h2>
                    <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                        Cada venda alimenta o financeiro, que alimenta o dashboard, que alimenta o Copiloto. Você só cuida do negócio.
                    </p>
                </div>
                {funcionalidades.map((funcionalidade, indice) => (
                    <div
                        key={funcionalidade.selo}
                        className={cn('flex flex-col items-center gap-12 lg:flex-row', indice % 2 === 1 && 'lg:flex-row-reverse')}
                    >
                        <LandingPrint src={funcionalidade.print} alt={funcionalidade.printAlt} className="w-full lg:flex-[1.4]" />
                        <div className="flex w-full flex-col gap-4 lg:flex-1">
                            <span className="text-primary text-[13px] font-semibold tracking-widest uppercase dark:text-blue-400">
                                {funcionalidade.selo}
                            </span>
                            <h3 className="text-2xl leading-tight font-bold tracking-tight sm:text-3xl">{funcionalidade.titulo}</h3>
                            <p className="text-[17px] leading-relaxed text-slate-600 dark:text-slate-400">{funcionalidade.texto}</p>
                            <ul className="flex flex-col gap-2.5 text-slate-700 dark:text-slate-300">
                                {funcionalidade.itens.map((item) => (
                                    <li key={item} className="flex gap-2.5">
                                        <Check aria-hidden="true" className="mt-0.5 size-5 flex-none text-emerald-600 dark:text-emerald-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
