import type { ExtratoCategoriasPadrao } from '@/components/extrato/types';
import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import { Dialog } from '@/components/ui/dialog';
import { FormDialogContent, FormDialogHeader } from '@/components/ui/form-dialog';
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
            <Dialog
                open={open}
                onOpenChange={(aberto) => {
                    // Fechar pelo X, Esc ou clique fora também descarta o que foi digitado.
                    if (!aberto) {
                        form.reset();
                    }
                    onOpenChange(aberto);
                }}
            >
                <FormDialogContent>
                    <FormDialogHeader
                        title={mode === 'edit' ? 'Editar lançamento' : 'Adicionar lançamento'}
                        description={
                            mode === 'edit'
                                ? 'Atualize os dados do lançamento de receita ou despesa.'
                                : 'Crie um novo lançamento de receita ou despesa.'
                        }
                    />

                    <LancamentoFormulario
                        mode={mode}
                        parcela={parcela}
                        activeTab={activeTab}
                        formasPagamento={formasPagamento}
                        form={form}
                        selecoes={selecoes}
                        cadastro={cadastro}
                        antes={<LancamentoAbas activeTab={activeTab} onChange={setActiveTab} disabled={!!parcela} />}
                    />
                </FormDialogContent>
            </Dialog>

            <ModaisAninhados onProdutoCriado={selecoes.alterarProduto} onFuncionarioCriado={selecoes.alterarFuncionario} />
        </>
    );
}
