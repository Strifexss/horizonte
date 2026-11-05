import FornecedoresModal from '@/components/fornecedores/FornecedoresModal';
import GruposModal from '@/components/grupos/GruposModal';
import InputError from '@/components/input-error';
import ProdutoPrecosFields from '@/components/produtos/ProdutoPrecosFields';
import ProdutoStatusFields from '@/components/produtos/ProdutoStatusFields';
import type { ProdutoItem, ProdutoNamed } from '@/components/produtos/types';
import AsyncSelect from '@/components/ui/AsyncSelect';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { FormDialogBody, FormDialogCancel, FormDialogContent, FormDialogFooter, FormDialogForm, FormDialogHeader } from '@/components/ui/form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { ChevronRight, Info, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

type Mode = 'create' | 'edit';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: Mode;
    produto: ProdutoItem | null;
};

type ProdutoFormValues = {
    nome: string;
    codigo: string;
    preco_compra: string;
    preco_venda: string;
    ativo: boolean;
    favorito: boolean;
    fornecedor_id: number | null;
    grupo_id: number | null;
    descricao: string;
};

type SelectOption = {
    id: number | string;
    nome: string;
};

function toNamed(option: { id: number | string; nome: string } | null | undefined): ProdutoNamed | null {
    if (!option) {
        return null;
    }

    return { id: option.id, nome: option.nome };
}

