import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Building2, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

/** Cliente antigo confirma o nome oficial da Empresa criada na migração; só fecha salvando. */
export default function EmpresaNomeModal() {
    const empresa = usePage<SharedData>().props.empresa;
    const { data, setData, put, processing, errors } = useForm({ nome: empresa?.nome ?? '' });

    if (!empresa || empresa.nome_confirmado) {
        return null;
    }

    const salvar: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('empresa.nome.update'), { preserveScroll: true });
    };

    return (
        <Dialog open>
            <DialogContent
                className="max-w-[calc(100%-2rem)] sm:max-w-md [&>button:last-child]:hidden"
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <form onSubmit={salvar} className="flex flex-col gap-5">
                    <DialogHeader className="gap-3 text-left">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                            <Building2 className="size-5 text-blue-600" />
                        </span>
                        <DialogTitle>Agora o Horizonte é da sua empresa</DialogTitle>
                        <DialogDescription>Seus dados continuam todos aqui. Só falta dizer o nome oficial do seu negócio.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="nome-empresa">Nome do negócio</Label>
                        <Input
                            id="nome-empresa"
                            value={data.nome}
                            onChange={(e) => setData('nome', e.target.value)}
                            maxLength={120}
                            autoFocus
                            required
                        />
                        <InputError message={errors.nome} />
                    </div>

                    <Button type="submit" variant="primary" className="w-full justify-center" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Salvar nome
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
