import InputError from '@/components/input-error';
import ProdutoCodigoScanner from '@/components/produtos/ProdutoCodigoScanner';
import { FormDialogField } from '@/components/ui/form-dialog-correcao';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { irParaNoEnter as irPara } from '@/lib/ir-para-no-enter';
import { Info } from 'lucide-react';

type Props = {
    codigo: string;
    descricao: string;
    disabled: boolean;
    errors: { codigo?: string; descricao?: string };
    onCodigoChange: (codigo: string) => void;
    onDescricaoChange: (descricao: string) => void;
};

/** Código (com leitura pela câmera, quando o navegador permite) e descrição do produto. */
export default function ProdutoCodigoDescricaoFields({ codigo, descricao, disabled, errors, onCodigoChange, onDescricaoChange }: Props) {
    return (
        <div className="grid gap-5 md:grid-cols-2 md:gap-2">
            <FormDialogField name="codigo">
                <Label htmlFor="produto_codigo">Código</Label>
                <div className="flex items-start gap-2">
                    <Input
                        id="produto_codigo"
                        value={codigo}
                        onChange={(e) => onCodigoChange(e.target.value)}
                        onKeyDown={irPara('produto_descricao')}
                        enterKeyHint="next"
                        placeholder="Automático ou EAN"
                        title="Em branco gera o próximo número. Aceita EAN e leitor de código de barras."
                        maxLength={50}
                        disabled={disabled}
                    />
                    <ProdutoCodigoScanner disabled={disabled} onLido={onCodigoChange} />
                </div>
                <InputError message={errors.codigo} />
            </FormDialogField>

            <FormDialogField name="descricao">
                <Label htmlFor="produto_descricao" className="flex items-center gap-1">
                    Descrição
                    <Info className="text-muted-foreground size-3.5" aria-hidden="true" />
                    <span className="sr-only">(aparece no Menu Board da TV)</span>
                </Label>
                <Input
                    id="produto_descricao"
                    value={descricao}
                    onChange={(e) => onDescricaoChange(e.target.value)}
                    placeholder="Aparece no Menu Board da TV"
                    enterKeyHint="done"
                    onKeyDown={irPara(null)}
                    maxLength={160}
                    disabled={disabled}
                />
                <InputError message={errors.descricao} />
            </FormDialogField>
        </div>
    );
}
