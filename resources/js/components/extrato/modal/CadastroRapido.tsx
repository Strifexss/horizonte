import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

type LinhaProps = {
    children: ReactNode;
    rotuloCadastrar: string;
    onCadastrar: () => void;
    disabled?: boolean;
};

/** Campo de seleção com o botão `+` ao lado que abre o cadastro rápido. */
export function LinhaSelectComCadastro({ children, rotuloCadastrar, onCadastrar, disabled }: LinhaProps) {
    return (
        <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">{children}</div>
            <Button
                type="button"
                variant="secondary"
                size="icon"
                className="shrink-0"
                aria-label={rotuloCadastrar}
                title={rotuloCadastrar}
                disabled={disabled}
                onClick={onCadastrar}
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}

type PainelProps = {
    children: ReactNode;
    className: string;
    rotuloCriar: string;
    criando: boolean;
    criarDesabilitado: boolean;
    onCancelar: () => void;
    onCriar: () => void;
};

/** Painel do rascunho de cadastro rápido: campos do item e os botões Cancelar / Criar. */
export function PainelCadastroRapido({ children, className, rotuloCriar, criando, criarDesabilitado, onCancelar, onCriar }: PainelProps) {
    return (
        <div className={className}>
            {children}
            <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={onCancelar} disabled={criando}>
                    Cancelar
                </Button>
                <Button
                    type="button"
                    variant="confirm"
                    className="flex-1"
                    disabled={criarDesabilitado || criando}
                    loading={criando}
                    onClick={onCriar}
                >
                    {rotuloCriar}
                </Button>
            </div>
        </div>
    );
}
