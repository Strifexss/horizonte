import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import { FormDialogField } from '@/components/ui/form-dialog-correcao';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { carregarFornecedores } from './buscaOpcoes';
import { LinhaSelectComCadastro, PainelCadastroRapido } from './CadastroRapido';
import type { CadastroInline } from './useCadastroInline';
import type { LancamentoSelecoes } from './useLancamentoSelecoes';

type Props = {
    selecoes: LancamentoSelecoes;
    cadastro: CadastroInline;
    error?: string;
};

export default function CampoFornecedor({ selecoes, cadastro, error }: Props) {
    const { rascunhoFornecedor: rascunho } = selecoes;

    return (
        <FormDialogField name="fornecedor_id">
            <Label>Fornecedor</Label>
            <LinhaSelectComCadastro rotuloCadastrar="Cadastrar fornecedor" onCadastrar={selecoes.iniciarCadastroFornecedor}>
                <AsyncSelect
                    creatable
                    value={selecoes.fornecedorSelecionado}
                    onChange={(val) => selecoes.alterarFornecedor(val)}
                    loadOptions={carregarFornecedores}
                    placeholder="Buscar fornecedor..."
                    isClearable
                />
            </LinhaSelectComCadastro>
            {rascunho.nome !== null ? (
                <PainelCadastroRapido
                    className="grid gap-2 rounded-md border border-dashed border-emerald-300 bg-emerald-50/60 p-3 dark:border-emerald-800 dark:bg-emerald-950/30"
                    rotuloCriar="Criar fornecedor"
                    criando={cadastro.criandoInline}
                    criarDesabilitado={!rascunho.nome.trim()}
                    onCancelar={selecoes.cancelarCadastroFornecedor}
                    onCriar={cadastro.confirmarFornecedorInline}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="draft_fornecedor_nome">Nome do fornecedor</Label>
                        <Input
                            ref={rascunho.nomeRef}
                            id="draft_fornecedor_nome"
                            value={rascunho.nome}
                            onChange={(e) => selecoes.alterarNomeRascunhoFornecedor(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    cadastro.confirmarFornecedorInline();
                                }
                            }}
                            placeholder="Nome do fornecedor"
                        />
                    </div>
                </PainelCadastroRapido>
            ) : null}
            <InputError message={error} />
        </FormDialogField>
    );
}
