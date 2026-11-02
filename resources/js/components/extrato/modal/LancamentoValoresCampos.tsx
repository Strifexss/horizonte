import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MoneyInput from '@/components/ui/money-input';
import type { ExtratoOpcao, TipoLancamento } from './types';
import type { LancamentoForm } from './useLancamentoForm';

type Props = {
    form: LancamentoForm;
    tipo: TipoLancamento;
    mostrarQuantidade: boolean;
    produtoSelecionado: ExtratoOpcao | null;
};

/** Quantidade (só com produto), valor e valor pago do lançamento. */
export default function LancamentoValoresCampos({ form, tipo, mostrarQuantidade, produtoSelecionado }: Props) {
    const { data, setData, errors, processing, ehLancamentoDeVenda, formaSelecionada } = form;

    const alterarQuantidade = (quantidadeDigitada: string) => {
        setData('quantidade', quantidadeDigitada);
        const qtdStr = quantidadeDigitada === '' ? '1' : quantidadeDigitada;
        const qtd = Math.max(1, parseFloat(qtdStr) || 1);
        const precoStr =
            produtoSelecionado?.preco_compra !== undefined && produtoSelecionado?.preco_compra !== null
                ? String(produtoSelecionado.preco_compra)
                : null;
        if (precoStr !== null) {
            const precoNum = parseFloat(precoStr.replace(',', '.') || precoStr);
            if (!isNaN(precoNum)) {
                const total = (precoNum * qtd).toFixed(2);
                setData('valor', total);
                setData('valor_pago', total);
            }
        }
    };

    return (
        <div className={`grid gap-2 ${tipo === 'RECEITA' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {mostrarQuantidade && (
                <div className="grid gap-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                        id="quantidade"
                        type="number"
                        min={1}
                        value={data.quantidade}
                        onChange={(e) => alterarQuantidade(e.target.value)}
                        disabled={processing}
                    />
                    <InputError message={errors.quantidade} />
                </div>
            )}
            <div className="grid gap-2">
                <Label>
                    Valor <span className="text-red-500">*</span>
                </Label>
                <MoneyInput
                    id="valor"
                    value={data.valor ? Number(data.valor) : null}
                    onValueChange={(v) => {
                        const valor = v === null ? '' : v.toFixed(2);
                        const sugereBaixa = formaSelecionada === null || formaSelecionada.baixa_automatica;
                        setData({
                            ...data,
                            valor,
                            valor_pago: sugereBaixa ? valor : data.valor_pago,
                        });
                    }}
                    placeholder="0,00"
                    disabled={processing || ehLancamentoDeVenda}
                />
                <InputError message={errors.valor} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="valor_pago">Valor pago</Label>
                <MoneyInput
                    id="valor_pago"
                    value={data.valor_pago ? Number(data.valor_pago) : null}
                    onValueChange={(v) => setData('valor_pago', v === null ? '' : v.toFixed(2))}
                    placeholder="0,00"
                    disabled={processing}
                />
                <InputError message={errors.valor_pago} />
            </div>
        </div>
    );
}
