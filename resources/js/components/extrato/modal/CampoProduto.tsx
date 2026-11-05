import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import { FormDialogField } from '@/components/ui/form-dialog-correcao';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MoneyInput from '@/components/ui/money-input';
import { carregarProdutos } from './buscaOpcoes';
import { LinhaSelectComCadastro, PainelCadastroRapido } from './CadastroRapido';
import type { CadastroInline } from './useCadastroInline';
import type { LancamentoSelecoes } from './useLancamentoSelecoes';

type Props = {
    selecoes: LancamentoSelecoes;
    cadastro: CadastroInline;
    error?: string;
};

export default function CampoProduto({ selecoes, cadastro, error }: Props) {
    const { rascunhoProduto: rascunho } = selecoes;

    return (
        <FormDialogField name="produto_id">
            <Label>Produto</Label>
            <LinhaSelectComCadastro rotuloCadastrar="Cadastrar produto" onCadastrar={selecoes.iniciarCadastroProduto}>
                <AsyncSelect
                    selectRef={selecoes.produtoSelectRef}
                    autoFocus
                    creatable
                    value={selecoes.produtoSelecionado}
                    onChange={selecoes.alterarProduto}
                    loadOptions={carregarProdutos}
                    placeholder="Buscar produto..."
                    isClearable
                />
            </LinhaSelectComCadastro>
            {rascunho.nome !== null ? (
                <PainelCadastroRapido
                    className="grid gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/30"
                    rotuloCriar="Criar produto"
                    criando={cadastro.criandoInline}
                    criarDesabilitado={!rascunho.nome.trim() || !rascunho.valor}
                    onCancelar={selecoes.cancelarCadastroProduto}
                    onCriar={cadastro.confirmarProdutoInline}
                >
                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="draft_produto_nome">Nome do produto</Label>
                            <Input
                                ref={rascunho.nomeRef}
                                id="draft_produto_nome"
                                value={rascunho.nome}
                                onChange={(e) => selecoes.alterarNomeRascunhoProduto(e.target.value)}
                                placeholder="Nome do produto"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="draft_preco_compra">Preço de Compra</Label>
                            <MoneyInput
                                ref={rascunho.valorRef}
                                id="draft_preco_compra"
                                value={rascunho.valor ? Number(rascunho.valor) : null}
                                onValueChange={(v) => rascunho.setValor(v !== null ? String(v) : '')}
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                </PainelCadastroRapido>
            ) : null}
            <InputError message={error} />
        </FormDialogField>
    );
}
