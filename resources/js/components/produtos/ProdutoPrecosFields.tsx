import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import MoneyInput from '@/components/ui/money-input';

type Props = {
    precoVenda: string;
    precoCompra: string;
    disabled: boolean;
    errors: { preco_venda?: string; preco_compra?: string };
    onPrecoVendaChange: (valor: string) => void;
    onPrecoCompraChange: (valor: string) => void;
};

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function paraTexto(valor: number | null): string {
    return valor === null ? '' : valor.toFixed(2);
}

/** Preço de venda em destaque, compra ao lado e a margem calculada logo abaixo. */
export default function ProdutoPrecosFields({ precoVenda, precoCompra, disabled, errors, onPrecoVendaChange, onPrecoCompraChange }: Props) {
    const venda = Number(precoVenda) || 0;
    const compra = Number(precoCompra) || 0;
    const margem = venda - compra;
    const mostrarMargem = venda > 0 && compra > 0;

    return (
        <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-3 md:gap-2">
                <div className="grid gap-2">
                    <Label htmlFor="produto_preco_venda">Preço de venda</Label>
                    <MoneyInput
                        id="produto_preco_venda"
                        showSymbol
                        inputMode="decimal"
                        value={precoVenda ? Number(precoVenda) : null}
                        onValueChange={(valor) => onPrecoVendaChange(paraTexto(valor))}
                        placeholder="R$ 0,00"
                        disabled={disabled}
                        className="h-12 text-lg font-semibold md:h-10 md:text-sm md:font-normal"
                    />
                    <InputError message={errors.preco_venda} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="produto_preco_compra" className="text-muted-foreground">
                        Preço de compra
                    </Label>
                    <MoneyInput
                        id="produto_preco_compra"
                        showSymbol
                        inputMode="decimal"
                        value={precoCompra ? Number(precoCompra) : null}
                        onValueChange={(valor) => onPrecoCompraChange(paraTexto(valor))}
                        placeholder="R$ 0,00"
                        disabled={disabled}
                        className="h-12 md:h-10"
                    />
                    <InputError message={errors.preco_compra} />
                </div>
            </div>

            {mostrarMargem ? (
                <p className={`text-sm ${margem < 0 ? 'text-red-600' : 'text-muted-foreground'}`} aria-live="polite">
                    Margem: {moeda.format(margem)} ({Math.round((margem / venda) * 100)}%)
                </p>
            ) : null}
        </div>
    );
}
