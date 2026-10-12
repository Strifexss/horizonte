import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { type FormEventHandler, useEffect } from 'react';
import type { Usuario } from './types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    usuario: Usuario | null;
    storeUrl: string;
};

type UsuarioFormData = {
    name: string;
    email: string;
    password: string;
};

export default function UsuariosForm({ open, onOpenChange, mode, usuario, storeUrl }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<UsuarioFormData>({
        name: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        clearErrors();
        setData({
            name: mode === 'edit' ? (usuario?.name ?? '') : '',
            email: mode === 'edit' ? (usuario?.email ?? '') : '',
            password: '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, usuario]);

    const fechar = (): void => {
        onOpenChange(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (mode === 'edit' && usuario) {
            put(usuario.urls.update, { preserveScroll: true, onSuccess: fechar });
            return;
        }

        post(storeUrl, { preserveScroll: true, onSuccess: fechar });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100dvh] w-[100vw] overflow-hidden md:h-auto md:w-[700px] md:max-w-full">
                <div className="flex h-full flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>{mode === 'edit' ? 'Editar usuário' : 'Adicionar usuário'}</DialogTitle>
                        <DialogDescription>
                            {mode === 'edit' ? 'Deixe a senha em branco para manter a atual.' : 'Preencha os dados do novo usuário.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="usuario-name">Nome</Label>
                            <Input
                                id="usuario-name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                autoComplete="off"
                                disabled={processing}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="usuario-email">E-mail</Label>
                            <Input
                                id="usuario-email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="off"
                                disabled={processing}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="usuario-password">{mode === 'edit' ? 'Nova senha' : 'Senha'}</Label>
                            <Input
                                id="usuario-password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="new-password"
                                placeholder={mode === 'edit' ? 'Opcional' : ''}
                                disabled={processing}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <DialogFooter className="flex flex-row gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary" type="button" className="w-full md:w-auto" disabled={processing}>
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" variant="confirm" className="w-full md:w-auto" disabled={processing}>
                                Salvar
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
