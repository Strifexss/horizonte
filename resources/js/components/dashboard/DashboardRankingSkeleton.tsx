import DashboardRankingCabecalho from '@/components/dashboard/DashboardRankingCabecalho';
import type { CriterioRanking } from '@/components/dashboard/types';

type DashboardRankingSkeletonProps = {
    criterio: CriterioRanking;
    onCriterioChange: (criterio: CriterioRanking) => void;
};

const larguras = ['90%', '60%', '40%', '25%', '15%'];

export default function DashboardRankingSkeleton(props: DashboardRankingSkeletonProps) {
    return (
        <div
            className="border-sidebar-border/70 @container flex h-full min-h-0 min-w-0 flex-col rounded-xl border bg-white p-3 shadow-sm dark:bg-slate-900"
            aria-busy="true"
            aria-label="Carregando ranking"
        >
            <DashboardRankingCabecalho {...props} />

            <div className="flex flex-col gap-4">
                {larguras.map((largura, indice) => (
                    <div key={indice} className="flex flex-col gap-2">
                        <div className="flex justify-between gap-4">
                            <div className="bg-muted/40 h-4 w-1/2 animate-pulse rounded" />
                            <div className="bg-muted/40 h-4 w-20 animate-pulse rounded" />
                        </div>
                        <div className="bg-muted/40 h-2 w-full rounded-full">
                            <div className="bg-muted h-full animate-pulse rounded-full" style={{ width: largura }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
