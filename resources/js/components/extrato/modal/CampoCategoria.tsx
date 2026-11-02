import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { carregarCategorias } from './buscaOpcoes';
import { LinhaSelectComCadastro, PainelCadastroRapido } from './CadastroRapido';
import { rotuloTipo } from './lancamentoValores';
import type { TipoLancamento } from './types';
import type { CadastroInline } from './useCadastroInline';
import type { LancamentoSelecoes } from './useLancamentoSelecoes';

type Props = {
    selecoes: LancamentoSelecoes;
    cadastro: CadastroInline;
    tipo: TipoLancamento;
    disabled: boolean;
    error?: string;
};

export default function CampoCategoria({ selecoes, cadastro, tipo, disabled, error }: Props) {
    const { rascunhoCategoria: rascunho } = selecoes;

    return (
        <div className="grid gap-2">
            <Label>
                Categoria <span className="text-red-500">*</span>
            </Label>
            <LinhaSelectComCadastro rotuloCadastrar="Cadastrar categoria" onCadastrar={selecoes.iniciarCadastroCategoria} disabled={disabled}>
                <AsyncSelect
                    key={`categoria-${tipo}`}
                    creatable
                    value={selecoes.categoriaSelecionada}
                    onChange={selecoes.alterarCategoria}
                    loadOptions={(q) => carregarCategorias(q, tipo)}
                    placeholder="Selecione a categoria"
                    isClearable
                    isDisabled={disabled}
                    formatCreateLabel={(input) => `+ Cadastrar categoria de ${rotuloTipo(tipo)} "${input}"`}
                />
            </LinhaSelectComCadastro>
            {rascunho.nome !== null ? (
                <PainelCadastroRapido
                    className="grid gap-2 rounded-md border border-dashed border-violet-300 bg-violet-50/60 p-3 dark:border-violet-800 dark:bg-violet-950/30"
                    rotuloCriar="Criar categoria"
                    criando={cadastro.criandoInline}
                    criarDesabilitado={!rascunho.nome.trim()}
                    onCancelar={selecoes.cancelarCadastroCategoria}
                    onCriar={cadastro.confirmarCategoriaInline}
                >
                    <div className="grid gap-2">
                        <Label htmlFor="draft_categoria_nome">Nome da categoria</Label>
                        <Input
                            ref={rascunho.nomeRef}
                            id="draft_categoria_nome"
                            value={rascunho.nome}
                            onChange={(e) => selecoes.alterarNomeRascunhoCategoria(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    cadastro.confirmarCategoriaInline();
                                }
                            }}
                            placeholder={`Categoria de ${rotuloTipo(tipo)}`}
                        />
                        <p className="text-muted-foreground text-xs">Será cadastrada como categoria de {rotuloTipo(tipo)}.</p>
                    </div>
                </PainelCadastroRapido>
            ) : null}
            <InputError message={error} />
        </div>
    );
}
