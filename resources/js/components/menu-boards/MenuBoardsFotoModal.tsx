import InputError from '@/components/input-error';
import { formatarPreco, type ProdutoDoBoard } from '@/components/menu-boards/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { router, useForm } from '@inertiajs/react';
import { Camera, Trash2, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Props = {
    produto: ProdutoDoBoard | null;
    onOpenChange: (open: boolean) => void;
};

type FotoFormValues = {
    foto: File | null;
};

export default function MenuBoardsFotoModal({ produto, onOpenChange }: Props) {
    const [removendo, setRemovendo] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<FotoFormValues>({ foto: null });

    useEffect(() => {
        reset();
        clearErrors();
        // reset/clearErrors vêm do useForm; o efeito só deve rodar ao trocar de produto.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [produto?.id]);

    const previa = useMemo(() => (data.foto ? URL.createObjectURL(data.foto) : null), [data.foto]);

    useEffect(() => {
        return () => {
            if (previa) {
                URL.revokeObjectURL(previa);
            }
        };
    }, [previa]);

    const imagem = previa ?? produto?.foto_url ?? null;

    function salvar(): void {
        if (!produto || !data.foto) {
            return;
        }

        post(route('produtos.foto.store', produto.id), {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => onOpenChange(false),
        });
    }

    function remover(): void {
        if (!produto) {
            return;
        }

        router.delete(route('produtos.foto.destroy', produto.id), {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setRemovendo(true),
            onFinish: () => setRemovendo(false),
            onSuccess: () => onOpenChange(false),
        });
    }

    const seletor = (
        <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
                clearErrors();
                setData('foto', event.target.files?.[0] ?? null);
            }}
        />
    );

    return (
        <Dialog open={produto !== null} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:w-[760px] md:max-w-full">
                <DialogHeader>
                    <DialogTitle>Foto do produto</DialogTitle>
                    <DialogDescription>{produto?.nome}</DialogDescription>
                </DialogHeader>

                <div className="flex h-full flex-col gap-6 overflow-y-auto md:flex-row">
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        {imagem ? (
                            <img
                                src={imagem}
                                alt={`Prévia da foto de ${produto?.nome ?? ''}`}
                                className="aspect-[4/3] w-full rounded-lg bg-slate-100 object-cover"
                            />
                        ) : (
                            <label className="text-muted-foreground relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-dashed border-slate-300 bg-slate-50 p-4 text-center focus-within:ring-2 focus-within:ring-amber-500 hover:border-amber-500 hover:bg-amber-50 dark:bg-slate-800">
                                {seletor}
                                <span className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                    <Camera className="size-5" />
                                </span>
                                <span className="text-foreground font-semibold">Tirar Foto ou Escolher Imagem</span>
                                <span className="text-xs">JPG, PNG ou WEBP, até 2 MB. Proporção 4:3 recomendada.</span>
                            </label>
                        )}

                        <InputError message={errors.foto} />

                        {imagem ? (
                            <div className="grid grid-cols-2 gap-2">
                                <label className="bg-background hover:bg-accent relative inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border text-sm font-medium focus-within:ring-2 focus-within:ring-amber-500 md:h-10">
                                    {seletor}
                                    <Upload className="size-4" />
                                    Trocar Imagem
                                </label>
                                {produto?.foto_url && !previa ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-11 text-red-600 md:h-10"
                                        loading={removendo}
                                        onClick={remover}
                                    >
                                        <Trash2 />
                                        Remover Foto
                                    </Button>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <div className="flex min-w-0 flex-col gap-2 md:w-64">
                        <span className="text-muted-foreground text-xs font-semibold">PRÉVIA NA TV</span>
                        <div className="rounded-lg bg-[#070d1a] p-3">
                            <div className="overflow-hidden rounded-lg border border-amber-500/35 bg-[#0f1d33] text-white">
                                {imagem ? <img src={imagem} alt="" className="h-24 w-full object-cover" /> : null}
                                <div className="flex flex-col gap-0.5 px-3 py-2.5">
                                    <span className="text-sm font-semibold">{produto?.nome}</span>
                                    {produto?.descricao ? <span className="text-[11px] text-[#a3b3c9]">{produto.descricao}</span> : null}
                                    <span className="mt-1 text-lg font-bold text-amber-400">{formatarPreco(produto?.preco_venda ?? 0)}</span>
                                </div>
                            </div>
                        </div>
                        <span className="text-muted-foreground text-xs">
                            Em destaque a foto ocupa o topo do card; nos itens padrão vira miniatura.
                        </span>
                    </div>
                </div>

                <DialogFooter className="flex flex-row gap-2">
                    <Button type="button" variant="secondary" className="w-full md:w-auto" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        className="w-full justify-center md:w-auto"
                        disabled={!data.foto}
                        loading={processing}
                        onClick={salvar}
                    >
                        Salvar Foto
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
