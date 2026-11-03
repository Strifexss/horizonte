import { Check, X } from 'lucide-react';

const dores = [
    'Horas montando fórmulas que quebram no mês seguinte',
    'Números soltos, sem saber o que eles significam',
    'Gráficos complexos que geram mais dúvida que resposta',
    'Aquela ansiedade de não saber se vai fechar o mês',
];

const ganhos = [
    'Tudo organizado sozinho, em linguagem humana',
    'Veja em segundos para onde seu dinheiro está indo',
    'Venda no balcão já vira receita no financeiro',
    'A tranquilidade de saber exatamente onde você está',
];

export default function LandingContraste() {
    return (
        <section className="border-t border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#030a1c]">
            <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-24 sm:px-6 md:py-28">
                <div className="flex flex-col items-center gap-3.5 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Do caos ao horizonte.</h2>
                    <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
                        Você não precisa de mais dados. Precisa de uma visão que faça sentido.
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-950">
                        <span className="text-[13px] tracking-widest text-slate-500 uppercase dark:text-slate-400">O jeito antigo</span>
                        <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-300">Planilhas, abas e incerteza</h3>
                        <ul className="flex flex-col gap-3.5 text-slate-600 dark:text-slate-400">
                            {dores.map((dor) => (
                                <li key={dor} className="flex gap-2.5">
                                    <X aria-hidden="true" className="text-destructive mt-0.5 size-5 flex-none" />
                                    {dor}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-5 rounded-2xl border border-blue-600/30 bg-white p-8 shadow-2xl shadow-blue-600/10 dark:border-blue-400/35 dark:bg-slate-900">
                        <span className="text-primary text-[13px] tracking-widest uppercase dark:text-blue-400">Com o Horizonte</span>
                        <h3 className="text-2xl font-semibold">Uma tela. Uma decisão clara.</h3>
                        <ul className="flex flex-col gap-3.5 text-slate-700 dark:text-slate-300">
                            {ganhos.map((ganho) => (
                                <li key={ganho} className="flex gap-2.5">
                                    <Check aria-hidden="true" className="mt-0.5 size-5 flex-none text-emerald-600 dark:text-emerald-400" />
                                    {ganho}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
