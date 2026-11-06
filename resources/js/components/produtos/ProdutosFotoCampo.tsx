import InputError from '@/components/input-error';
import { FormDialogField } from '@/components/ui/form-dialog-correcao';
import { Label } from '@/components/ui/label';
import { Camera, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    /** Foto já salva no produto (some quando o usuário marca para remover). */
    fotoAtualUrl: string | null;
    arquivo: File | null;
    erro?: string;
    disabled?: boolean;
    onEscolher: (arquivo: File) => void;
    onRemover: () => void;
};

const ACEITOS = 'image/png,image/jpeg,image/webp';
/** Mesmo limite do backend (`max:2048`); acima disso o PHP pode descartar o POST inteiro. */
const TAMANHO_MAXIMO = 2 * 1024 * 1024;

/** Campo `foto` do formulário de produto: miniatura 4:3, trocar e remover. Envia junto com o formulário. */
export default function ProdutosFotoCampo({ fotoAtualUrl, arquivo, erro, disabled = false, onEscolher, onRemover }: Props) {
    const [previa, setPrevia] = useState<string | null>(null);
    const [erroLocal, setErroLocal] = useState<string | null>(null);

    useEffect(() => {
        if (!arquivo) {
            setPrevia(null);
            return;
        }

        const url = URL.createObjectURL(arquivo);
        setPrevia(url);

        return () => URL.revokeObjectURL(url);
    }, [arquivo]);

    const imagem = previa ?? fotoAtualUrl;

    const seletor = (
        <input
            id="produto_foto"
            type="file"
            accept={ACEITOS}
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
                const escolhido = event.target.files?.[0];
                event.target.value = '';
                if (!escolhido) {
                    return;
                }
                if (escolhido.size > TAMANHO_MAXIMO) {
                    setErroLocal('A foto deve ter no máximo 2 MB.');
                    return;
                }
                setErroLocal(null);
                onEscolher(escolhido);
            }}
        />
    );

    return (
        <FormDialogField name="foto">
            <Label htmlFor="produto_foto">Foto</Label>
            {imagem ? (
                <Preenchido imagem={imagem} nome={arquivo?.name ?? 'Foto atual'} disabled={disabled} seletor={seletor} onRemover={onRemover} />
            ) : (
                <Vazio seletor={seletor} />
            )}
            <InputError message={erroLocal ?? erro} />
        </FormDialogField>
    );
}

function Vazio({ seletor }: { seletor: React.ReactNode }) {
    return (
        <label className="relative flex cursor-pointer items-center gap-3.5 rounded-lg border-[1.5px] border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-600 hover:border-blue-600 hover:bg-blue-50 dark:border-slate-600 dark:bg-slate-800">
            {seletor}
            <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700" aria-hidden="true">
                <Camera className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold">Adicionar foto</span>
                <span className="text-muted-foreground text-xs">JPG, PNG ou WEBP, até 2 MB. Aparece no Menu Board.</span>
            </span>
        </label>
    );
}

type PreenchidoProps = { imagem: string; nome: string; disabled: boolean; seletor: React.ReactNode; onRemover: () => void };

function Preenchido({ imagem, nome, disabled, seletor, onRemover }: PreenchidoProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
            <img src={imagem} alt="Foto do produto" className="h-12 w-16 shrink-0 rounded-md bg-slate-100 object-cover" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{nome}</span>
            <label className="hover:bg-accent relative inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-sm font-medium focus-within:ring-2 focus-within:ring-blue-600 md:h-9">
                {seletor}
                <Upload className="size-4" aria-hidden="true" />
                Trocar
            </label>
            <button
                type="button"
                aria-label="Remover foto"
                disabled={disabled}
                onClick={onRemover}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border text-red-700 hover:bg-red-50 md:size-9 dark:text-red-400 dark:hover:bg-red-950/40"
            >
                <Trash2 className="size-4" aria-hidden="true" />
            </button>
        </div>
    );
}
