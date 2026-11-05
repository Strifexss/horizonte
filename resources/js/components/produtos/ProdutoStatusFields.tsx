import { Checkbox } from '@/components/ui/checkbox';
import { Star } from 'lucide-react';

type Props = {
    ativo: boolean;
    favorito: boolean;
    disabled: boolean;
    onAtivoChange: (ativo: boolean) => void;
    onFavoritoChange: (favorito: boolean) => void;
};

/** Ativo e Favorito como linhas tocáveis inteiras, com a explicação de cada uma. */
export default function ProdutoStatusFields({ ativo, favorito, disabled, onAtivoChange, onFavoritoChange }: Props) {
    return (
        <div className="divide-y rounded-md border">
            <label htmlFor="produto_ativo" className="flex min-h-14 cursor-pointer items-center gap-3 px-3 py-2">
                <Checkbox id="produto_ativo" checked={ativo} onCheckedChange={(checked) => onAtivoChange(checked === true)} disabled={disabled} />
                <span className="grid gap-0.5">
                    <span className="text-sm font-medium">Produto ativo</span>
                    <span className="text-muted-foreground text-xs">Disponível para venda.</span>
                </span>
            </label>
            <label htmlFor="produto_favorito" className="flex min-h-14 cursor-pointer items-center gap-3 px-3 py-2">
                <Checkbox
                    id="produto_favorito"
                    checked={favorito}
                    onCheckedChange={(checked) => onFavoritoChange(checked === true)}
                    disabled={disabled}
                />
                <span className="grid gap-0.5">
                    <span className="flex items-center gap-1 text-sm font-medium">
                        Favorito na venda
                        <Star className={`h-3.5 w-3.5 ${favorito ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`} aria-hidden="true" />
                    </span>
                    <span className="text-muted-foreground text-xs">Aparece como atalho no topo da Nova Venda.</span>
                </span>
            </label>
        </div>
    );
}
