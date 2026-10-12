import InputError from '@/components/input-error';
import AsyncSelect from '@/components/ui/AsyncSelect';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import type { UsuariosUrls } from './types';

type UsuarioOpcao = { id: number | string; nome: string };

type Modulo = 'produtos' | 'fornecedores';

type Contagens = Partial<Record<Modulo, number>>;

type TransferForm = {
    origem_id: number | null;
    destino_id: number | null;
    modulos: Modulo[];
    migrar_relacionamentos: boolean;
    confirmacao: boolean;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    urls: Pick<UsuariosUrls, 'autocomplete' | 'transfer' | 'transfer_counts'>;
};

const MODULOS: { valor: Modulo; rotulo: string }[] = [
    { valor: 'produtos', rotulo: 'Produtos' },
    { valor: 'fornecedores', rotulo: 'Fornecedores' },
];

const ERRO_MESMO_USUARIO = 'O usuário de destino não pode ser igual ao de origem';

export default function UsuariosTransferModal({ open, onOpenChange, urls }: Props) {
    const [origem, setOrigem] = useState<UsuarioOpcao | null>(null);
    const [destino, setDestino] = useState<UsuarioOpcao | null>(null);
    const [erroDestino, setErroDestino] = useState<string | null>(null);
    const [contagens, setContagens] = useState<Contagens>({});

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<TransferForm>({
        origem_id: null,
        destino_id: null,
        modulos: [],
        migrar_relacionamentos: false,
        confirmacao: false,
    });

    useEffect(() => {
        if (!open) {
            return;
        }
        reset();
        clearErrors();
        setOrigem(null);
        setDestino(null);
        setErroDestino(null);
        setContagens({});
    }, [open]);

    useEffect(() => {
        if (!origem) {
            setContagens({});
            return;
        }
        fetch(urls.transfer_counts.replace('__ID__', String(origem.id)))
            .then((res) => (res.ok ? res.json() : {}))
            .then((json: Contagens) => setContagens(json))
            .catch(() => setContagens({}));
    }, [origem, urls.transfer_counts]);

    const loadUsuarios = async (q: string = ''): Promise<UsuarioOpcao[]> => {
        const res = await fetch(`${urls.autocomplete}?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
            return [];
        }
        return res.json();
    };

    function selecionarOrigem(opcao: UsuarioOpcao | null): void {
        setOrigem(opcao);
        setData('origem_id', opcao ? Number(opcao.id) : null);

        if (opcao && destino && String(opcao.id) === String(destino.id)) {
            setDestino(null);
            setData('destino_id', null);
            setErroDestino(ERRO_MESMO_USUARIO);
            return;
        }
        setErroDestino(null);
    }

    function selecionarDestino(opcao: UsuarioOpcao | null): void {
        if (opcao && origem && String(opcao.id) === String(origem.id)) {
            setDestino(null);
            setData('destino_id', null);
            setErroDestino(ERRO_MESMO_USUARIO);
            return;
        }
        setErroDestino(null);
        setDestino(opcao);
        setData('destino_id', opcao ? Number(opcao.id) : null);
    }

    function alternarModulo(modulo: Modulo, marcado: boolean): void {
        setData('modulos', marcado ? [...data.modulos, modulo] : data.modulos.filter((m) => m !== modulo));
    }

    const usuariosSelecionados = origem !== null && destino !== null;
    const podeTransferir = usuariosSelecionados && data.modulos.length > 0 && data.confirmacao && !processing;

    function submit(e: FormEvent): void {
        e.preventDefault();
        if (!podeTransferir) {
            return;
        }
        post(urls.transfer, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100dvh] w-[100vw] overflow-hidden md:h-auto md:w-[700px] md:max-w-full">
                <DialogHeader>
                    <DialogTitle>Transferência de Dados entre Usuários</DialogTitle>
                    <DialogDescription>
                        Os dados selecionados são duplicados na conta de destino; a conta de origem continua com eles.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                    <div className="grid items-start gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Transferir de</Label>
                            <AsyncSelect
                                value={origem}
                                onChange={selecionarOrigem}
                                loadOptions={loadUsuarios}
                                placeholder="Buscar usuário de origem..."
                                isClearable
                            />
                            <InputError message={errors.origem_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Transferir para</Label>
                            <AsyncSelect
                                value={destino}
                                onChange={selecionarDestino}
                                loadOptions={loadUsuarios}
                                placeholder="Buscar usuário de destino..."
                                isClearable
                            />
                            <InputError message={erroDestino ?? errors.destino_id} />
                        </div>
                    </div>

                    {usuariosSelecionados && (
                        <div className="grid gap-3">
                            <Label>Módulos disponíveis</Label>
                            {MODULOS.map((modulo) => (
                                <div key={modulo.valor} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`modulo_${modulo.valor}`}
                                        checked={data.modulos.includes(modulo.valor)}
                                        onCheckedChange={(marcado) => alternarModulo(modulo.valor, marcado === true)}
                                    />
                                    <Label htmlFor={`modulo_${modulo.valor}`} className="font-normal">
                                        {modulo.rotulo} ({contagens[modulo.valor] ?? '—'})
                                    </Label>
                                </div>
                            ))}
                            <InputError message={errors.modulos} />

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="migrar_relacionamentos"
                                    checked={data.migrar_relacionamentos}
                                    onCheckedChange={(marcado) => setData('migrar_relacionamentos', marcado === true)}
                                />
                                <Label htmlFor="migrar_relacionamentos" className="font-normal">
                                    Manter/Migrar relacionamentos associados (ex.: fornecedor do produto)
                                </Label>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="confirmacao"
                            checked={data.confirmacao}
                            onCheckedChange={(marcado) => setData('confirmacao', marcado === true)}
                        />
                        <Label htmlFor="confirmacao" className="font-normal">
                            Estou ciente de que esta ação duplicará os dados selecionados na conta de destino
                        </Label>
                    </div>
                    <InputError message={errors.confirmacao} />

                    <DialogFooter className="mt-auto flex flex-row gap-2">
                        <DialogClose asChild>
                            <Button className="w-full" variant="secondary" type="button" disabled={processing}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button className="w-full" type="submit" variant="confirm" disabled={!podeTransferir}>
                            Confirmar e Transferir
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
