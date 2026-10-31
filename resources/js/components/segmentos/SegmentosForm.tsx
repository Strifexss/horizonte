import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { type FormEventHandler, useEffect } from 'react';
import type { ModuloOpcional, Segmento } from './types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    segmento: Segmento | null;
    storeUrl: string;
    catalogo: ModuloOpcional[];
    obrigatorios: string[];
};

type SegmentoFormData = {
    nome: string;
    descricao: string;
    modulos: string[];
    ativo: boolean;
};

export default function SegmentosForm({ open, onOpenChange, segmento, storeUrl, catalogo, obrigatorios }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<SegmentoFormData>({
        nome: '',
        descricao: '',
        modulos: [],
        ativo: true,
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        clearErrors();
        setData({
            nome: segmento?.nome ?? '',
            descricao: segmento?.descricao ?? '',
            modulos: segmento?.modulos ?? [],
            ativo: segmento?.ativo ?? true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, segmento]);

    const fechar = (): void => {
        onOpenChange(false);
        reset();
    };

    const alternarModulo = (chave: string, incluido: boolean): void => {
        setData('modulos', incluido ? [...data.modulos, chave] : data.modulos.filter((modulo) => modulo !== chave));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (segmento?.urls) {
            put(segmento.urls.update, { preserveScroll: true, onSuccess: fechar });
            return;
        }

        post(storeUrl, { preserveScroll: true, onSuccess: fechar });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100dvh] w-[100vw] overflow-y-auto md:h-auto md:max-h-[90vh] md:w-[700px] md:max-w-full">
                <div className="flex h-full flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>{segmento ? 'Editar segmento' : 'Adicionar segmento'}</DialogTitle>
                        <DialogDescription>O segmento define quais módulos opcionais as empresas dele recebem.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="segmento-nome">Nome</Label>
                            <Input
                                id="segmento-nome"
                                value={data.nome}
                                onChange={(e) => setData('nome', e.target.value)}
                                maxLength={80}
                                disabled={processing}
                            />
                            <InputError message={errors.nome} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="segmento-descricao">Descrição</Label>
                            <Input
                                id="segmento-descricao"
                                value={data.descricao}
                                onChange={(e) => setData('descricao', e.target.value)}
                                maxLength={255}
                                placeholder="Aparece no onboarding"
                                disabled={processing}
                            />
                            <InputError message={errors.descricao} />
                        </div>

                        <fieldset className="grid gap-3">
                            <legend className="mb-2 text-sm font-medium">Módulos opcionais</legend>
                            {catalogo.map((modulo) => (
                                <label key={modulo.chave} className="border-input flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                                    <Checkbox
                                        checked={data.modulos.includes(modulo.chave)}
                                        onCheckedChange={(marcado) => alternarModulo(modulo.chave, marcado === true)}
                                        disabled={processing}
                                        className="mt-0.5"
                                    />
                                    <span className="flex flex-col">
                                        <span className="text-sm font-medium">{modulo.nome}</span>
                                        <span className="text-muted-foreground text-xs">{modulo.descricao}</span>
                                    </span>
                                </label>
                            ))}
                            <InputError message={errors.modulos} />
                        </fieldset>

                        <div className="grid gap-2">
                            <p className="text-sm font-medium">Sempre incluídos</p>
                            <ul className="text-muted-foreground grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                                {obrigatorios.map((modulo) => (
                                    <li key={modulo} className="flex items-center gap-1.5">
                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                        {modulo}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <label className="flex items-center gap-3 text-sm">
                            <Checkbox checked={data.ativo} onCheckedChange={(marcado) => setData('ativo', marcado === true)} disabled={processing} />
                            Ativo (aparece no onboarding)
                        </label>

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
