import type { CriterioRanking } from '@/components/dashboard/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CRITERIOS_RANKING: { valor: CriterioRanking; rotulo: string }[] = [
    { valor: 'produtos', rotulo: 'Produtos' },
    { valor: 'fornecedores', rotulo: 'Fornecedores' },
    { valor: 'categorias_despesa', rotulo: 'Categorias de despesa' },
    { valor: 'categorias_receita', rotulo: 'Categorias de receita' },
];

function ehCriterioRanking(valor: string): valor is CriterioRanking {
    return CRITERIOS_RANKING.some((criterio) => criterio.valor === valor);
}

type DashboardRankingCabecalhoProps = {
    criterio: CriterioRanking;
    onCriterioChange: (criterio: CriterioRanking) => void;
};

export default function DashboardRankingCabecalho({ criterio, onCriterioChange }: DashboardRankingCabecalhoProps) {
    return (
        <div className="mb-3 flex min-w-0 shrink-0 flex-col gap-2">
            <div className="flex min-w-0 flex-col gap-1">
                <Select
                    value={criterio}
                    onValueChange={(valor) => {
                        if (ehCriterioRanking(valor)) {
                            onCriterioChange(valor);
                        }
                    }}
                >
                    <SelectTrigger
                        id="ranking-criterio"
                        aria-label="Critério do ranking"
                        className="h-auto w-auto max-w-full gap-2 border-none bg-transparent px-0 py-0 text-left text-sm font-medium tracking-wide uppercase shadow-none focus-visible:ring-0 dark:bg-transparent"
                    >
                        <span className="truncate">
                            Ranking de <SelectValue />
                        </span>
                    </SelectTrigger>
                    <SelectContent>
                        {CRITERIOS_RANKING.map((item) => (
                            <SelectItem key={item.valor} value={item.valor}>
                                {item.rotulo}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="text-muted-foreground text-xs">Top 5 · Competência</div>
            </div>
        </div>
    );
}
