import InputError from '@/components/input-error';
import FornecedoresModal from '@/components/fornecedores/FornecedoresModal';
import GruposModal from '@/components/grupos/GruposModal';
import type { ProdutoItem, ProdutoNamed } from '@/components/produtos/types';
import AsyncSelect from '@/components/ui/AsyncSelect';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MoneyInput from '@/components/ui/money-input';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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
    preco_compra: string;
    preco_venda: string;
    ativo: boolean;
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

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<ProdutoFormValues>({
        nome: '',
        preco_compra: '',
        preco_venda: '',
        ativo: true,
        fornecedor_id: null,
        grupo_id: null,
        descricao: '',
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        clearErrors();

        if (mode === 'edit' && produto) {
            setData({
                nome: produto.nome,
                preco_compra: produto.preco_compra,
                preco_venda: produto.preco_venda,
                ativo: produto.ativo,
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
            preco_compra: '',
            preco_venda: '',
            ativo: true,
            fornecedor_id: null,
            grupo_id: null,
            descricao: '',
        });
        setSelectedFornecedor(null);
        setSelectedGrupo(null);
        // setData/reset/clearErrors vêm do useForm e são estáveis o bastante para este reset de abertura.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, produto]);

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
                <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:w-[700px] md:max-w-full">
                    <DialogHeader>
                        <DialogTitle>{mode === 'edit' ? 'Editar produto' : 'Cadastrar produto'}</DialogTitle>
                        <DialogDescription>
                            {mode === 'edit' ? 'Atualize os dados do produto.' : 'Preencha os dados para cadastrar um novo produto.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="flex h-full flex-col gap-4 overflow-y-auto" noValidate>
                        <div className="grid gap-2">
                            <Label htmlFor="produto_nome">Nome</Label>
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
                            <Label htmlFor="produto_descricao">Descrição</Label>
                            <Input
                                id="produto_descricao"
                                value={data.descricao}
                                onChange={(e) => setData('descricao', e.target.value)}
                                placeholder="Ex.: Arroz, fritas e salada"
                                maxLength={160}
                                disabled={processing}
                            />
                            <span className="text-xs text-muted-foreground">Aparece no Menu Board da TV.</span>
                            <InputError message={errors.descricao} />
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="produto_preco_compra">Preço de compra</Label>
                                <MoneyInput
                                    id="produto_preco_compra"
                                    value={data.preco_compra ? Number(data.preco_compra) : null}
                                    onValueChange={(value) => setData('preco_compra', value === null ? '' : value.toFixed(2))}
                                    placeholder="0,00"
                                    disabled={processing}
                                />
                                <InputError message={errors.preco_compra} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="produto_preco_venda">Preço de venda</Label>
                                <MoneyInput
                                    id="produto_preco_venda"
                                    value={data.preco_venda ? Number(data.preco_venda) : null}
                                    onValueChange={(value) => setData('preco_venda', value === null ? '' : value.toFixed(2))}
                                    placeholder="0,00"
                                    disabled={processing}
                                />
                                <InputError message={errors.preco_venda} />
                            </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>Fornecedor</Label>
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
                                <Label>Grupo</Label>
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

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="produto_ativo"
                                checked={data.ativo}
                                onCheckedChange={(checked) => setData('ativo', checked === true)}
                                disabled={processing}
                            />
                            <Label htmlFor="produto_ativo">Produto ativo</Label>
                        </div>
                        <InputError message={errors.ativo} />

                        <DialogFooter className="flex flex-row gap-2">
                            <DialogClose asChild>
                                <Button className="w-full" variant="secondary" type="button" disabled={processing}>
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button className="w-full" type="submit" variant="confirm" disabled={processing}>
                                Salvar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
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
