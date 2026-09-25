import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

export type QuickCadastroKind = 'produto' | 'funcionario';

type CreatedProduto = { id: number; nome: string; preco_compra: number | string };
type CreatedFuncionario = { id: number; nome: string; salario: number | string };

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kind: QuickCadastroKind;
    onCreated?: (item: CreatedProduto | CreatedFuncionario) => void;
};

export default function QuickCadastroSheet({ open, onOpenChange, kind, onCreated }: Props) {
    const [nome, setNome] = useState('');
    const [valor, setValor] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            setNome('');
            setValor('');
            setErrors({});
            setProcessing(false);
        }
    }, [open, kind]);

    const isProduto = kind === 'produto';
    const title = isProduto ? 'Cadastrar Produto' : 'Cadastrar Funcionário';
    const description = isProduto
        ? 'Informe o nome e o preço de compra.'
        : 'Informe o nome e o salário.';
    const valorLabel = isProduto ? 'Preço de Compra' : 'Salário / Remuneração';
    const valorKey = isProduto ? 'preco_compra' : 'salario';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const url = isProduto ? route('produtos.store') : route('funcionarios.store');
        const payload = isProduto
            ? { nome, preco_compra: valor }
            : { nome, salario: valor };

        router.post(url, payload, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                setProcessing(false);
                const flash = (page.props as any)?.flash;
                const criado = isProduto ? flash?.produto_criado : flash?.funcionario_criado;
                if (criado && onCreated) {
                    onCreated(criado);
                }
                onOpenChange(false);
            },
            onError: (err) => {
                setProcessing(false);
                const mapped: Record<string, string> = {};
                Object.entries(err).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? String(v[0]) : String(v);
                });
                setErrors(mapped);
            },
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="flex h-[50dvh] max-h-[50dvh] flex-col gap-0 rounded-t-2xl p-0 md:hidden"
            >
                <SheetHeader className="shrink-0 border-b border-sidebar-border/70 px-4 py-4 text-left">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>
                <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="quick-nome">Nome</Label>
                            <Input
                                id="quick-nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder={isProduto ? 'Nome do produto' : 'Nome do funcionário'}
                                disabled={processing}
                                autoFocus
                            />
                            <InputError message={errors.nome} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quick-valor">{valorLabel}</Label>
                            <Input
                                id="quick-valor"
                                type="number"
                                min={0.01}
                                step="0.01"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                placeholder="0.00"
                                disabled={processing}
                            />
                            <InputError message={errors[valorKey]} />
                        </div>
                    </div>
                    <SheetFooter className="shrink-0 border-t border-sidebar-border/70 px-4 py-3">
                        <Button type="submit" variant="primary" className="w-full" loading={processing}>
                            Salvar
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
