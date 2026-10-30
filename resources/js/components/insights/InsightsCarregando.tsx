import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

const ETAPAS = ['Lendo receitas, despesas e vendas do mês', 'Comparando com os 3 meses anteriores', 'Escrevendo os insights'];

type Props = {
    periodo: string;
};

export default function InsightsCarregando({ periodo }: Props) {
    const [etapa, setEtapa] = useState(0);

    useEffect(() => {
        const primeiro = window.setTimeout(() => setEtapa(1), 2500);
        const segundo = window.setTimeout(() => setEtapa(2), 6000);

        return () => {
            window.clearTimeout(primeiro);
            window.clearTimeout(segundo);
        };
    }, []);

    return (
        <div className="flex flex-col gap-5">
            <div role="status" className="border-sidebar-border/70 flex flex-col gap-3 rounded-xl border bg-white p-5 dark:bg-slate-900">
                <span className="font-semibold">Analisando os números de {periodo}</span>
                {ETAPAS.map((texto, indice) => (
                    <div key={texto} className="text-muted-foreground flex items-center gap-2.5 text-sm">
                        {indice < etapa ? (
                            <span className="flex size-5 items-center justify-center rounded-full bg-green-100 text-green-700">
                                <Check className="size-3 stroke-[3]" />
                            </span>
                        ) : indice === etapa ? (
                            <span className="m-0.5 size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        ) : (
                            <span className="flex size-5 items-center justify-center">
                                <span className="size-2 rounded-full bg-slate-300" />
                            </span>
                        )}
                        <span className={indice === etapa ? 'text-foreground font-medium' : ''}>{texto}</span>
                    </div>
                ))}
            </div>
            <div aria-hidden="true" className="grid animate-pulse gap-4 md:grid-cols-2">
                {[0, 1, 2, 3].map((indice) => (
                    <div key={indice} className="border-sidebar-border/70 flex h-52 flex-col gap-3 rounded-xl border bg-white p-5 dark:bg-slate-900">
                        <span className="h-5 w-28 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <span className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
                        <span className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                        <span className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                        <span className="mt-auto h-12 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
                    </div>
                ))}
            </div>
        </div>
    );
}
