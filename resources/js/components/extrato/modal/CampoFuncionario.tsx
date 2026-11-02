import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MoneyInput from '@/components/ui/money-input';
import { carregarFuncionarios } from './buscaOpcoes';
import { LinhaSelectComCadastro, PainelCadastroRapido } from './CadastroRapido';
import type { CadastroInline } from './useCadastroInline';
import type { LancamentoSelecoes } from './useLancamentoSelecoes';

type Props = {
    selecoes: LancamentoSelecoes;
    cadastro: CadastroInline;
    error?: string;
};

export default function CampoFuncionario({ selecoes, cadastro, error }: Props) {
    const { rascunhoFuncionario: rascunho } = selecoes;

    return (
        <div className="grid gap-2">
            <Label>Funcionário</Label>
            <LinhaSelectComCadastro rotuloCadastrar="Cadastrar funcionário" onCadastrar={selecoes.iniciarCadastroFuncionario}>
                <AsyncSelect
                    creatable
                    value={selecoes.funcionarioSelecionado}
                    onChange={selecoes.alterarFuncionario}
                    loadOptions={carregarFuncionarios}
                    placeholder="Buscar funcionário..."
                    isClearable
                />
            </LinhaSelectComCadastro>
            {rascunho.nome !== null ? (
                <PainelCadastroRapido
                    className="grid gap-2 rounded-md border border-dashed border-sky-300 bg-sky-50/60 p-3 dark:border-sky-800 dark:bg-sky-950/30"
                    rotuloCriar="Criar funcionário"
                    criando={cadastro.criandoInline}
                    criarDesabilitado={!rascunho.nome.trim() || !rascunho.valor}
                    onCancelar={selecoes.cancelarCadastroFuncionario}
                    onCriar={cadastro.confirmarFuncionarioInline}
                >
                    <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="draft_funcionario_nome">Nome do funcionário</Label>
                            <Input
                                ref={rascunho.nomeRef}
                                id="draft_funcionario_nome"
                                value={rascunho.nome}
                                onChange={(e) => selecoes.alterarNomeRascunhoFuncionario(e.target.value)}
                                placeholder="Nome do funcionário"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="draft_salario">Salário / Remuneração</Label>
                            <MoneyInput
                                ref={rascunho.valorRef}
                                id="draft_salario"
                                value={rascunho.valor ? Number(rascunho.valor) : null}
                                onValueChange={(v) => rascunho.setValor(v !== null ? String(v) : '')}
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                </PainelCadastroRapido>
            ) : null}
            <InputError message={error} />
        </div>
    );
}
