import type { TipoLancamento } from './types';

type Props = {
    activeTab: TipoLancamento;
    onChange: (tipo: TipoLancamento) => void;
    disabled: boolean;
};

const ABAS: { tipo: TipoLancamento; rotulo: string }[] = [
    { tipo: 'RECEITA', rotulo: 'Receita' },
    { tipo: 'DESPESA', rotulo: 'Despesa' },
];

/** Abas Receita / Despesa; ficam travadas ao editar um lançamento existente. */
export default function LancamentoAbas({ activeTab, onChange, disabled }: Props) {
    return (
        <div className="flex gap-2">
            {ABAS.map(({ tipo, rotulo }) => (
                <button
                    key={tipo}
                    disabled={disabled}
                    type="button"
                    className={`cursor-pointer rounded-md px-3 py-1 ${activeTab === tipo ? 'bg-primary text-primary-foreground' : 'bg-muted/5'}`}
                    onClick={() => onChange(tipo)}
                >
                    {rotulo}
                </button>
            ))}
        </div>
    );
}
