import { MobileFab } from '@/components/padrões';
import { File, Package, UserRound, Wallet } from 'lucide-react';

type Props = {
    onNovoLancamento: () => void;
    onCadastrarFuncionario: () => void;
    onCadastrarProduto: () => void;
    onGerarPdf?: () => void;
};

export default function ExtratoFab2({ onNovoLancamento, onCadastrarFuncionario, onCadastrarProduto, onGerarPdf }: Props) {
    return (
        <MobileFab
            actions={[
                {
                    key: 'lancamento',
                    label: '+ Novo Lançamento',
                    icon: <Wallet className="h-4 w-4" />,
                    className: 'bg-emerald-500 text-white hover:bg-emerald-600',
                    onClick: onNovoLancamento,
                },
                {
                    key: 'funcionario',
                    label: '+ Cadastrar Funcionário',
                    icon: <UserRound className="h-4 w-4" />,
                    className: 'bg-sky-500 text-white hover:bg-sky-600',
                    onClick: onCadastrarFuncionario,
                },
                {
                    key: 'produto',
                    label: '+ Cadastrar Produto',
                    icon: <Package className="h-4 w-4" />,
                    className: 'bg-amber-500 text-white hover:bg-amber-600',
                    onClick: onCadastrarProduto,
                },
                {
                    key: 'pdf',
                    label: 'Gerar PDF',
                    icon: <File className="h-4 w-4" />,
                    onClick: onGerarPdf ?? (() => {}),
                },
            ]}
        />
    );
}
