import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { ImagePlus, Undo2, X } from 'lucide-react';
import { type FormEventHandler, useEffect, useMemo, useRef } from 'react';
import { formatarTamanho } from './formatarTamanho';
import { CATEGORIAS_NOVIDADE, type Novidade, type NovidadeCategoria } from './types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    novidade: Novidade | null;
    storeUrl: string;
};

type NovidadeFormData = {
    titulo: string;
    descricao: string;
    categoria: NovidadeCategoria | '';
    cta_url: string;
    popup_automatico: boolean;
    imagens: File[];
    remover_imagens: number[];
};

const VAZIO: NovidadeFormData = {
    titulo: '',
    descricao: '',
    categoria: '',
    cta_url: '',
    popup_automatico: false,
    imagens: [],
    remover_imagens: [],
};

export default function NovidadesForm({ open, onOpenChange, novidade, storeUrl }: Props) {
    const { data, setData, post, transform, processing, errors, clearErrors } = useForm<NovidadeFormData>(VAZIO);
    const seletorDeArquivos = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        clearErrors();
        setData({
            titulo: novidade?.titulo ?? '',
            descricao: novidade?.descricao ?? '',
            categoria: novidade?.categoria ?? '',
            cta_url: novidade?.cta_url ?? '',
            popup_automatico: novidade?.popup_automatico ?? false,
            imagens: [],
            remover_imagens: [],
        });
        // setData/clearErrors vêm do useForm e são estáveis o bastante para este reset de abertura.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, novidade]);

    const previas = useMemo(() => data.imagens.map((arquivo) => URL.createObjectURL(arquivo)), [data.imagens]);

    useEffect(() => () => previas.forEach((url) => URL.revokeObjectURL(url)), [previas]);

    const tamanhoDasNovas = data.imagens.reduce((total, arquivo) => total + arquivo.size, 0);
    const erroDeImagem = Object.entries(errors).find(([campo]) => campo === 'imagens' || campo.startsWith('imagens.'))?.[1];

    function adicionarArquivos(arquivos: FileList | null): void {
        if (!arquivos || arquivos.length === 0) {
            return;
        }

        setData('imagens', [...data.imagens, ...Array.from(arquivos)]);

        if (seletorDeArquivos.current) {
            seletorDeArquivos.current.value = '';
        }
    }

    function tirarArquivo(indice: number): void {
        setData(
            'imagens',
            data.imagens.filter((_, atual) => atual !== indice),
        );
    }

    function alternarRemocao(id: number): void {
        setData(
            'remover_imagens',
            data.remover_imagens.includes(id) ? data.remover_imagens.filter((atual) => atual !== id) : [...data.remover_imagens, id],
        );
    }

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        const options = { preserveScroll: true, forceFormData: true, onSuccess: () => onOpenChange(false) };

        if (novidade) {
            // Laravel não lê multipart em PUT: o form vai por POST com `_method` e cai na rota PUT.
            transform((dados) => ({ ...dados, _method: 'put' }));
            post(novidade.urls.update, options);
            return;
        }

        transform((dados) => dados);
        post(storeUrl, options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[100vh] w-[100vw] overflow-hidden md:h-auto md:w-[700px] md:max-w-full">
                <div className="flex h-full min-h-0 flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>{novidade ? 'Editar novidade' : 'Nova novidade'}</DialogTitle>
                        <DialogDescription>
                            {novidade
                                ? 'As mudanças valem para quem abrir a novidade depois.'
                                : 'A novidade nasce como rascunho; publique pela lista.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto md:max-h-[70vh]" noValidate>
                        <div className="grid gap-2">
                            <Label htmlFor="novidade_titulo">Título</Label>
                            <Input
                                id="novidade_titulo"
                                value={data.titulo}
                                onChange={(event) => setData('titulo', event.target.value)}
                                maxLength={150}
                                disabled={processing}
                                autoFocus
                            />
                            <InputError message={errors.titulo} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="novidade_descricao">Descrição</Label>
                            <textarea
                                id="novidade_descricao"
                                value={data.descricao}
                                onChange={(event) => setData('descricao', event.target.value)}
                                rows={5}
                                maxLength={5000}
                                disabled={processing}
                                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                            <InputError message={errors.descricao} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="novidade_categoria">Categoria</Label>
                            <Select
                                value={data.categoria}
                                onValueChange={(valor) => setData('categoria', valor as NovidadeCategoria)}
                                disabled={processing}
                            >
                                <SelectTrigger id="novidade_categoria">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(CATEGORIAS_NOVIDADE) as NovidadeCategoria[]).map((categoria) => (
                                        <SelectItem key={categoria} value={categoria}>
                                            {CATEGORIAS_NOVIDADE[categoria]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.categoria} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="novidade_imagens">Imagens (opcional)</Label>

                            {novidade && novidade.imagens.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {novidade.imagens.map((imagem) => {
                                        const marcada = data.remover_imagens.includes(imagem.id);

                                        return (
                                            <div key={imagem.id} className="relative">
                                                <img
                                                    src={imagem.url}
                                                    alt="Imagem atual"
                                                    className={`aspect-square w-full rounded-md border object-cover ${marcada ? 'opacity-30' : ''}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => alternarRemocao(imagem.id)}
                                                    disabled={processing}
                                                    aria-label={marcada ? 'Manter imagem' : 'Remover imagem'}
                                                    className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-slate-700 shadow hover:bg-white dark:bg-slate-900/90 dark:text-slate-200"
                                                >
                                                    {marcada ? <Undo2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                                </button>
                                                {marcada ? (
                                                    <span className="absolute inset-x-0 bottom-1 text-center text-[10px] font-medium text-red-600">
                                                        Será removida
                                                    </span>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}

                            {previas.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {previas.map((url, indice) => (
                                        <div key={url} className="relative">
                                            <img
                                                src={url}
                                                alt="Nova imagem"
                                                className="aspect-square w-full rounded-md border border-blue-500 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => tirarArquivo(indice)}
                                                disabled={processing}
                                                aria-label="Tirar imagem"
                                                className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-slate-700 shadow hover:bg-white dark:bg-slate-900/90 dark:text-slate-200"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                            <span className="absolute inset-x-0 bottom-1 text-center text-[10px] font-medium text-blue-700">
                                                Nova
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : null}

                            <input
                                ref={seletorDeArquivos}
                                id="novidade_imagens"
                                type="file"
                                multiple
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                className="hidden"
                                onChange={(event) => adicionarArquivos(event.target.files)}
                                disabled={processing}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="inline-flex items-center gap-2 self-start"
                                onClick={() => seletorDeArquivos.current?.click()}
                                disabled={processing}
                            >
                                <ImagePlus className="h-4 w-4" />
                                Adicionar imagens
                            </Button>
                            <p className="text-muted-foreground text-xs">
                                JPG, PNG, WEBP ou GIF, até 2 MB cada e 20 por vez.
                                {data.imagens.length > 0
                                    ? ` ${data.imagens.length} ${data.imagens.length === 1 ? 'nova selecionada' : 'novas selecionadas'} (${formatarTamanho(tamanhoDasNovas)}).`
                                    : ''}
                            </p>
                            <InputError message={erroDeImagem} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="novidade_cta_url">Link do botão (opcional)</Label>
                            <Input
                                id="novidade_cta_url"
                                type="url"
                                value={data.cta_url}
                                onChange={(event) => setData('cta_url', event.target.value)}
                                placeholder="https://"
                                disabled={processing}
                            />
                            <InputError message={errors.cta_url} />
                        </div>

                        <div className="grid gap-1">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="novidade_popup"
                                    checked={data.popup_automatico}
                                    onCheckedChange={(checked) => setData('popup_automatico', checked === true)}
                                    disabled={processing}
                                />
                                <Label htmlFor="novidade_popup">Abrir em pop-up automático</Label>
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Depois de publicada, abre sozinha para cada usuário até ele marcar &quot;Não mostrar novamente&quot;.
                            </p>
                        </div>

                        <DialogFooter className="mt-auto flex flex-row gap-2">
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
