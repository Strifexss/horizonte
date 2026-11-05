import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { FormDialogBody, FormDialogCancel, FormDialogContent, FormDialogFooter, FormDialogForm, FormDialogHeader } from '@/components/ui/form-dialog';
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
            <FormDialogContent>
                <FormDialogHeader
                    title={mode === 'edit' ? 'Editar usuário' : 'Adicionar usuário'}
                    description={mode === 'edit' ? 'Deixe a senha em branco para manter a atual.' : 'Preencha os dados do novo usuário.'}
                />

                <FormDialogForm onSubmit={submit}>
                    <FormDialogBody>
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
                    </FormDialogBody>

                    <FormDialogFooter className="md:justify-end">
                        <FormDialogCancel className="w-full md:w-auto" disabled={processing} />
                        <Button type="submit" variant="confirm" className="w-full md:w-auto" disabled={processing}>
                            Salvar
                        </Button>
                    </FormDialogFooter>
                </FormDialogForm>
            </FormDialogContent>
        </Dialog>
    );
}
