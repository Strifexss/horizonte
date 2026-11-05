import { Switch } from '@/components/ui/switch';
import { Star } from 'lucide-react';

type Props = {
    ativo: boolean;
    favorito: boolean;
    disabled: boolean;
    /** Produto novo já nasce ativo: o interruptor só aparece na edição. */
    mostrarAtivo: boolean;
    onAtivoChange: (ativo: boolean) => void;
    onFavoritoChange: (favorito: boolean) => void;
};

/** Ativo e Favorito como interruptores; a linha inteira é tocável. */
export default function ProdutoStatusFields({ ativo, favorito, disabled, mostrarAtivo, onAtivoChange, onFavoritoChange }: Props) {
    return (
        <div className="divide-y rounded-md border">
            {mostrarAtivo ? (
                <label htmlFor="produto_ativo" className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-3 py-2 md:min-h-14">
                    <span className="grid gap-0.5">
                        <span className="text-sm font-medium">Produto ativo</span>
                        <span className="text-muted-foreground text-xs max-md:hidden">Disponível para venda.</span>
                    </span>
                    <Switch id="produto_ativo" checked={ativo} onCheckedChange={onAtivoChange} disabled={disabled} />
                </label>
            ) : null}
            <label htmlFor="produto_favorito" className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-3 py-2 md:min-h-14">
                <span className="grid gap-0.5">
                    <span className="flex items-center gap-1 text-sm font-medium">
                        Favorito na venda
                        <Star className={`h-3.5 w-3.5 ${favorito ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'}`} aria-hidden="true" />
                    </span>
                    <span className="text-muted-foreground text-xs max-md:hidden">Aparece como atalho no topo da Nova Venda.</span>
                </span>
                <Switch id="produto_favorito" checked={favorito} onCheckedChange={onFavoritoChange} disabled={disabled} />
            </label>
        </div>
    );
}
