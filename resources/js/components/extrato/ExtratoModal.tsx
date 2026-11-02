import type { ExtratoCategoriasPadrao } from '@/components/extrato/types';
import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import LancamentoAbas from './modal/LancamentoAbas';
import LancamentoFormulario from './modal/LancamentoFormulario';
import { tipoDaParcela } from './modal/lancamentoValores';
import ModaisAninhados from './modal/ModaisAninhados';
import type { ExtratoModalMode, ExtratoModalParcela, TipoLancamento } from './modal/types';
import { useCadastroInline } from './modal/useCadastroInline';
import { useLancamentoForm } from './modal/useLancamentoForm';
import { useLancamentoPadroes } from './modal/useLancamentoPadroes';
import { useLancamentoSelecoes } from './modal/useLancamentoSelecoes';

export type { ExtratoModalMode, ExtratoModalParcela } from './modal/types';

type Props = {
    open: boolean;
    onOpenChange: (b: boolean) => void;
    mode?: ExtratoModalMode;
    parcela?: ExtratoModalParcela | null;
    categoriasPadrao?: ExtratoCategoriasPadrao | null;
    formasPagamento?: FormaPagamentoItem[];
};

export default function ExtratoModal({ open, onOpenChange, mode = 'create', parcela = null, categoriasPadrao, formasPagamento = [] }: Props) {
    const [activeTab, setActiveTab] = useState<TipoLancamento>(tipoDaParcela(parcela));
    const form = useLancamentoForm({ mode, parcela, formasPagamento, onOpenChange });
    const selecoes = useLancamentoSelecoes({ open, activeTab, quantidade: form.data.quantidade, setData: form.setData });
    const cadastro = useCadastroInline(selecoes, activeTab);
    useLancamentoPadroes({ open, mode, parcela, categoriasPadrao, activeTab, setActiveTab, form, selecoes });

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="flex h-[100dvh] max-w-full flex-col overflow-hidden md:h-auto md:w-[700px]">
                    <DialogHeader>
                        <DialogTitle>{mode === 'edit' ? 'Editar lançamento' : 'Adicionar lançamento'}</DialogTitle>
                        <DialogDescription>
                            {mode === 'edit'
                                ? 'Atualize os dados do lançamento de receita ou despesa.'
                                : 'Crie um novo lançamento de receita ou despesa.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:h-auto">
                        <LancamentoAbas activeTab={activeTab} onChange={setActiveTab} disabled={!!parcela} />
                        <LancamentoFormulario
                            mode={mode}
                            parcela={parcela}
                            activeTab={activeTab}
                            formasPagamento={formasPagamento}
                            form={form}
                            selecoes={selecoes}
                            cadastro={cadastro}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <ModaisAninhados onProdutoCriado={selecoes.alterarProduto} onFuncionarioCriado={selecoes.alterarFuncionario} />
        </>
    );
}
