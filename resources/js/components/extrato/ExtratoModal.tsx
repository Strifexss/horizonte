import React, { useEffect, useRef, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
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
import MoneyInput, { parseMoneyValue } from '@/components/ui/money-input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import ProdutosModal from '@/components/produtos/ProdutosModal';
import FuncionariosModal from '@/components/funcionarios/FuncionariosModal';
import FornecedoresModal from '@/components/fornecedores/FornecedoresModal';

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
    data_competencia?: string | null;
    valor?: number | string | null;
    valor_pago?: number | string | null;
    qtd_parcelas?: number | string | null;
    tipo?: string | null;
    categoria?: { id: number | string; nome: string; padrao?: number | null } | null;
    categoria_id?: number | string | null;
    produto?: {
        id: number | string;
        nome: string;
        preco_compra?: number | string;
        fornecedor?: { id: number | string; nome?: string | null } | null;
        fornecedor_id?: number | string | null;
    } | null;
    produto_id?: number | string | null;
    fornecedor?: { id: number | string; nome?: string | null } | null;
    fornecedor_id?: number | string | null;
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

function toMoneyFormValue(input: unknown): string {
    const parsed = parseMoneyValue(input);
    if (parsed !== null) {
        return parsed.toFixed(2);
    }
    if (input === null || input === undefined) {
        return '';
    }
    return String(input);
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
    categoriasPadrao,
}: {
    open: boolean;
    onOpenChange: (b: boolean) => void;
    mode?: ExtratoModalMode;
    parcela?: ExtratoModalParcela | null;
    categoriasPadrao?: { receita?: Option | null; despesa?: Option | null };
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
    const [fornecedoresModalOpen, setFornecedoresModalOpen] = useState(false);
    const [selectedFornecedor, setSelectedFornecedor] = useState<Option | null>(null);
    const produtoSelectRef = useRef<{ focus: () => void } | null>(null);
    const draftProdutoNomeRef = useRef<HTMLInputElement | null>(null);
    const draftProdutoPrecoRef = useRef<HTMLInputElement | null>(null);
    const draftFuncionarioNomeRef = useRef<HTMLInputElement | null>(null);
    const draftFuncionarioSalarioRef = useRef<HTMLInputElement | null>(null);
    const draftCategoriaNomeRef = useRef<HTMLInputElement | null>(null);
    const draftFornecedorNomeRef = useRef<HTMLInputElement | null>(null);
    const [draftProdutoNome, setDraftProdutoNome] = useState<string | null>(null);
    const [draftProdutoPreco, setDraftProdutoPreco] = useState('');
    const [draftFuncionarioNome, setDraftFuncionarioNome] = useState<string | null>(null);
    const [draftFuncionarioSalario, setDraftFuncionarioSalario] = useState('');
    const [draftCategoriaNome, setDraftCategoriaNome] = useState<string | null>(null);
    const [draftFornecedorNome, setDraftFornecedorNome] = useState<string | null>(null);
    const [draftProdutoFocus, setDraftProdutoFocus] = useState<'nome' | 'preco' | null>(null);
    const [draftFuncionarioFocus, setDraftFuncionarioFocus] = useState<'nome' | 'salario' | null>(null);
    const [draftCategoriaFocus, setDraftCategoriaFocus] = useState<'nome' | null>(null);
    const [draftFornecedorFocus, setDraftFornecedorFocus] = useState<'nome' | null>(null);
    const [creatingInline, setCreatingInline] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm({
        descricao: toInputValue(parcela?.descricao),
        data_competencia: toInputValue(parcela?.data_competencia) || hojeISO(),
        valor: toInputValue(parcela?.valor),
        valor_pago: toInputValue(parcela?.valor_pago),
        tipo: initialTipo,
        id: parcela?.id ?? null,
        categoria_id: (parcela?.categoria_id ?? null) as number | null,
        produto_id: (parcela?.produto_id ?? null) as number | null,
        fornecedor_id: (parcela?.fornecedor_id ?? null) as number | null,
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

    const applyReceitaPadrao = () => {
        const receitaCat = categoriasPadrao?.receita ?? null;
        if (receitaCat) {
            setSelectedCategoria(receitaCat);
            setData('categoria_id', Number(receitaCat.id));
        }
    };

    const applyContaPadrao = async () => {
        const contas = await loadContas('');
        const contaPadrao = (contas as Option[]).find((c) => Number(c.padrao ?? 0) === 1);
        if (contaPadrao) {
            setSelectedConta(contaPadrao);
            setData('conta_id', Number(contaPadrao.id));
        }
    };

    useEffect(() => {
        setData('tipo', activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (!draftProdutoFocus || draftProdutoNome === null) {
            return;
        }

        const timer = window.setTimeout(() => {
            const el =
                draftProdutoFocus === 'preco' ? draftProdutoPrecoRef.current : draftProdutoNomeRef.current;
            el?.focus();
            el?.select?.();
            setDraftProdutoFocus(null);
        }, 50);

        return () => window.clearTimeout(timer);
    }, [draftProdutoFocus, draftProdutoNome]);

    useEffect(() => {
        if (!draftFuncionarioFocus || draftFuncionarioNome === null) {
            return;
        }

        const timer = window.setTimeout(() => {
            const el =
                draftFuncionarioFocus === 'salario'
                    ? draftFuncionarioSalarioRef.current
                    : draftFuncionarioNomeRef.current;
            el?.focus();
            el?.select?.();
            setDraftFuncionarioFocus(null);
        }, 50);

        return () => window.clearTimeout(timer);
    }, [draftFuncionarioFocus, draftFuncionarioNome]);

    useEffect(() => {
        if (!draftCategoriaFocus || draftCategoriaNome === null) {
            return;
        }

        const timer = window.setTimeout(() => {
            draftCategoriaNomeRef.current?.focus();
            draftCategoriaNomeRef.current?.select?.();
            setDraftCategoriaFocus(null);
        }, 50);

        return () => window.clearTimeout(timer);
    }, [draftCategoriaFocus, draftCategoriaNome]);

    useEffect(() => {
        if (!draftFornecedorFocus || draftFornecedorNome === null) {
            return;
        }

        const timer = window.setTimeout(() => {
            draftFornecedorNomeRef.current?.focus();
            draftFornecedorNomeRef.current?.select?.();
            setDraftFornecedorFocus(null);
        }, 50);

        return () => window.clearTimeout(timer);
    }, [draftFornecedorFocus, draftFornecedorNome]);

    useEffect(() => {
        if (!open) return;

        const isEdit = mode === 'edit' && parcela;
        const tipoFromParcela = String(parcela?.tipo ?? parcela?.financeiro?.tipo ?? 'DESPESA').toUpperCase();
        const initialTab: 'RECEITA' | 'DESPESA' = tipoFromParcela === 'RECEITA' ? 'RECEITA' : 'DESPESA';

        const contaId = (parcela?.conta_id ?? parcela?.conta?.id ?? null) as number | string | null;
        const categoriaId = (parcela?.categoria_id ?? parcela?.categoria?.id ?? null) as number | string | null;
        const produtoId = (parcela?.produto_id ?? parcela?.produto?.id ?? null) as number | string | null;
        const funcionarioId = (parcela?.funcionario_id ?? parcela?.funcionario?.id ?? null) as number | string | null;
        const fornecedorId = (parcela?.fornecedor_id ?? parcela?.produto?.fornecedor?.id ?? null) as number | string | null;
        const contaNome = parcela?.conta?.nome ?? null;
        const categoriaNome = parcela?.categoria?.nome ?? null;
        const produtoNome = parcela?.produto?.nome ?? null;
        const funcionarioNome = parcela?.funcionario?.nome ?? null;
        const fornecedorNome = parcela?.fornecedor?.nome ?? parcela?.produto?.fornecedor?.nome ?? null;

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
        setSelectedFornecedor(fornecedorId ? { id: fornecedorId, nome: fornecedorNome ?? String(fornecedorId) } : null);
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
                data_competencia: toInputValue(parcela?.data_competencia) || hojeISO(),
                valor: toMoneyFormValue(parcela?.valor),
                valor_pago: toMoneyFormValue(parcela?.valor_pago),
                tipo: initialTab,
                categoria_id: categoriaId ? Number(categoriaId) : null,
                produto_id: produtoId ? Number(produtoId) : null,
                fornecedor_id: fornecedorId ? Number(fornecedorId) : null,
                funcionario_id: funcionarioId ? Number(funcionarioId) : null,
                conta_id: contaId ? Number(contaId) : null,
                id: parcela?.id ?? null,
            });
        } else {
            reset();
            clearErrors();
            setData('data_competencia', hojeISO());
            setData('tipo', initialTab);
            setData('produto_id', null);
            setData('funcionario_id', null);
            setSelectedProduto(null);
            setSelectedFuncionario(null);
            if (initialTab === 'DESPESA') {
                void applyProdutoPadrao();
            } else {
                void applyReceitaPadrao();
            }
            void applyContaPadrao();
        }
    }, [open, mode, parcela?.id]);

    useEffect(() => {
        if (!open || mode === 'edit') return;
        setDraftCategoriaNome(null);
        setDraftCategoriaFocus(null);
        if (activeTab === 'DESPESA') {
            void applyProdutoPadrao();
        } else {
            void applyReceitaPadrao();
            setSelectedProduto(null);
            setData('produto_id', null);
            setSelectedFuncionario(null);
            setData('funcionario_id', null);
        }
    }, [activeTab]);

    useEffect(() => {
        if (!open || !showProdutoField || activeTab !== 'DESPESA') {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            produtoSelectRef.current?.focus();
        }, 50);

        return () => window.clearTimeout(timeoutId);
    }, [open, showProdutoField, activeTab]);

    const loadContas = async (q: string = '') => {
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

    const loadFornecedores = async (q: string = '') => {
        const res = await fetch(`/fornecedores/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        return res.json();
    };

    const loadFuncionarios = async (q: string = '') => {
        const res = await fetch(`/funcionarios/autocomplete?q=${encodeURIComponent(q)}`);
        if (!res.ok) return [];
        return res.json();
    };

    const handleCategoriaChange = (val: Option | null) => {
        if (val && (val as Option & { __create?: boolean }).__create) {
            const nome = String((val as Option & { __createName?: string }).__createName ?? val.nome).trim();
            setDraftCategoriaNome(nome);
            setSelectedCategoria({ id: '__draft__', nome });
            setData('categoria_id', null);
            setDraftCategoriaFocus('nome');
            return;
        }

        setDraftCategoriaNome(null);
        setDraftCategoriaFocus(null);
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
        if (val && (val as Option & { __create?: boolean }).__create) {
            const nome = String((val as Option & { __createName?: string }).__createName ?? val.nome).trim();
            setDraftProdutoNome(nome);
            setDraftProdutoPreco('');
            setSelectedProduto({ id: '__draft__', nome });
            setData('produto_id', null);
            setData('descricao', 'Compra');
            setDraftProdutoFocus('preco');
            return;
        }

        setDraftProdutoNome(null);
        setDraftProdutoPreco('');
        setDraftProdutoFocus(null);
        setSelectedProduto(val);
        if (val) {
            const preco = val.preco_compra !== undefined && val.preco_compra !== null ? String(val.preco_compra) : null;
            setData('produto_id', Number(val.id));
            setData('funcionario_id', null);
            setSelectedFuncionario(null);
            setDraftFuncionarioNome(null);
            setData('descricao', 'Compra');
            if (preco !== null) {
                const valor = toMoneyFormValue(preco);
                setData('valor', valor);
                setData('valor_pago', valor);
            }
            // if product has fornecedor, prefill (prefer full fornecedor object; fallback to fornecedor_id with readable name)
            let fornecedor: Option | null = null;
            const prodForne = (val as any).fornecedor;
            const prodForneId = (val as any).fornecedor_id ?? (val as any).fornecedorId ?? null;
            if (prodForne) {
                fornecedor = { id: prodForne.id, nome: prodForne.nome ?? String(prodForne.id) };
            } else if (prodForneId) {
                fornecedor = { id: prodForneId, nome: String(prodForneId) };
            }
            if (fornecedor && fornecedor.id) {
                setSelectedFornecedor(fornecedor);
                setData('fornecedor_id', Number(fornecedor.id));
            } else {
                setSelectedFornecedor(null);
                setData('fornecedor_id', null);
            }
        } else {
            setData('produto_id', null);
        }
    };

    const handleFornecedorChange = (val: Option | null) => {
        if (val && (val as Option & { __create?: boolean }).__create) {
            const nome = String((val as Option & { __createName?: string }).__createName ?? val.nome).trim();
            setDraftFornecedorNome(nome);
            setSelectedFornecedor({ id: '__draft__', nome });
            setData('fornecedor_id', null);
            setDraftFornecedorFocus('nome');
            return;
        }

        setSelectedFornecedor(val);
        setData('fornecedor_id', val ? Number(val.id) : null);
    };

    const handleFuncionarioChange = (val: Option | null) => {
        if (val && (val as Option & { __create?: boolean }).__create) {
            const nome = String((val as Option & { __createName?: string }).__createName ?? val.nome).trim();
            setDraftFuncionarioNome(nome);
            setDraftFuncionarioSalario('');
            setSelectedFuncionario({ id: '__draft__', nome });
            setData('funcionario_id', null);
            setData('descricao', `Salário - ${nome}`);
            setDraftFuncionarioFocus('salario');
            return;
        }

        setDraftFuncionarioNome(null);
        setDraftFuncionarioSalario('');
        setDraftFuncionarioFocus(null);
        setSelectedFuncionario(val);
        if (val) {
            const salario = val.salario !== undefined && val.salario !== null ? String(val.salario) : null;
            setData('funcionario_id', Number(val.id));
            setData('produto_id', null);
            setSelectedProduto(null);
            setDraftProdutoNome(null);
            setData('descricao', `Salário - ${val.nome}`);
            if (salario !== null) {
                const valor = toMoneyFormValue(salario);
                setData('valor', valor);
                setData('valor_pago', valor);
            }
        } else {
            setData('funcionario_id', null);
        }
    };

    const confirmarProdutoInline = () => {
        const nome = draftProdutoNome?.trim();
        if (!nome || !draftProdutoPreco) {
            return;
        }
        setCreatingInline(true);
        router.post(
            route('produtos.store'),
            { nome, preco_compra: draftProdutoPreco },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    setCreatingInline(false);
                    const criado = (page.props as any)?.flash?.produto_criado;
                    if (criado) {
                        setDraftProdutoNome(null);
                        setDraftProdutoPreco('');
                        handleProdutoChange({
                            id: criado.id,
                            nome: criado.nome,
                            preco_compra: criado.preco_compra,
                        });
                    }
                },
                onError: () => setCreatingInline(false),
            },
        );
    };

    const confirmarFuncionarioInline = () => {
        const nome = draftFuncionarioNome?.trim();
        if (!nome || !draftFuncionarioSalario) {
            return;
        }
        setCreatingInline(true);
        router.post(
            route('funcionarios.store'),
            { nome, salario: draftFuncionarioSalario },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    setCreatingInline(false);
                    const criado = (page.props as any)?.flash?.funcionario_criado;
                    if (criado) {
                        setDraftFuncionarioNome(null);
                        setDraftFuncionarioSalario('');
                        handleFuncionarioChange({
                            id: criado.id,
                            nome: criado.nome,
                            salario: criado.salario,
                        });
                    }
                },
                onError: () => setCreatingInline(false),
            },
        );
    };

    const confirmarFornecedorInline = () => {
        const nome = draftFornecedorNome?.trim() ?? null;
        if (!nome) return;
        setCreatingInline(true);
        router.post(
            route('fornecedores.store'),
            { nome },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    setCreatingInline(false);
                    // Sempre limpar o rascunho ao receber sucesso,
                    // mesmo que o flash não venha por algum motivo.
                    setDraftFornecedorNome(null);
                    setDraftFornecedorFocus(null);
                    const criado = (page.props as any)?.flash?.fornecedor_criado;
                    if (criado) {
                        handleFornecedorChange({
                            id: criado.id,
                            nome: criado.nome,
                        } as Option);
                    }
                },
                onError: () => setCreatingInline(false),
            },
        );
    };

    const confirmarCategoriaInline = () => {
        const nome = draftCategoriaNome?.trim();
        if (!nome) {
            return;
        }
        setCreatingInline(true);
        router.post(
            route('categorias.store'),
            { nome, tipo: activeTab.toLowerCase(), padrao: 0 },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    setCreatingInline(false);
                    const criado = (page.props as any)?.flash?.categoria_criada;
                    if (criado) {
                        setDraftCategoriaNome(null);
                        handleCategoriaChange({
                            id: criado.id,
                            nome: criado.nome,
                            padrao: criado.padrao ?? 0,
                        });
                    }
                },
                onError: () => setCreatingInline(false),
            },
        );
    };

    const iniciarCadastroCategoria = () => {
        setSelectedCategoria(null);
        setData('categoria_id', null);
        setDraftCategoriaNome('');
        setDraftCategoriaFocus('nome');
    };

    const cancelarCadastroCategoria = () => {
        setDraftCategoriaNome(null);
        setDraftCategoriaFocus(null);
        setSelectedCategoria(null);
        setData('categoria_id', null);
    };

    const iniciarCadastroProduto = () => {
        setDraftFuncionarioNome(null);
        setDraftFuncionarioSalario('');
        setDraftFuncionarioFocus(null);
        setSelectedFuncionario(null);
        setData('funcionario_id', null);
        setSelectedProduto(null);
        setData('produto_id', null);
        setDraftProdutoNome('');
        setDraftProdutoPreco('');
        setDraftProdutoFocus('nome');
        setData('descricao', 'Compra');
    };

    const iniciarCadastroFuncionario = () => {
        setDraftProdutoNome(null);
        setDraftProdutoPreco('');
        setDraftProdutoFocus(null);
        setSelectedProduto(null);
        setData('produto_id', null);
        setSelectedFuncionario(null);
        setData('funcionario_id', null);
        setDraftFuncionarioNome('');
        setDraftFuncionarioSalario('');
        setDraftFuncionarioFocus('nome');
        setData('descricao', 'Salário');
    };

    const cancelarCadastroProduto = () => {
        setDraftProdutoNome(null);
        setDraftProdutoPreco('');
        setSelectedProduto(null);
        setData('produto_id', null);
    };

    const cancelarCadastroFuncionario = () => {
        setDraftFuncionarioNome(null);
        setDraftFuncionarioSalario('');
        setSelectedFuncionario(null);
        setData('funcionario_id', null);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const isEdit = mode === 'edit' && parcela?.id;
        const url = isEdit ? route('parcela.update', { id: parcela.id }) : route('extrato.store');
        const submitMethod = isEdit ? put : post;

        transform((current) => ({
            ...current,
            valor: toMoneyFormValue(current.valor),
            valor_pago: toMoneyFormValue(current.valor_pago),
            ...(isEdit
                ? {}
                : {
                      data_vencimento: current.data_competencia,
                      qtd_parcelas: 1,
                  }),
        }));

        submitMethod(url, {
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

                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:h-auto">
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
                            <form onSubmit={submit} noValidate className="grid gap-2">
                                <Input type="hidden" name="id" />

                                {showProdutoField && (
                                    <div className="grid gap-2">
                                        <Label>Produto</Label>
                                        <div className="flex items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <AsyncSelect
                                                    selectRef={produtoSelectRef}
                                                    autoFocus
                                                    creatable
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
                                                title="Cadastrar produto"
                                                onClick={iniciarCadastroProduto}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {draftProdutoNome !== null ? (
                                            <div className="grid gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                                                <div className="grid gap-2 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="draft_produto_nome">Nome do produto</Label>
                                                        <Input
                                                            ref={draftProdutoNomeRef}
                                                            id="draft_produto_nome"
                                                            value={draftProdutoNome}
                                                            onChange={(e) => {
                                                                setDraftProdutoNome(e.target.value);
                                                                setSelectedProduto(
                                                                    e.target.value
                                                                        ? { id: '__draft__', nome: e.target.value }
                                                                        : null,
                                                                );
                                                                setData('descricao', 'Compra');
                                                            }}
                                                            placeholder="Nome do produto"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="draft_preco_compra">Preço de Compra</Label>
                                                        <MoneyInput
                                                            ref={draftProdutoPrecoRef}
                                                            id="draft_preco_compra"
                                                            value={draftProdutoPreco ? Number(draftProdutoPreco) : null}
                                                            onValueChange={(v) => setDraftProdutoPreco(v !== null ? String(v) : '')}
                                                            placeholder="0,00"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        className="flex-1"
                                                        onClick={cancelarCadastroProduto}
                                                        disabled={creatingInline}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="confirm"
                                                        className="flex-1"
                                                        disabled={!draftProdutoNome.trim() || !draftProdutoPreco || creatingInline}
                                                        loading={creatingInline}
                                                        onClick={confirmarProdutoInline}
                                                    >
                                                        Criar produto
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : null}
                                        <InputError message={errors.produto_id} />
                                    </div>
                                )}

                                {showProdutoField && (
                                    <div className="grid gap-2">
                                        <Label>Fornecedor</Label>
                                        <div className="flex items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <AsyncSelect
                                                    creatable
                                                    value={selectedFornecedor}
                                                    onChange={(val) => handleFornecedorChange(val)}
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
                                                onClick={() => {
                                                    setDraftFornecedorNome('');
                                                    setDraftFornecedorFocus('nome');
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {draftFornecedorNome !== null ? (
                                            <div className="grid gap-2 rounded-md border border-dashed border-emerald-300 bg-emerald-50/60 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="draft_fornecedor_nome">Nome do fornecedor</Label>
                                                    <Input
                                                        ref={draftFornecedorNomeRef}
                                                        id="draft_fornecedor_nome"
                                                        value={draftFornecedorNome}
                                                        onChange={(e) => {
                                                            setDraftFornecedorNome(e.target.value);
                                                            setSelectedFornecedor(
                                                                e.target.value
                                                                    ? { id: '__draft__', nome: e.target.value }
                                                                    : null,
                                                            );
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                confirmarFornecedorInline();
                                                            }
                                                        }}
                                                        placeholder="Nome do fornecedor"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        className="flex-1"
                                                        onClick={() => {
                                                            setDraftFornecedorNome(null);
                                                            setDraftFornecedorFocus(null);
                                                        }}
                                                        disabled={creatingInline}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="confirm"
                                                        className="flex-1"
                                                        disabled={!draftFornecedorNome?.trim() || creatingInline}
                                                        loading={creatingInline}
                                                        onClick={confirmarFornecedorInline}
                                                    >
                                                        Criar fornecedor
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : null}
                                        <InputError message={errors.fornecedor_id} />
                                    </div>
                                )}

                                {showFuncionarioField && (
                                    <div className="grid gap-2">
                                        <Label>Funcionário</Label>
                                        <div className="flex items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <AsyncSelect
                                                    creatable
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
                                                title="Cadastrar funcionário"
                                                onClick={iniciarCadastroFuncionario}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {draftFuncionarioNome !== null ? (
                                            <div className="grid gap-2 rounded-md border border-dashed border-sky-300 bg-sky-50/60 p-3 dark:border-sky-800 dark:bg-sky-950/30">
                                                <div className="grid gap-2 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="draft_funcionario_nome">Nome do funcionário</Label>
                                                        <Input
                                                            ref={draftFuncionarioNomeRef}
                                                            id="draft_funcionario_nome"
                                                            value={draftFuncionarioNome}
                                                            onChange={(e) => {
                                                                setDraftFuncionarioNome(e.target.value);
                                                                setSelectedFuncionario(
                                                                    e.target.value
                                                                        ? { id: '__draft__', nome: e.target.value }
                                                                        : null,
                                                                );
                                                                setData(
                                                                    'descricao',
                                                                    e.target.value ? `Salário - ${e.target.value}` : 'Salário',
                                                                );
                                                            }}
                                                            placeholder="Nome do funcionário"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="draft_salario">Salário / Remuneração</Label>
                                                        <MoneyInput
                                                            ref={draftFuncionarioSalarioRef}
                                                            id="draft_salario"
                                                            value={draftFuncionarioSalario ? Number(draftFuncionarioSalario) : null}
                                                            onValueChange={(v) => setDraftFuncionarioSalario(v !== null ? String(v) : '')}
                                                            placeholder="0,00"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        className="flex-1"
                                                        onClick={cancelarCadastroFuncionario}
                                                        disabled={creatingInline}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="confirm"
                                                        className="flex-1"
                                                        disabled={
                                                            !draftFuncionarioNome.trim() ||
                                                            !draftFuncionarioSalario ||
                                                            creatingInline
                                                        }
                                                        loading={creatingInline}
                                                        onClick={confirmarFuncionarioInline}
                                                    >
                                                        Criar funcionário
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : null}
                                        <InputError message={errors.funcionario_id} />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <div className="grid gap-2">
                                        <Label>Descrição <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="descricao"
                                            value={data.descricao}
                                            onChange={(e) => setData('descricao', e.target.value)}
                                            placeholder="Descrição do lançamento"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.descricao} />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-2">
                                    <div className="grid gap-2">
                                        <Label>Conta <span className="text-red-500">*</span></Label>
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
                                        <Label>Categoria <span className="text-red-500">*</span></Label>
                                        <div className="flex items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <AsyncSelect
                                                    key={`categoria-${activeTab}`}
                                                    creatable
                                                    value={selectedCategoria}
                                                    onChange={handleCategoriaChange}
                                                    loadOptions={loadCategorias}
                                                    placeholder="Selecione a categoria"
                                                    isClearable
                                                    formatCreateLabel={(input) =>
                                                        `+ Cadastrar categoria de ${activeTab === 'RECEITA' ? 'receita' : 'despesa'} "${input}"`
                                                    }
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="icon"
                                                className="shrink-0"
                                                aria-label="Cadastrar categoria"
                                                title="Cadastrar categoria"
                                                onClick={iniciarCadastroCategoria}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {draftCategoriaNome !== null ? (
                                            <div className="grid gap-2 rounded-md border border-dashed border-violet-300 bg-violet-50/60 p-3 dark:border-violet-800 dark:bg-violet-950/30">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="draft_categoria_nome">Nome da categoria</Label>
                                                    <Input
                                                        ref={draftCategoriaNomeRef}
                                                        id="draft_categoria_nome"
                                                        value={draftCategoriaNome}
                                                        onChange={(e) => {
                                                            setDraftCategoriaNome(e.target.value);
                                                            setSelectedCategoria(
                                                                e.target.value
                                                                    ? { id: '__draft__', nome: e.target.value }
                                                                    : null,
                                                            );
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                confirmarCategoriaInline();
                                                            }
                                                        }}
                                                        placeholder={`Categoria de ${activeTab === 'RECEITA' ? 'receita' : 'despesa'}`}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Será cadastrada como categoria de{' '}
                                                        {activeTab === 'RECEITA' ? 'receita' : 'despesa'}.
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        className="flex-1"
                                                        onClick={cancelarCadastroCategoria}
                                                        disabled={creatingInline}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="confirm"
                                                        className="flex-1"
                                                        disabled={!draftCategoriaNome.trim() || creatingInline}
                                                        loading={creatingInline}
                                                        onClick={confirmarCategoriaInline}
                                                    >
                                                        Criar categoria
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : null}
                                        <InputError message={errors.categoria_id} />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-2">
                                    <div className="grid gap-2">
                                        <Label>Valor <span className="text-red-500">*</span></Label>
                                        <MoneyInput
                                            id="valor"
                                            value={data.valor ? Number(data.valor as any) : null}
                                            onValueChange={(v) => {
                                                const valor = v === null ? '' : v.toFixed(2);
                                                setData({
                                                    ...data,
                                                    valor,
                                                    valor_pago: valor,
                                                });
                                            }}
                                            placeholder="0,00"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.valor} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="valor_pago">Valor pago</Label>
                                        <MoneyInput
                                            id="valor_pago"
                                            value={data.valor_pago ? Number(data.valor_pago as any) : null}
                                            onValueChange={(v) => setData('valor_pago', v === null ? '' : v.toFixed(2))}
                                            placeholder="0,00"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.valor_pago} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="data_competencia">Data <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="data_competencia"
                                            type="date"
                                            value={data.data_competencia}
                                            onChange={(e) => setData('data_competencia', e.target.value)}
                                            disabled={processing}
                                        />
                                        <InputError
                                            message={
                                                errors.data_competencia ||
                                                (errors as { data_vencimento?: string }).data_vencimento
                                            }
                                        />
                                    </div>
                                </div>
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
            <FornecedoresModal
                open={fornecedoresModalOpen}
                onOpenChange={setFornecedoresModalOpen}
                onCreated={(fornecedor) => {
                    // nothing to auto-select here; fornecedores are used in product modal
                }}
            />
        </>
    );
}
