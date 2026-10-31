import InputError from '@/components/input-error';
import type { ModuloOpcional, Segmento } from '@/components/segmentos/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { type FormEventHandler, useEffect } from 'react';
import type { EmpresaAdmin, EstadoAjuste } from './types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    empresa: EmpresaAdmin | null;
    segmentos: Segmento[];
    catalogo: ModuloOpcional[];
};

type EmpresaModulosFormData = {
    segmento_id: number | '';
    ajustes: Record<string, EstadoAjuste>;
};

const ESTADOS: { valor: EstadoAjuste; rotulo: string }[] = [
    { valor: 'herdar', rotulo: 'Do segmento' },
    { valor: 'ligar', rotulo: 'Ligado' },
    { valor: 'desligar', rotulo: 'Desligado' },
];

export default function EmpresaModulosForm({ open, onOpenChange, empresa, segmentos, catalogo }: Props) {
    const { data, setData, put, processing, errors, clearErrors } = useForm<EmpresaModulosFormData>({ segmento_id: '', ajustes: {} });

    useEffect(() => {
        if (!open || !empresa) {
            return;
        }

        clearErrors();
        setData({ segmento_id: empresa.segmento_id ?? '', ajustes: { ...empresa.ajustes } });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, empresa]);

    const segmentoEscolhido = segmentos.find((segmento) => segmento.id === data.segmento_id);

    const disponivel = (chave: string): boolean => {
        const estado = data.ajustes[chave] ?? 'herdar';

        return estado === 'herdar' ? (segmentoEscolhido?.modulos.includes(chave) ?? false) : estado === 'ligar';
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (empresa) {
            put(empresa.urls.update, { preserveScroll: true, onSuccess: () => onOpenChange(false) });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100dvh] w-[100vw] overflow-y-auto md:h-auto md:max-h-[90vh] md:w-[700px] md:max-w-full">
                <div className="flex h-full flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>{empresa?.nome}</DialogTitle>
                        <DialogDescription>Escolha o segmento e, se precisar, ligue ou desligue módulos só para esta empresa.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="empresa-segmento">Segmento</Label>
                            <select
                                id="empresa-segmento"
                                value={data.segmento_id}
                                onChange={(e) => setData('segmento_id', Number(e.target.value))}
                                disabled={processing}
                                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                            >
                                {segmentos.map((segmento) => (
                                    <option key={segmento.id} value={segmento.id}>
                                        {segmento.nome}
                                        {segmento.ativo ? '' : ' (inativo)'}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.segmento_id} />
                        </div>

                        <fieldset className="grid gap-3">
                            <legend className="mb-2 text-sm font-medium">Módulos opcionais</legend>
                            {catalogo.map((modulo) => (
                                <div
                                    key={modulo.chave}
                                    className="border-input flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex flex-col">
                                        <span className="flex items-center gap-2 text-sm font-medium">
                                            {modulo.nome}
                                            <span
                                                className={cn(
                                                    'rounded-full px-2 py-0.5 text-xs font-medium',
                                                    disponivel(modulo.chave)
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
                                                )}
                                            >
                                                {disponivel(modulo.chave) ? 'Disponível' : 'Indisponível'}
                                            </span>
                                        </span>
                                        <span className="text-muted-foreground text-xs">{modulo.descricao}</span>
                                    </div>
                                    <div role="radiogroup" aria-label={`Ajuste de ${modulo.nome}`} className="bg-muted inline-flex rounded-md p-0.5">
                                        {ESTADOS.map((estado) => {
                                            const marcado = (data.ajustes[modulo.chave] ?? 'herdar') === estado.valor;

                                            return (
                                                <button
                                                    key={estado.valor}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={marcado}
                                                    onClick={() => setData('ajustes', { ...data.ajustes, [modulo.chave]: estado.valor })}
                                                    disabled={processing}
                                                    className={cn(
                                                        'h-8 rounded px-2.5 text-xs font-medium',
                                                        marcado ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {estado.rotulo}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            <InputError message={errors.ajustes} />
                        </fieldset>

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