export default function ProdutosForm({ open, onOpenChange, mode, produto }: Props) {
    const [selectedFornecedor, setSelectedFornecedor] = useState<ProdutoNamed | null>(null);
    const [selectedGrupo, setSelectedGrupo] = useState<ProdutoNamed | null>(null);
    const [fornecedoresModalOpen, setFornecedoresModalOpen] = useState(false);
    const [gruposModalOpen, setGruposModalOpen] = useState(false);
    const [detalhesAbertos, setDetalhesAbertos] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<ProdutoFormValues>({
        nome: '',
        codigo: '',
        preco_compra: '',
        preco_venda: '',
        ativo: true,
        favorito: false,
        fornecedor_id: null,
        grupo_id: null,
        descricao: '',
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        clearErrors();
        setDetalhesAbertos(false);

        if (mode === 'edit' && produto) {
            setData({
                nome: produto.nome,
                codigo: produto.codigo ?? '',
                preco_compra: produto.preco_compra,
                preco_venda: produto.preco_venda,
                ativo: produto.ativo,
                favorito: produto.favorito,
                fornecedor_id: produto.fornecedor_id,
                grupo_id: produto.grupo_id,
                descricao: produto.descricao ?? '',
            });
            setSelectedFornecedor(toNamed(produto.fornecedor));
            setSelectedGrupo(toNamed(produto.grupo));
            return;
        }

        reset();
        setData({
            nome: '',
            codigo: '',
            preco_compra: '',
            preco_venda: '',
            ativo: true,
            favorito: false,
            fornecedor_id: null,
            grupo_id: null,
            descricao: '',
        });
        setSelectedFornecedor(null);
        setSelectedGrupo(null);
        // setData/reset/clearErrors vêm do useForm e são estáveis o bastante para este reset de abertura.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, produto]);

    const detalhesPreenchidos = Boolean(data.codigo || data.descricao || data.fornecedor_id || data.grupo_id);
    const detalhesComErro = Boolean(errors.codigo || errors.descricao || errors.fornecedor_id || errors.grupo_id);
    const detalhesVisiveis = detalhesAbertos || detalhesComErro || (mode === 'edit' && detalhesPreenchidos);

    const loadFornecedores = async (q: string = ''): Promise<SelectOption[]> => {
        const res = await fetch(`/fornecedores/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
            return [];
        }

        return res.json();
    };

    const loadGrupos = async (q: string = ''): Promise<SelectOption[]> => {
        const res = await fetch(`/grupos/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
            return [];
        }

        return res.json();
    };

    const submit = (event: React.FormEvent): void => {
        event.preventDefault();

        const options = {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        };

        if (mode === 'edit' && produto) {
            put(route('produtos.update', produto.id), options);
            return;
        }

        post(route('produtos.store'), options);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <FormDialogContent>
                    <FormDialogHeader
                        title={mode === 'edit' ? 'Editar produto' : 'Cadastrar produto'}
                        description={mode === 'edit' ? 'Atualize os dados do produto.' : 'Preencha os dados para cadastrar um novo produto.'}
                        hideDescriptionOnMobile
                    />

                    <FormDialogForm onSubmit={submit} noValidate>
                        <FormDialogBody className="gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="produto_nome">Nome</Label>
                                <Input
                                    id="produto_nome"
                                    value={data.nome}
                                    onChange={(e) => setData('nome', e.target.value)}
                                    placeholder="Nome do produto"
                                    enterKeyHint="next"
                                    disabled={processing}
                                />
                                <InputError message={errors.nome} />
                            </div>

                            <ProdutoPrecosFields
                                precoVenda={data.preco_venda}
                                precoCompra={data.preco_compra}
                                disabled={processing}
                                errors={errors}
                                onPrecoVendaChange={(valor) => setData('preco_venda', valor)}
                                onPrecoCompraChange={(valor) => setData('preco_compra', valor)}
                            />

                            {/* No celular os campos opcionais ficam recolhidos; no desktop aparecem sempre. */}
                            <button
                                type="button"
                                onClick={() => setDetalhesAbertos((aberto) => !aberto)}
                                aria-expanded={detalhesVisiveis}
                                aria-controls="produto_detalhes"
                                className="text-muted-foreground hover:text-foreground flex min-h-11 items-center gap-2 text-sm font-medium md:hidden"
                            >
                                <ChevronRight className={cn('size-4 transition-transform', detalhesVisiveis && 'rotate-90')} aria-hidden="true" />
                                {detalhesVisiveis ? 'Menos detalhes' : 'Mais detalhes (código, descrição, grupo…)'}
                            </button>

                            <div id="produto_detalhes" className={cn('grid gap-5', !detalhesVisiveis && 'max-md:hidden')}>
                                <div className="grid gap-5 md:grid-cols-2 md:gap-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="produto_codigo">Código</Label>
                                        <Input
                                            id="produto_codigo"
                                            value={data.codigo}
                                            onChange={(e) => setData('codigo', e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            placeholder="Automático ou EAN"
                                            title="Em branco gera o próximo número. Aceita EAN e leitor de código de barras."
                                            maxLength={50}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.codigo} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="produto_descricao" className="flex items-center gap-1">
                                            Descrição
                                            <Info className="text-muted-foreground size-3.5" aria-hidden="true" />
                                            <span className="sr-only">(aparece no Menu Board da TV)</span>
                                        </Label>
                                        <Input
                                            id="produto_descricao"
                                            value={data.descricao}
                                            onChange={(e) => setData('descricao', e.target.value)}
                                            placeholder="Aparece no Menu Board da TV"
                                            maxLength={160}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.descricao} />
                                    </div>
                                </div>

                                <div className="grid gap-2 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="produto_fornecedor">Fornecedor</Label>
                                        <div className="flex items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <AsyncSelect
                                                    value={selectedFornecedor}
                                                    onChange={(val) => {
                                                        setSelectedFornecedor(val ? { id: val.id, nome: val.nome } : null);
                                                        setData('fornecedor_id', val ? Number(val.id) : null);
                                                    }}
                                                    loadOptions={loadFornecedores}
                                                    placeholder="Buscar fornecedor..."
                                                    label="Fornecedor"
                                                    inputId="produto_fornecedor"
                                                    isClearable
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="shrink-0"
                                                aria-label="Cadastrar fornecedor"
                                                title="Cadastrar fornecedor"
                                                onClick={() => setFornecedoresModalOpen(true)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <InputError message={errors.fornecedor_id} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="produto_grupo">Grupo</Label>
                                        <div className="flex items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <AsyncSelect
                                                    value={selectedGrupo}
                                                    onChange={(val) => {
                                                        setSelectedGrupo(val ? { id: val.id, nome: val.nome } : null);
                                                        setData('grupo_id', val ? Number(val.id) : null);
                                                    }}
                                                    loadOptions={loadGrupos}
                                                    placeholder="Buscar grupo..."
                                                    label="Grupo"
                                                    inputId="produto_grupo"
                                                    isClearable
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="shrink-0"
                                                aria-label="Cadastrar grupo"
                                                title="Cadastrar grupo"
                                                onClick={() => setGruposModalOpen(true)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <InputError message={errors.grupo_id} />
                                    </div>
                                </div>
                            </div>

                            <ProdutoStatusFields
                                ativo={data.ativo}
                                favorito={data.favorito}
                                disabled={processing}
                                onAtivoChange={(ativo) => setData('ativo', ativo)}
                                onFavoritoChange={(favorito) => setData('favorito', favorito)}
                            />
                            <InputError message={errors.ativo} />
                        </FormDialogBody>

                        <FormDialogFooter>
                            <FormDialogCancel className="w-full" disabled={processing} />
                            <Button className="h-11 w-full md:h-10" type="submit" variant="confirm" disabled={processing}>
                                Salvar
                            </Button>
                        </FormDialogFooter>
                    </FormDialogForm>
                </FormDialogContent>
            </Dialog>

            <FornecedoresModal
                open={fornecedoresModalOpen}
                onOpenChange={setFornecedoresModalOpen}
                onCreated={(fornecedor) => {
                    setData('fornecedor_id', fornecedor.id);
                    setSelectedFornecedor({ id: fornecedor.id, nome: fornecedor.nome });
                }}
            />
            <GruposModal
                open={gruposModalOpen}
                onOpenChange={setGruposModalOpen}
                onCreated={(grupo) => {
                    setData('grupo_id', grupo.id);
                    setSelectedGrupo({ id: grupo.id, nome: grupo.nome });
                }}
            />
        </>
    );
}
