import { router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FORM_DIALOG_LIST, FORM_DIALOG_PANEL, FormDialogBody, FormDialogContent, FormDialogHeader } from '@/components/ui/form-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MoneyInput, { parseMoneyValue } from '@/components/ui/money-input';
import { Plus } from 'lucide-react';
import GruposModal from '../grupos/GruposModal';
import ProdutoRow from './ProdutoRow';

type Produto = {
    id: number | string;
    nome: string;
    preco_compra: number | string;
    fornecedor_id?: number | string | null;
    grupo_id?: number | string | null;
    fornecedor?: NamedOption | null;
    grupo?: NamedOption | null;
};

type ProdutoCriado = {
    id: number;
    nome: string;
    preco_compra: number | string;
};

type NamedOption = {
    id: number | string;
    nome: string;
};

type ProdutosPageProps = {
    produtos?: Produto[];
    fornecedores?: NamedOption[];
};

type ProdutoForm = {
    nome: string;
    preco_compra: string;
    fornecedor_id: number | null;
    grupo_id: number | null;
};

export default function ProdutosModal({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (b: boolean) => void;
    onCreated?: (produto: ProdutoCriado) => void;
}) {
    const [loading, setLoading] = useState(false);
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [selectedFornecedor, setSelectedFornecedor] = useState<NamedOption | null>(null);
    const page = usePage<ProdutosPageProps>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [produtoToDelete, setProdutoToDelete] = useState<Produto | null>(null);
    const [gruposModalOpen, setGruposModalOpen] = useState(false);
    const [selectedGrupo, setSelectedGrupo] = useState<NamedOption | null>(null);
    const [editingId, setEditingId] = useState<number | string | null>(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<ProdutoForm>({
        nome: '',
        preco_compra: '',
        fornecedor_id: null,
        grupo_id: null,
    });

    useEffect(() => {
        const p = page.props?.produtos;
        if (!p) {
            setProdutos([]);
            return;
        }
        setProdutos(Array.isArray(p) ? p : p);
    }, [page.props?.produtos]);

    useEffect(() => {
        const f = page.props?.fornecedores;
        if (!f) {
            return;
        }
    }, [page.props?.fornecedores]);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        router.reload({
            only: ['produtos'],
            onFinish: () => setLoading(false),
        });
        reset();
        clearErrors();
        setEditingId(null);
        setSelectedFornecedor(null);
        setSelectedGrupo(null);
    }, [open]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('produtos.update', editingId), {
                onSuccess: () => {
                    router.reload({ only: ['produtos'] });
                    reset();
                    setEditingId(null);
                    setSelectedFornecedor(null);
                    setSelectedGrupo(null);
                },
            });
        } else {
            post(route('produtos.store'), {
                onSuccess: (pageResult) => {
                    router.reload({ only: ['produtos'] });
                    reset();
                    setSelectedFornecedor(null);
                    setSelectedGrupo(null);
                    const flash = pageResult.props.flash as { produto_criado?: ProdutoCriado } | undefined;
                    const criado = flash?.produto_criado;
                    if (criado && onCreated) {
                        onCreated(criado);
                        onOpenChange(false);
                    }
                },
            });
        }
    };

    const startEdit = (produto: Produto) => {
        setEditingId(produto.id);
        setData('nome', produto.nome);
        setData(
            'preco_compra',
            (() => {
                const parsed = parseMoneyValue(produto.preco_compra);
                return parsed === null ? '' : parsed.toFixed(2);
            })(),
        );
        setData('fornecedor_id', produto.fornecedor_id == null ? null : Number(produto.fornecedor_id));
        const f = produto.fornecedor;
        setSelectedFornecedor(f ? { id: f.id, nome: f.nome } : null);
        const g = produto.grupo;
        const grupoId = produto.grupo_id ?? g?.id;
        setData('grupo_id', grupoId == null ? null : Number(grupoId));
        setSelectedGrupo(g ? { id: g.id, nome: g.nome } : null);
    };

    const loadFornecedores = async (q: string = ''): Promise<NamedOption[]> => {
        const res = await fetch(`/fornecedores/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        const payload = (await res.json()) as unknown;
        return Array.isArray(payload) ? (payload as NamedOption[]) : [];
    };

    const doDelete = (produto: Produto) => {
        setProdutoToDelete(produto);
        setConfirmOpen(true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <FormDialogContent>
                    <FormDialogHeader title="Produtos" description="Gerencie os produtos vinculados às despesas." />
                    <FormDialogBody>
                        <div className={FORM_DIALOG_PANEL}>
                            <form onSubmit={submit} noValidate className="grid gap-2">
                                <div className="grid gap-2 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="produto_nome">Nome do Produto</Label>
                                        <Input
                                            id="produto_nome"
                                            value={data.nome}
                                            onChange={(e) => setData('nome', e.target.value)}
                                            placeholder="Nome do produto"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.nome} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="preco_compra">Preço de Compra</Label>
                                        <MoneyInput
                                            id="preco_compra"
                                            value={data.preco_compra ? Number(data.preco_compra) : null}
                                            onValueChange={(v) => setData('preco_compra', v === null ? '' : v.toFixed(2))}
                                            placeholder="0,00"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.preco_compra} />
                                    </div>
                                    <div className="grid gap-2 md:col-span-2 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label>Fornecedor</Label>
                                            <AsyncSelect
                                                value={selectedFornecedor}
                                                onChange={(val) => {
                                                    setSelectedFornecedor(val ? { id: val.id, nome: val.nome } : null);
                                                    setData('fornecedor_id', val ? Number(val.id) : null);
                                                }}
                                                loadOptions={loadFornecedores}
                                                placeholder="Buscar fornecedor..."
                                                isClearable
                                            />
                                            <InputError message={errors.fornecedor_id} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Grupo</Label>
                                            <div className="flex items-start gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <AsyncSelect
                                                        value={selectedGrupo}
                                                        onChange={(val) => {
                                                            setSelectedGrupo(val ? { id: val.id, nome: val.nome } : null);
                                                            setData('grupo_id', val ? Number(val.id) : null);
                                                        }}
                                                        loadOptions={async (q: string = '') => {
                                                            const res = await fetch(`/grupos?q=${encodeURIComponent(q)}`);
                                                            if (!res.ok) return [];
                                                            const payload = (await res.json()) as unknown;
                                                            if (typeof payload !== 'object' || payload === null) return [];
                                                            const grupos = (payload as { grupos?: unknown }).grupos;
                                                            return Array.isArray(grupos) ? (grupos as NamedOption[]) : [];
                                                        }}
                                                        placeholder="Buscar grupo..."
                                                        isClearable
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="icon"
                                                    className="shrink-0"
                                                    onClick={() => setGruposModalOpen(true)}
                                                    aria-label="Cadastrar grupo"
                                                    title="Cadastrar grupo"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <InputError message={errors.grupo_id} />
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="flex flex-row gap-2">
                                    <DialogClose asChild>
                                        <Button
                                            className="hidden w-full md:inline-flex"
                                            variant="secondary"
                                            type="button"
                                            onClick={() => {
                                                reset();
                                                setEditingId(null);
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" className="w-full" disabled={processing} variant="confirm">
                                        {editingId ? 'Atualizar' : 'Adicionar'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>

                        <div className={FORM_DIALOG_LIST}>
                            {loading ? (
                                <div>Carregando...</div>
                            ) : (
                                <div className="grid gap-2">
                                    {produtos.map((p) => (
                                        <ProdutoRow key={p.id} produto={p} onEdit={() => startEdit(p)} onDelete={() => doDelete(p)} />
                                    ))}
                                    {produtos.length === 0 && <div className="text-muted-foreground text-sm">Nenhum produto encontrado.</div>}
                                </div>
                            )}
                        </div>
                    </FormDialogBody>
                </FormDialogContent>
            </Dialog>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>
                            O produto &quot;{produtoToDelete?.nome ?? ''}&quot; será excluído somente se nunca tiver sido usado em lançamentos. Caso
                            já tenha sido usado, a exclusão será bloqueada e você poderá inativá-lo. Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            className="ml-2"
                            onClick={() => {
                                if (!produtoToDelete) return;
                                destroy(route('produtos.destroy', produtoToDelete.id), {
                                    onSuccess: () => {
                                        setConfirmOpen(false);
                                        setProdutoToDelete(null);
                                        router.reload({ only: ['produtos'] });
                                    },
                                });
                            }}
                        >
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
