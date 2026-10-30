import { type ProdutoDoBoard } from '@/components/menu-boards/types';
import AsyncSelect from '@/components/ui/AsyncSelect';

type Props = {
    id: string;
    produtos: ProdutoDoBoard[];
    valor?: number | null;
    placeholder: string;
    disabled?: boolean;
    onEscolher: (produtoId: number) => void;
};

async function buscarProdutos(q: string, permitidos: Map<number, ProdutoDoBoard>): Promise<ProdutoDoBoard[]> {
    const res = await fetch(`${route('produtos.autocomplete')}?q=${encodeURIComponent(q)}`);
    if (!res.ok) {
        return [];
    }

    const lista: { id: number; nome: string }[] = await res.json();

    return lista.flatMap((item) => {
        const produto = permitidos.get(item.id);

        return produto ? [produto] : [];
    });
}

/**
 * Autocomplete de produtos ativos do usuário, no mesmo padrão das demais telas.
 */
export default function MenuBoardsSeletorProduto({ id, produtos, valor, placeholder, disabled = false, onEscolher }: Props) {
    const porId = new Map(produtos.map((produto) => [produto.id, produto]));
    const selecionado = valor ? (porId.get(valor) ?? null) : null;

    return (
        <div id={id}>
            <AsyncSelect
                value={selecionado}
                onChange={(produto) => {
                    if (produto) {
                        onEscolher(Number(produto.id));
                    }
                }}
                loadOptions={(q) => buscarProdutos(q, porId)}
                placeholder={produtos.length ? placeholder : 'Nenhum produto disponível'}
                isClearable={false}
                isDisabled={disabled || produtos.length === 0}
            />
        </div>
    );
}
