import { formatarPreco, type ProdutoDoBoard } from '@/components/menu-boards/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
    id: string;
    produtos: ProdutoDoBoard[];
    valor?: number | null;
    placeholder: string;
    disabled?: boolean;
    onEscolher: (produtoId: number) => void;
};

/**
 * Lista suspensa de produtos ativos do usuário, com o preço ao lado do nome.
 */
export default function MenuBoardsSeletorProduto({ id, produtos, valor, placeholder, disabled = false, onEscolher }: Props) {
    return (
        <Select
            value={valor ? String(valor) : ''}
            onValueChange={(escolhido) => onEscolher(Number(escolhido))}
            disabled={disabled || produtos.length === 0}
        >
            <SelectTrigger id={id} className="h-11 md:h-10">
                <SelectValue placeholder={produtos.length ? placeholder : 'Nenhum produto disponível'} />
            </SelectTrigger>
            <SelectContent>
                {produtos.map((produto) => (
                    <SelectItem key={produto.id} value={String(produto.id)}>
                        {produto.nome} · {formatarPreco(produto.preco_venda)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
