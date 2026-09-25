import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Deferred } from '@inertiajs/react';
import React from 'react';
import { Plus } from 'lucide-react';
import { PageTitle } from '@/components/padrões';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import AccountsSkeleton from '@/components/contas/AccountsSkeleton';
import AccountsEmpty from '@/components/contas/AccountsEmpty';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contas e bancos',
        href: '/contas',
    },
];

type Account = {
    id: string;
    name: string;
    type: string;
    balance: number;
    initial?: string;
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function Contas({ contas = [] }: { contas?: Array<any> }) {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nome: '',
        descricao: '',
        padrao: false,
    });
    
    const [editOpen, setEditOpen] = React.useState(false);
    const [editingAccount, setEditingAccount] = React.useState<any | null>(null);
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [accountToDelete, setAccountToDelete] = React.useState<any | null>(null);

    const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        nome: '',
        descricao: '',
        padrao: false,
    });

    const { delete: destroy } = useForm({});

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        post('/contas', {
            onSuccess: () => {
                setOpen(false);
                reset('nome', 'descricao', 'padrao');
            },
        });
    };

    const openEdit = (acc: any) => {
        setEditingAccount(acc);
        setEditData('nome', acc.nome ?? acc.name ?? '');
        setEditData('descricao', acc.descricao ?? '');
        setEditData('padrao', Number(acc.padrao ?? 0) === 1);
        setEditOpen(true);
    };

    const submitEdit: React.FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingAccount) return;

        put(route('contas.update', editingAccount.id), {
            onSuccess: () => {
                setEditOpen(false);
                resetEdit();
                setEditingAccount(null);
            },
        });
    };

    const confirmDelete = (acc: any) => {
        setAccountToDelete(acc);
        setConfirmOpen(true);
    };

    const doDelete = () => {
        if (!accountToDelete) return;

        destroy(route('contas.destroy', accountToDelete.id), {
            onSuccess: () => {
                setConfirmOpen(false);
                setAccountToDelete(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contas e bancos" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <PageTitle
                    title="Contas e bancos"
                    subtitle="Tudo em um só lugar"
                    actions={
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="primary" size="default" className="inline-flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Adicionar conta
                                </Button>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Adicionar conta</DialogTitle>
                                    <DialogDescription>Preencha os dados para cadastrar uma nova conta.</DialogDescription>
                                </DialogHeader>

                                <form onSubmit={submit} className="grid gap-4 mt-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="nome">Nome</Label>
                                        <Input
                                            id="nome"
                                            value={data.nome}
                                            onChange={(e) => setData('nome', e.target.value)}
                                            placeholder="Ex: Conta corrente"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.nome} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="descricao">Descrição</Label>
                                        <Input
                                            id="descricao"
                                            value={data.descricao}
                                            onChange={(e) => setData('descricao', e.target.value)}
                                            placeholder="Opcional"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.descricao} />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="padrao"
                                            checked={!!data.padrao}
                                            onCheckedChange={(checked) => setData('padrao', checked === true)}
                                            disabled={processing}
                                        />
                                        <Label htmlFor="padrao">Definir como conta padrão</Label>
                                    </div>
                                    <InputError message={errors.padrao} />

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="secondary" type="button" disabled={processing}>
                                                Cancelar
                                            </Button>
                                        </DialogClose>
                                        <Button type="submit" className="ml-2" disabled={processing}>
                                            Salvar
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    }
                />

                {/* Edit dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar conta</DialogTitle>
                            <DialogDescription>Atualize os dados da conta.</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={submitEdit} className="grid gap-4 mt-2">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nome">Nome</Label>
                                <Input
                                    id="edit-nome"
                                    value={editData.nome}
                                    onChange={(e) => setEditData('nome', e.target.value)}
                                    placeholder="Ex: Conta corrente"
                                    disabled={editProcessing}
                                />
                                <InputError message={editErrors.nome} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-descricao">Descrição</Label>
                                <Input
                                    id="edit-descricao"
                                    value={editData.descricao}
                                    onChange={(e) => setEditData('descricao', e.target.value)}
                                    placeholder="Opcional"
                                    disabled={editProcessing}
                                />
                                <InputError message={editErrors.descricao} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="edit-padrao"
                                    checked={!!editData.padrao}
                                    onCheckedChange={(checked) => setEditData('padrao', checked === true)}
                                    disabled={editProcessing}
                                />
                                <Label htmlFor="edit-padrao">Definir como conta padrão</Label>
                            </div>
                            <InputError message={editErrors.padrao} />

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary" type="button" disabled={editProcessing}>
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit" className="ml-2" disabled={editProcessing}>
                                    Salvar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete confirmation */}
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar exclusão</DialogTitle>
                            <DialogDescription>Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button variant="destructive" className="ml-2" onClick={doDelete}>
                                Excluir
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Deferred data="contas" fallback={<AccountsSkeleton />}>
                    {contas && contas.length > 0 ? (
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {contas.map((acc: any) => (
                                    <Card
                                        key={acc.id}
                                        className="bg-white dark:bg-slate-900 border border-sidebar-border/70 flex flex-col justify-between"
                                    >
                                        <CardHeader className="relative flex flex-row items-center justify-between gap-4 p-6 flex-nowrap">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <Avatar>
                                                    <AvatarFallback className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                                                        {(acc.nome ?? acc.name ?? '')?.charAt(0) ?? '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <CardTitle className="text-base truncate">{acc.nome ?? acc.name}</CardTitle>
                                                        {Number(acc.padrao ?? 0) === 1 && (
                                                            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                                                                Padrão
                                                            </span>
                                                        )}
                                                    </div>
                                                    <CardDescription className="text-xs truncate">{acc.descricao ?? acc.type}</CardDescription>
                                                </div>
                                            </div>
                                            <div className="absolute right-4 top-4 flex-shrink-0">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Ações</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => openEdit(acc)}>Editar</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => confirmDelete(acc)}>Excluir</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="p-6 pt-0">
                                            <div className="mt-2">
                                                <div className="text-2xl font-semibold">{formatCurrency(acc.balance ?? 0)}</div>
                                                <div className="mt-2 text-sm text-muted-foreground">Saldo atualizado hoje</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <AccountsEmpty onAdd={() => setOpen(true)} />
                        )
                    }
                </Deferred>
            </div>
        </AppLayout>
    );
}
