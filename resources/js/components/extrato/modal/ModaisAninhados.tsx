import FornecedoresModal from '@/components/fornecedores/FornecedoresModal';
import FuncionariosModal from '@/components/funcionarios/FuncionariosModal';
import GruposModal from '@/components/grupos/GruposModal';
import ProdutosModal from '@/components/produtos/ProdutosModal';
import { useState } from 'react';
import type { ExtratoOpcao } from './types';

type Props = {
    onProdutoCriado: (produto: ExtratoOpcao) => void;
    onFuncionarioCriado: (funcionario: ExtratoOpcao) => void;
};

/** Modais de cadastro (Produtos, Funcionários, Fornecedores, Grupos) montados junto do lançamento. */
export default function ModaisAninhados({ onProdutoCriado, onFuncionarioCriado }: Props) {
    const [produtosOpen, setProdutosOpen] = useState(false);
    const [funcionariosOpen, setFuncionariosOpen] = useState(false);
    const [fornecedoresOpen, setFornecedoresOpen] = useState(false);
    const [gruposOpen, setGruposOpen] = useState(false);

    return (
        <>
            <ProdutosModal
                open={produtosOpen}
                onOpenChange={setProdutosOpen}
                onCreated={(produto) => {
                    onProdutoCriado({
                        id: produto.id,
                        nome: produto.nome,
                        preco_compra: produto.preco_compra,
                    });
                }}
            />
            <FuncionariosModal
                open={funcionariosOpen}
                onOpenChange={setFuncionariosOpen}
                onCreated={(funcionario) => {
                    onFuncionarioCriado({
                        id: funcionario.id,
                        nome: funcionario.nome,
                        salario: funcionario.salario,
                    });
                }}
            />
            <FornecedoresModal open={fornecedoresOpen} onOpenChange={setFornecedoresOpen} />
            <GruposModal open={gruposOpen} onOpenChange={setGruposOpen} />
        </>
    );
}
