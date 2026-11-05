import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    quantidade: number;
    aberto: boolean;
    onAlternar: () => void;
    onAdicionar: () => void;
    /** Editor dos itens, mostrado quando aberto. */
    children: ReactNode;
};

/** Itens da venda na etapa de pagamento do celular: recolhidos por padrão, com atalho para voltar ao catálogo. */
export default function VendaItensRecolhiveis({ quantidade, aberto, onAlternar, onAdicionar, children }: Props) {
    return (
        <div className="rounded-lg border">
            <div className="flex items-center gap-2 py-1.5 pr-1.5 pl-3">
                <button
                    type="button"
                    aria-expanded={aberto}
                    onClick={onAlternar}
                    className="flex h-10 flex-1 items-center gap-1.5 text-left text-sm font-semibold"
                >
                    <ChevronRight className={`text-muted-foreground h-4 w-4 transition-transform ${aberto ? 'rotate-90' : ''}`} />
                    Itens da venda ({quantidade})
                </button>
                <Button type="button" variant="outline" size="sm" className="border-blue-600 text-blue-700" onClick={onAdicionar}>
                    + Adicionar itens
                </Button>
            </div>
            {aberto ? <div className="border-t p-2">{children}</div> : null}
        </div>
    );
}
