import AccountsEmpty from '@/components/contas/AccountsEmpty';
import AccountsSkeleton from '@/components/contas/AccountsSkeleton';
import ContasForm from '@/components/contas/ContasForm';
import InputError from '@/components/input-error';
import { PageTitle } from '@/components/padrões';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Deferred, Head, useForm } from '@inertiajs/react';
import { MoreHorizontal, Plus } from 'lucide-react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contas e bancos',
        href: '/contas',
    },
];

type Account = {
    id: number | string;
    nome?: string | null;
    name?: string | null;
    descricao?: string | null;
    type?: string | null;
    balance?: number;
    padrao?: number | string | null;
};

type EditAccountForm = {
    nome: string;
    descricao: string;
    padrao: boolean;
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function Contas({ contas = [] }: { contas?: Account[] }) {
    const [open, setOpen] = React.useState(false);
    const [editOpen, setEditOpen] = React.useState(false);
    const [editingAccount, setEditingAccount] = React.useState<Account | null>(null);
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [accountToDelete, setAccountToDelete] = React.useState<Account | null>(null);

    const {
        data: editData,
        setData: setEditData,
        put,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm<EditAccountForm>({
        nome: '',
        descricao: '',
        padrao: false,
    });

    const { delete: destroy } = useForm({});

    const openEdit = (acc: Account) => {
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

    const confirmDelete = (acc: Account) => {
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
                        <Button variant="primary" size="default" className="inline-flex items-center gap-2" onClick={() => setOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Adicionar conta
                        </Button>
                    }
                />

                <ContasForm open={open} onOpenChange={setOpen} />

                {/* Edit dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent className="flex h-[100dvh] max-w-full flex-col overflow-hidden md:h-auto md:w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Editar conta</DialogTitle>
                            <DialogDescription>Atualize os dados da conta.</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={submitEdit} className="mt-2 grid gap-4">
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
                    <DialogContent className="flex max-w-full flex-col overflow-hidden md:h-auto md:w-[500px]">
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
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {contas.map((acc) => (
                                <Card
                                    key={acc.id}
                                    className="border-sidebar-border/70 flex flex-col justify-between border bg-white dark:bg-slate-900"
                                >
                                    <CardHeader className="relative flex flex-row flex-nowrap items-center justify-between gap-4 p-6">
                                        <div className="flex min-w-0 flex-1 items-center gap-4">
                                            <Avatar>
                                                <AvatarFallback className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                                                    {(acc.nome ?? acc.name ?? '')?.charAt(0) ?? '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <CardTitle className="truncate text-base">{acc.nome ?? acc.name}</CardTitle>
                                                    {Number(acc.padrao ?? 0) === 1 && (
                                                        <span className="bg-muted text-muted-foreground shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase">
                                                            Padrão
                                                        </span>
                                                    )}
                                                </div>
                                                <CardDescription className="truncate text-xs">{acc.descricao ?? acc.type}</CardDescription>
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 flex-shrink-0">
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
                                            <div className="text-muted-foreground mt-2 text-sm">Saldo atualizado hoje</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <AccountsEmpty onAdd={() => setOpen(true)} />
                    )}
                </Deferred>
            </div>
        </AppLayout>
    );
}
