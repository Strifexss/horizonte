import type { FormaPagamentoItem } from '@/components/formas-pagamento/types';
import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { carregarContas } from './buscaOpcoes';
import CampoCategoria from './CampoCategoria';
import CampoFornecedor from './CampoFornecedor';
import CampoFuncionario from './CampoFuncionario';
import CampoProduto from './CampoProduto';
import LancamentoPagamentoCampos from './LancamentoPagamentoCampos';
import LancamentoValoresCampos from './LancamentoValoresCampos';
import type { ExtratoModalMode, ExtratoModalParcela, TipoLancamento } from './types';
import type { CadastroInline } from './useCadastroInline';
import type { LancamentoForm } from './useLancamentoForm';
import type { LancamentoSelecoes } from './useLancamentoSelecoes';

type Props = {
    mode: ExtratoModalMode;
    parcela: ExtratoModalParcela | null;
    activeTab: TipoLancamento;
    formasPagamento: FormaPagamentoItem[];
    form: LancamentoForm;
    selecoes: LancamentoSelecoes;
    cadastro: CadastroInline;
};

/** Card com o formulário do lançamento: campos de acordo com a categoria escolhida e ações do rodapé. */
export default function LancamentoFormulario({ mode, parcela, activeTab, formasPagamento, form, selecoes, cadastro }: Props) {
    const { data, setData, errors, processing, reset, submit, ehLancamentoDeVenda } = form;

    return (
        <div className="border-sidebar-border/70 mt-4 rounded-lg border bg-white p-4 shadow-sm dark:bg-slate-900">
            <form onSubmit={submit} noValidate className="grid gap-2">
                <Input type="hidden" name="id" />

                {ehLancamentoDeVenda ? (
                    <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                        Este lançamento foi gerado pela Venda #{parcela?.venda_id}: aqui só é possível dar baixa no valor pago. Para mudar valor,
                        forma de pagamento ou excluir, cancele a venda.
                    </p>
                ) : null}

                {selecoes.mostrarProduto && <CampoProduto selecoes={selecoes} cadastro={cadastro} error={errors.produto_id} />}

                {selecoes.mostrarProduto && <CampoFornecedor selecoes={selecoes} cadastro={cadastro} error={errors.fornecedor_id} />}

                {selecoes.mostrarFuncionario && <CampoFuncionario selecoes={selecoes} cadastro={cadastro} error={errors.funcionario_id} />}

                <div className="grid gap-2">
                    <div className="grid gap-2">
                        <Label>
                            Descrição <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="descricao"
                            value={data.descricao}
                            onChange={(e) => setData('descricao', e.target.value)}
                            placeholder="Descrição do lançamento"
                            disabled={processing || ehLancamentoDeVenda}
                        />
                        <InputError message={errors.descricao} />
                    </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>
                            Conta <span className="text-red-500">*</span>
                        </Label>
                        <AsyncSelect
                            value={selecoes.contaSelecionada}
                            onChange={selecoes.alterarConta}
                            loadOptions={carregarContas}
                            placeholder="Selecione a conta..."
                            isClearable={false}
                            isDisabled={ehLancamentoDeVenda}
                        />
                        <InputError message={errors.conta_id} />
                    </div>

                    <CampoCategoria
                        selecoes={selecoes}
                        cadastro={cadastro}
                        tipo={activeTab}
                        disabled={ehLancamentoDeVenda}
                        error={errors.categoria_id}
                    />
                </div>

                <LancamentoValoresCampos
                    form={form}
                    tipo={activeTab}
                    mostrarQuantidade={selecoes.mostrarProduto}
                    produtoSelecionado={selecoes.produtoSelecionado}
                />

                <LancamentoPagamentoCampos form={form} formasPagamento={formasPagamento} />

                <DialogFooter className="mt-4 flex flex-row gap-2">
                    <DialogClose asChild>
                        <Button
                            className="w-full"
                            variant="secondary"
                            type="button"
                            onClick={() => {
                                reset();
                            }}
                        >
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button type="submit" className="ml-2 w-full" loading={processing} variant="confirm">
                        {mode === 'edit' ? 'Salvar alterações' : 'Adicionar'}
                    </Button>
                </DialogFooter>
            </form>
        </div>
    );
}
