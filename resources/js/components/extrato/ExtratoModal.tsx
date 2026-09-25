import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import ProdutosModal from '@/components/produtos/ProdutosModal';
import FuncionariosModal from '@/components/funcionarios/FuncionariosModal';

type Option = {
    id: number | string;
    nome: string;
    preco_compra?: number | string;
    salario?: number | string;
    padrao?: number | null;
};

export type ExtratoModalMode = 'create' | 'edit';

export type ExtratoModalParcela = {
    id?: number | string | null;
    descricao?: string | null;
    data_vencimento?: string | null;
    valor?: number | string | null;
    valor_pago?: number | string | null;
    qtd_parcelas?: number | string | null;
    tipo?: string | null;
    categoria?: { id: number | string; nome: string; padrao?: number | null } | null;
    categoria_id?: number | string | null;
    produto?: { id: number | string; nome: string; preco_compra?: number | string } | null;
    produto_id?: number | string | null;
    funcionario?: { id: number | string; nome: string; salario?: number | string } | null;
    funcionario_id?: number | string | null;
    conta?: { id: number | string; nome: string } | null;
    conta_id?: number | string | null;
    financeiro?: {
        tipo?: string | null;
    } | null;
};

function hojeISO(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

function toInputValue(v: number | string | null | undefined): string {
    if (v === null || v === undefined) return '';
    return String(v);
}

function isCategoriaProduto(cat: Option | null | undefined): boolean {
    if (!cat) return false;
    return String(cat.nome).toUpperCase() === 'PRODUTO' && Number(cat.padrao ?? 0) === 1;
}

function isCategoriaSalario(cat: Option | null | undefined): boolean {
    if (!cat) return false;
    return String(cat.nome).toUpperCase() === 'SALÁRIO' && Number(cat.padrao ?? 0) === 1;
}

export default function ExtratoModal({
    open,
    onOpenChange,
    mode = 'create',
    parcela = null,
}: {
    open: boolean;
    onOpenChange: (b: boolean) => void;
    mode?: ExtratoModalMode;
    parcela?: ExtratoModalParcela | null;
}) {
    const initialTipo: 'RECEITA' | 'DESPESA' =
        String(parcela?.tipo ?? parcela?.financeiro?.tipo ?? 'DESPESA').toUpperCase() === 'RECEITA'
            ? 'RECEITA'
            : 'DESPESA';

    const [activeTab, setActiveTab] = useState<'RECEITA' | 'DESPESA'>(initialTipo);
    const [selectedConta, setSelectedConta] = useState<Option | null>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<Option | null>(null);
    const [selectedProduto, setSelectedProduto] = useState<Option | null>(null);
    const [selectedFuncionario, setSelectedFuncionario] = useState<Option | null>(null);
    const [produtosModalOpen, setProdutosModalOpen] = useState(false);
    const [funcionariosModalOpen, setFuncionariosModalOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        descricao: toInputValue(parcela?.descricao),
        data_vencimento: toInputValue(parcela?.data_vencimento) || hojeISO(),
        valor: toInputValue(parcela?.valor),
        valor_pago: toInputValue(parcela?.valor_pago),
        qtd_parcelas: Number(parcela?.qtd_parcelas ?? 1),
        tipo: initialTipo,
        id: parcela?.id ?? null,
        categoria_id: (parcela?.categoria_id ?? null) as number | null,
        produto_id: (parcela?.produto_id ?? null) as number | null,
        funcionario_id: (parcela?.funcionario_id ?? null) as number | null,
        conta_id: (parcela?.conta_id ?? null) as number | null,
    });

    const showProdutoField = isCategoriaProduto(selectedCategoria);
    const showFuncionarioField = isCategoriaSalario(selectedCategoria);

    const applyProdutoPadrao = async () => {
        const categorias = await loadCategorias('');
        const produtoCat = (categorias as Option[]).find(
            (c) => String(c.nome).toUpperCase() === 'PRODUTO' && Number(c.padrao ?? 0) === 1,
        );
        if (produtoCat) {
            setSelectedCategoria(produtoCat);
            setData('categoria_id', Number(produtoCat.id));
        }
    };

    useEffect(() => {
        setData('tipo', activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (!open) return;

        const isEdit = mode === 'edit' && parcela;
        const tipoFromParcela = String(parcela?.tipo ?? parcela?.financeiro?.tipo ?? 'DESPESA').toUpperCase();
        const initialTab: 'RECEITA' | 'DESPESA' = tipoFromParcela === 'RECEITA' ? 'RECEITA' : 'DESPESA';

        const contaId = (parcela?.conta_id ?? parcela?.conta?.id ?? null) as number | string | null;
        const categoriaId = (parcela?.categoria_id ?? parcela?.categoria?.id ?? null) as number | string | null;
        const produtoId = (parcela?.produto_id ?? parcela?.produto?.id ?? null) as number | string | null;
        const funcionarioId = (parcela?.funcionario_id ?? parcela?.funcionario?.id ?? null) as number | string | null;
        const contaNome = parcela?.conta?.nome ?? null;
        const categoriaNome = parcela?.categoria?.nome ?? null;
        const produtoNome = parcela?.produto?.nome ?? null;
        const funcionarioNome = parcela?.funcionario?.nome ?? null;

        setActiveTab(initialTab);
        setSelectedConta(contaId ? { id: contaId, nome: contaNome ?? String(contaId) } : null);
        setSelectedCategoria(
            categoriaId
                ? {
                      id: categoriaId,
                      nome: categoriaNome ?? String(categoriaId),
                      padrao: parcela?.categoria?.padrao ?? null,
                  }
                : null,
        );
        setSelectedProduto(
            produtoId
                ? {
                      id: produtoId,
                      nome: produtoNome ?? String(produtoId),
                      preco_compra: parcela?.produto?.preco_compra,
                  }
                : null,
        );
        setSelectedFuncionario(
            funcionarioId
                ? {
                      id: funcionarioId,
                      nome: funcionarioNome ?? String(funcionarioId),
                      salario: parcela?.funcionario?.salario,
                  }
                : null,
        );

        if (isEdit) {
            setData({
                descricao: toInputValue(parcela?.descricao),
                data_vencimento: toInputValue(parcela?.data_vencimento) || hojeISO(),
                valor: toInputValue(parcela?.valor),
                valor_pago: toInputValue(parcela?.valor_pago),
                qtd_parcelas: Number(parcela?.qtd_parcelas ?? 1),
                tipo: initialTab,
                categoria_id: categoriaId ? Number(categoriaId) : null,
                produto_id: produtoId ? Number(produtoId) : null,
                funcionario_id: funcionarioId ? Number(funcionarioId) : null,
                conta_id: contaId ? Number(contaId) : null,
                id: parcela?.id ?? null,
            });
        } else {
            reset();
            clearErrors();
            setData('data_vencimento', hojeISO());
            setData('qtd_parcelas', 1);
            setData('tipo', initialTab);
            setData('produto_id', null);
            setData('funcionario_id', null);
            setSelectedProduto(null);
            setSelectedFuncionario(null);
            if (initialTab === 'DESPESA') {
                void applyProdutoPadrao();
            }
        }
    }, [open, mode, parcela?.id]);

    useEffect(() => {
        if (!open || mode === 'edit') return;
        if (activeTab === 'DESPESA') {
            void applyProdutoPadrao();
        } else {
            setSelectedCategoria(null);
            setData('categoria_id', null);
            setSelectedProduto(null);
            setData('produto_id', null);
            setSelectedFuncionario(null);
            setData('funcionario_id', null);
        }
    }, [activeTab]);

    const loadContas = async (q: string) => {
        const res = await fetch(`/contas/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        return res.json();
    };

    const loadCategorias = async (q: string = '') => {
        const tipo = activeTab.toLowerCase();
        const res = await fetch(`/categorias/autocomplete?q=${encodeURIComponent(q)}&tipo=${encodeURIComponent(tipo)}`);
        if (!res.ok) return [];
        return res.json();
    };

    const loadProdutos = async (q: string = '') => {
        const res = await fetch(`/produtos/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        return res.json();
    };

    const loadFuncionarios = async (q: string = '') => {
        const res = await fetch(`/funcionarios/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        return res.json();
    };

    const handleCategoriaChange = (val: Option | null) => {
        setSelectedCategoria(val);
        setData('categoria_id', val ? Number(val.id) : null);

        if (!isCategoriaProduto(val)) {
            setSelectedProduto(null);
            setData('produto_id', null);
        }

        if (!isCategoriaSalario(val)) {
            setSelectedFuncionario(null);
            setData('funcionario_id', null);
        }
    };

    const handleProdutoChange = (val: Option | null) => {
        setSelectedProduto(val);
        if (val) {
            const preco = val.preco_compra !== undefined && val.preco_compra !== null ? String(val.preco_compra) : null;
            setData('produto_id', Number(val.id));
            setData('funcionario_id', null);
            setSelectedFuncionario(null);
            setData('descricao', 'Compra');
            if (preco !== null) {
                setData('valor', preco);
                setData('valor_pago', preco);
            }
        } else {
            setData('produto_id', null);
        }
    };

    const handleFuncionarioChange = (val: Option | null) => {
        setSelectedFuncionario(val);
        if (val) {
            const salario = val.salario !== undefined && val.salario !== null ? String(val.salario) : null;
            setData('funcionario_id', Number(val.id));
            setData('produto_id', null);
            setSelectedProduto(null);
            setData('descricao', `Salário - ${val.nome}`);
            if (salario !== null) {
                setData('valor', salario);
                setData('valor_pago', salario);
            }
        } else {
            setData('funcionario_id', null);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const isEdit = mode === 'edit' && parcela?.id;
        const url = isEdit ? route('parcela.update', { id: parcela.id }) : route('extrato.store');
        const submitMethod = isEdit ? put : post;

        submitMethod(url as any, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="md:h-auto md:w-[700px] max-w-full overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{mode === 'edit' ? 'Editar lançamento' : 'Adicionar lançamento'}</DialogTitle>
                        <DialogDescription>
                            {mode === 'edit'
                                ? 'Atualize os dados do lançamento de receita ou despesa.'
                                : 'Crie um novo lançamento de receita ou despesa.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col md:h-full">
                        <div className="flex gap-2">
                            <button
                                disabled={!!parcela}
                                type="button"
                                className={`rounded-md px-3 py-1 cursor-pointer ${activeTab === 'RECEITA' ? 'bg-primary text-primary-foreground' : 'bg-muted/5'}`}
                                onClick={() => setActiveTab('RECEITA')}
                            >
                                Receita
                            </button>
                            <button
                                type="button"
                                disabled={!!parcela}
                                className={`rounded-md px-3 py-1 cursor-pointer ${activeTab === 'DESPESA' ? 'bg-primary text-primary-foreground' : 'bg-muted/5'}`}
                                onClick={() => setActiveTab('DESPESA')}
                            >
                                Despesa
                            </button>
                        </div>

                        <div className="mt-4 rounded-lg border border-sidebar-border/70 bg-white dark:bg-slate-900 p-4 shadow-sm">
                            <form onSubmit={submit} className="grid gap-2">
                                <Input type="hidden" name="id" />

                                {showProdutoField && (
                                    <div className="grid gap-2">
                                        <Label>Produto</Label>
                                        <div className="flex items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <AsyncSelect
                                                    value={selectedProduto}
                                                    onChange={handleProdutoChange}
                                                    loadOptions={loadProdutos}
                                                    placeholder="Buscar produto..."
                                                    isClearable
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="shrink-0"
                                                aria-label="Cadastrar produto"
                                                onClick={() => setProdutosModalOpen(true)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <InputError message={errors.produto_id} />
                                    </div>
                                )}

                                {showFuncionarioField && (
                                    <div className="grid gap-2">
                                        <Label>Funcionário</Label>
                                        <div className="flex items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <AsyncSelect
                                                    value={selectedFuncionario}
                                                    onChange={handleFuncionarioChange}
                                                    loadOptions={loadFuncionarios}
                                                    placeholder="Buscar funcionário..."
                                                    isClearable
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="shrink-0"
                                                aria-label="Cadastrar funcionário"
                                                onClick={() => setFuncionariosModalOpen(true)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <InputError message={errors.funcionario_id} />
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="descricao">Descrição</Label>
                                        <Input
                                            id="descricao"
                                            value={data.descricao}
                                            onChange={(e) => setData('descricao', e.target.value)}
                                            placeholder="Descrição do lançamento"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.descricao} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="data_vencimento">Data de vencimento</Label>
                                        <Input
                                            id="data_vencimento"
                                            type="date"
                                            value={data.data_vencimento}
                                            onChange={(e) => setData('data_vencimento', e.target.value)}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.data_vencimento} />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-2">
                                    <div className="grid gap-2">
                                        <Label>Conta</Label>
                                        <AsyncSelect
                                            value={selectedConta}
                                            onChange={(val) => {
                                                setSelectedConta(val);
                                                setData('conta_id', val ? Number(val.id) : null);
                                            }}
                                            loadOptions={loadContas}
                                            placeholder="Selecione a conta..."
                                            isClearable={false}
                                        />
                                        <InputError message={errors.conta_id} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Categoria</Label>
                                        <AsyncSelect
                                            key={`categoria-${activeTab}`}
                                            value={selectedCategoria}
                                            onChange={handleCategoriaChange}
                                            loadOptions={loadCategorias}
                                            placeholder="Selecione a categoria (opcional)"
                                            isClearable
                                        />
                                        <InputError message={errors.categoria_id} />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="valor">Valor</Label>
                                        <Input
                                            id="valor"
                                            value={data.valor}
                                            onChange={(e) => {
                                                const valor = e.target.value;
                                                setData({
                                                    ...data,
                                                    valor,
                                                    valor_pago: valor,
                                                });
                                            }}
                                            placeholder="0.00"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.valor} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="valor_pago">Valor pago</Label>
                                        <Input
                                            id="valor_pago"
                                            value={data.valor_pago}
                                            onChange={(e) => setData('valor_pago', e.target.value)}
                                            placeholder="0.00"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.valor_pago} />
                                    </div>
                                </div>
                                {!parcela && (
                                    <div className="grid md:grid-cols-2 gap-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="qtd_parcelas">Quantidade de parcelas</Label>
                                            <Input
                                                id="qtd_parcelas"
                                                type="number"
                                                min={1}
                                                step={1}
                                                value={data.qtd_parcelas}
                                                onChange={(e) => setData('qtd_parcelas', Number(e.target.value))}
                                                disabled={processing}
                                            />
                                            <InputError message={errors.qtd_parcelas} />
                                        </div>
                                    </div>
                                )}
                                <DialogFooter className="flex flex-row gap-2 mt-4">
                                    <DialogClose asChild>
                                        <Button
                                            className="w-full"
                                            variant="secondary"
                                            type="button"
                                            onClick={() => {
                                                reset();
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" className="ml-2 w-full" loading={processing} variant="confirm">
                                        {mode === 'edit' ? 'Salvar alterações' : 'Adicionar'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ProdutosModal
                open={produtosModalOpen}
                onOpenChange={setProdutosModalOpen}
                onCreated={(produto) => {
                    handleProdutoChange({
                        id: produto.id,
                        nome: produto.nome,
                        preco_compra: produto.preco_compra,
                    });
                }}
            />
            <FuncionariosModal
                open={funcionariosModalOpen}
                onOpenChange={setFuncionariosModalOpen}
                onCreated={(funcionario) => {
                    handleFuncionarioChange({
                        id: funcionario.id,
                        nome: funcionario.nome,
                        salario: funcionario.salario,
                    });
                }}
            />
        </>
    );
}
