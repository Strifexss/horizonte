import InputError from '@/components/input-error';
import type { ConfiguracaoPagina, GrupoDoBoard, OrdenacaoProdutos, ProdutoDoBoard } from '@/components/menu-boards/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info } from 'lucide-react';

type Props = {
    idBase: string;
    configuracao: ConfiguracaoPagina;
    grupos: GrupoDoBoard[];
    produtos: ProdutoDoBoard[];
    erro?: string;
    onConfig: (campos: Partial<ConfiguracaoPagina>) => void;
    children?: React.ReactNode;
};

const ORDENACOES: { id: OrdenacaoProdutos; nome: string }[] = [
    { id: 'nome', nome: 'Nome (A–Z)' },
    { id: 'menor_preco', nome: 'Menor preço primeiro' },
    { id: 'maior_preco', nome: 'Maior preço primeiro' },
];

/**
 * Grupo e ordem dos produtos que entram sozinhos na página.
 */
export default function MenuBoardsFonteGrupo({ idBase, configuracao, grupos, produtos, erro, onConfig, children }: Props) {
    const grupo = grupos.find((item) => item.id === configuracao.grupo_id);
    const quantidade = grupo ? produtos.filter((produto) => produto.grupo_id === grupo.id).length : 0;

    return (
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex flex-wrap gap-4">
                <div className="grid min-w-0 flex-[1_1_200px] gap-2">
                    <Label htmlFor={`${idBase}-grupo`}>Grupo</Label>
                    <Select
                        value={configuracao.grupo_id ? String(configuracao.grupo_id) : ''}
                        onValueChange={(valor) => onConfig({ grupo_id: Number(valor) })}
                    >
                        <SelectTrigger id={`${idBase}-grupo`} className="h-11 md:h-10">
                            <SelectValue placeholder={grupos.length ? 'Escolha um grupo' : 'Nenhum grupo com produtos ativos'} />
                        </SelectTrigger>
                        <SelectContent>
                            {grupos.map((item) => (
                                <SelectItem key={item.id} value={String(item.id)}>
                                    {item.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={erro} />
                </div>
                <div className="grid min-w-0 flex-[1_1_200px] gap-2">
                    <Label htmlFor={`${idBase}-ordem`}>Ordem</Label>
                    <Select value={configuracao.ordenacao ?? 'nome'} onValueChange={(valor) => onConfig({ ordenacao: valor as OrdenacaoProdutos })}>
                        <SelectTrigger id={`${idBase}-ordem`} className="h-11 md:h-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ORDENACOES.map((ordenacao) => (
                                <SelectItem key={ordenacao.id} value={ordenacao.id}>
                                    {ordenacao.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {children}
            {grupo ? (
                <p className="flex gap-2.5 rounded-lg bg-sky-50 p-3 text-[13px] text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
                    <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    <span>
                        <strong>
                            {quantidade} {quantidade === 1 ? 'produto ativo' : 'produtos ativos'}
                        </strong>{' '}
                        de {grupo.nome} entram sozinhos. Produto novo, desativado ou com preço alterado já reflete na TV no próximo Sync, sem editar o
                        board.
                    </span>
                </p>
            ) : null}
        </div>
    );
}
