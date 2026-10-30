import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthHorizonteLayout from '@/layouts/auth/auth-horizonte-layout';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type Modulo = 'varejo' | 'restaurante';

const MODULOS: { valor: Modulo; nome: string; descricao: string }[] = [
    { valor: 'varejo', nome: 'Varejo', descricao: 'Loja, mercado, comércio em geral' },
    { valor: 'restaurante', nome: 'Restaurante', descricao: 'Restaurante, lanchonete, padaria. Inclui Menu Board.' },
];

export default function Onboarding() {
    const [passo, setPasso] = useState<1 | 2>(1);
    const { data, setData, post, processing, errors } = useForm<{ nome: string; modulo: Modulo | '' }>({ nome: '', modulo: '' });

    const continuar: FormEventHandler = (e) => {
        e.preventDefault();

        if (data.nome.trim() !== '') {
            setPasso(2);
        }
    };

    const concluir: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('onboarding.store'), {
            onError: (erros) => erros.nome && setPasso(1),
        });
    };

    return (
        <AuthHorizonteLayout
            title={passo === 1 ? 'Qual o nome do seu negócio?' : 'Qual o seu ramo principal?'}
            description={
                passo === 1
                    ? 'É assim que sua empresa aparece no Horizonte. Dá para mudar depois.'
                    : 'Escolha o que mais se parece com o seu negócio.'
            }
            saudacao={passo === 1 ? 'Conta criada' : 'Quase lá'}
            destaque={passo === 1 ? 'VAMOS COMEÇAR' : 'SEU RAMO'}
            texto={passo === 1 ? 'Dois passos rápidos e você começa a usar.' : 'O ramo só define o que já vem ligado. Nada fica bloqueado por ele.'}
        >
            <Head title="Primeiros passos" />

            <div className="-mt-4 flex flex-col gap-2">
                <p className="text-center text-xs font-medium text-blue-600">Passo {passo} de 2</p>
                <div className="grid grid-cols-2 gap-1.5">
                    <span className="h-1 rounded-full bg-blue-600" />
                    <span className={cn('h-1 rounded-full', passo === 2 ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-700')} />
                </div>
            </div>

            {passo === 1 ? (
                <form onSubmit={continuar} className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="nome">Nome do negócio</Label>
                        <Input
                            id="nome"
                            value={data.nome}
                            onChange={(e) => setData('nome', e.target.value)}
                            placeholder="Ex.: Padaria Bom Dia"
                            maxLength={120}
                            autoFocus
                            required
                        />
                        <InputError message={errors.nome} />
                    </div>
                    <Button type="submit" className="w-full">
                        Continuar
                    </Button>
                </form>
            ) : (
                <form onSubmit={concluir} className="flex flex-col gap-6">
                    <fieldset className="flex flex-col gap-3">
                        <legend className="sr-only">Ramo</legend>
                        {MODULOS.map((modulo) => (
                            <label
                                key={modulo.valor}
                                className={cn(
                                    'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3',
                                    data.modulo === modulo.valor ? 'border-blue-600 bg-blue-50 dark:bg-blue-950' : 'border-input',
                                )}
                            >
                                <input
                                    type="radio"
                                    name="modulo"
                                    value={modulo.valor}
                                    checked={data.modulo === modulo.valor}
                                    onChange={() => setData('modulo', modulo.valor)}
                                    className="accent-blue-600"
                                />
                                <span className="flex flex-col">
                                    <span className="text-sm font-semibold">{modulo.nome}</span>
                                    <span className="text-muted-foreground text-xs">{modulo.descricao}</span>
                                </span>
                            </label>
                        ))}
                        <InputError message={errors.modulo} />
                    </fieldset>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                        <Button type="button" variant="outline" onClick={() => setPasso(1)} disabled={processing}>
                            Voltar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={processing || data.modulo === ''}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Começar a usar
                        </Button>
                    </div>
                </form>
            )}
        </AuthHorizonteLayout>
    );
}
